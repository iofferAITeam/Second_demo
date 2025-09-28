"""
RAG Agent with OpenAI Embeddings - Pure Retrieval Version
Uses text-embedding-3-large for generating embeddings and FAISS for similarity search.
Returns only retrieved context without LLM generation.
"""

from typing import List, Dict, Any, Optional
import faiss
import numpy as np
import os
import re
import pickle
import sys
from dotenv import load_dotenv
from openai import OpenAI

# Add the src path for importing settings
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
from src.settings import settings

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "../../../.env"))

# --- CONFIG ---
# RAG files are now in the data directory - use absolute paths for cross-directory compatibility
def get_data_path(filename):
    """Get absolute path to data file regardless of current working directory"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.join(current_dir, "../../../")
    data_dir = os.path.join(project_root, "data")
    return os.path.abspath(os.path.join(data_dir, filename))

QA_PAIRS_PATH = get_data_path('qa_pairs.pkl')
FAISS_INDEX_PATH = get_data_path('faiss.index')
EMBEDDINGS_PATH = get_data_path('embeddings.npy')
MAPPING_PATH = get_data_path('mapping.pkl')
EMBEDDING_MODEL_NAME = 'text-embedding-3-large'
EMBEDDING_DIMENSIONS = 3072  # text-embedding-3-large dimensions
TOP_K = 5  # Retrieve more candidates to filter
SIMILARITY_THRESHOLD = 1.5 # Max L2 distance. Lower is more similar. Increased for better recall.

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class RAGRetriever:
    """
    Pure RAG Retrieval Agent - returns only retrieved context without LLM generation
    """
    
    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.embedding_model = EMBEDDING_MODEL_NAME
        self.similarity_threshold = SIMILARITY_THRESHOLD
        self.top_k = TOP_K
        
        # Validate setup
        if not os.getenv("OPENAI_API_KEY"):
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        
        # Load RAG components
        self.qa_pairs = None
        self.index = None
        self.mapping = None
        self._load_rag_components()
    
    def _load_rag_components(self):
        """Load all RAG components"""
        try:
            if os.path.exists(QA_PAIRS_PATH) and os.path.exists(FAISS_INDEX_PATH) and os.path.exists(MAPPING_PATH):
                self.qa_pairs = load_qa_pairs(QA_PAIRS_PATH)
                self.index = load_faiss_index(FAISS_INDEX_PATH)
                self.mapping = load_mapping(MAPPING_PATH)
                print(f"✅ RAG components loaded: {len(self.qa_pairs)} QA pairs")
            else:
                raise FileNotFoundError("RAG components not found")
        except Exception as e:
            print(f"❌ Error loading RAG components: {e}")
            raise e
    
    def extract_entities(self, text: str) -> set:
        """Extract potential entities like school names"""
        pattern = r'\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b|[A-Z]{2,}'
        return set(re.findall(pattern, text))
    
    def retrieve_similar_questions(self, question: str, top_k: Optional[int] = None) -> List[Dict[str, Any]]:
        """Retrieve similar questions using OpenAI embeddings"""
        if top_k is None:
            top_k = self.top_k
            
        try:
            # Generate embedding for the query
            response = self.openai_client.embeddings.create(
                model=self.embedding_model,
                input=[question],
                encoding_format="float"
            )
            embedding = np.array([response.data[0].embedding], dtype=np.float32)
        except Exception as e:
            print(f"❌ Error generating query embedding: {e}")
            return []
        
        distances, indices = self.index.search(embedding, top_k)
        
        print(f"Retrieved distances: {distances[0]} (lower is better)")
        
        # Filter by similarity score (distance)
        similarity_filtered_results = []
        for i, dist in enumerate(distances[0]):
            if dist < self.similarity_threshold:
                qa_pair = self.mapping[indices[0][i]]
                similarity_score = 1 / (1 + dist)  # Convert distance to similarity
                similarity_filtered_results.append({
                    'question': qa_pair['question'],
                    'answer': qa_pair['answer'],
                    'similarity': similarity_score,
                    'distance': dist,
                    'rank': i + 1
                })
            else:
                break
        
        if not similarity_filtered_results:
            return []
        
        # Hard filter by matching entities (e.g., school names)
        user_entities = self.extract_entities(question)
        print(f"Detected entities in query: {user_entities or 'None'}")
        
        if not user_entities:
            # If no entities in query, return similarity-filtered results
            return similarity_filtered_results
        
        hard_filtered_results = []
        for pair in similarity_filtered_results:
            candidate_entities = self.extract_entities(pair['question'])
            if user_entities.intersection(candidate_entities):
                hard_filtered_results.append(pair)
        
        return hard_filtered_results if hard_filtered_results else similarity_filtered_results
    
    def format_rag_context(self, retrieved: List[Dict[str, Any]]) -> str:
        """Format retrieved QA pairs into context string"""
        if not retrieved:
            return ""
        
        context_parts = []
        for i, pair in enumerate(retrieved, 1):
            context_parts.append(
                f"[Context {i}] (Similarity: {pair['similarity']:.2f})\n"
                f"Q: {pair['question']}\n"
                f"A: {pair['answer']}\n"
            )
        
        return '\n'.join(context_parts)
    
    def get_rag_context(self, question: str, top_k: Optional[int] = None) -> Dict[str, Any]:
        """
        Main method to get RAG context for a question
        Returns: {
            'has_context': bool,
            'context': str,
            'retrieved_pairs': List[Dict],
            'best_similarity': float,
            'total_pairs': int
        }
        """
        retrieved = self.retrieve_similar_questions(question, top_k)
        
        result = {
            'has_context': len(retrieved) > 0,
            'context': self.format_rag_context(retrieved),
            'retrieved_pairs': retrieved,
            'best_similarity': retrieved[0]['similarity'] if retrieved else 0.0,
            'total_pairs': len(retrieved)
        }
        
        return result

def load_qa_pairs(path):
    with open(path, 'rb') as f:
        return pickle.load(f)

def load_faiss_index(path):
    return faiss.read_index(path)

def load_mapping(path):
    with open(path, 'rb') as f:
        return pickle.load(f)

def main():
    """Test the RAG retriever"""
    print('🔍 RAG Retriever - Pure Retrieval Mode')
    print('='*50)
    
    try:
        retriever = RAGRetriever()
        
        print('\n🚀 Ready for retrieval! (type "exit" to quit)')
        print('='*50)
        
        while True:
            question = input('\n💭 Enter your question: ')
            if question.lower() == 'exit':
                break
            
            print('🔍 Retrieving similar QA pairs...')
            result = retriever.get_rag_context(question)
            
            print('\n--- 📚 RAG Retrieval Results ---')
            if result['has_context']:
                print(f"Found {result['total_pairs']} relevant Q&A pairs:")
                print(f"Best similarity: {result['best_similarity']:.3f}")
                print("\nRetrieved Context:")
                print(result['context'])
            else:
                print("No relevant context found in knowledge base.")
    
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    main() 