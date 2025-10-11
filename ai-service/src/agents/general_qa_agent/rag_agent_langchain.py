"""
RAG Agent using LangChain and ChromaDB - Pure Retrieval Version
Uses OpenAI embeddings with ChromaDB for similarity search.
Returns only retrieved context without LLM generation.
"""

from typing import List, Dict, Any, Optional
import os
import re
import sys
import json
from dotenv import load_dotenv

# Add the src path for importing settings
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
from src.settings import settings

try:
    import chromadb
    from chromadb.config import Settings as ChromaSettings

    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False

try:
    from langchain_openai import OpenAIEmbeddings
    from langchain_community.vectorstores import Chroma
    from langchain.schema import Document

    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "../../../.env"))


# --- CONFIG ---
EMBEDDING_MODEL_NAME = "text-embedding-3-large"
COLLECTION_NAME = "qa_pairs_collection"
TOP_K = 5  # Retrieve more candidates to filter
SIMILARITY_THRESHOLD = 0.7  # Minimum similarity score (0-1, higher is more similar)


class LangChainRAGRetriever:
    """
    LangChain + ChromaDB RAG Retrieval Agent - returns only retrieved context
    """

    def __init__(self):
        self.embedding_model = EMBEDDING_MODEL_NAME
        self.collection_name = COLLECTION_NAME
        self.similarity_threshold = SIMILARITY_THRESHOLD
        self.top_k = TOP_K

        # Setup paths based on environment
        self._setup_paths()

        # Validate setup
        if not os.getenv("OPENAI_API_KEY"):
            raise ValueError("OPENAI_API_KEY not found in environment variables")

        if not LANGCHAIN_AVAILABLE:
            raise ImportError(
                "LangChain not available. Install with: uv add langchain langchain-openai langchain-community"
            )

        if not CHROMADB_AVAILABLE:
            raise ImportError("ChromaDB not available. Install with: uv add chromadb")

        # Load configuration
        self.config = self._load_config()

        # Initialize components
        self.embeddings = None
        self.vectorstore = None
        self._initialize_components()

    def _setup_paths(self):
        """
        Smart path detection for Docker vs local environment
        """
        # Check if we're running in Docker (look for /app directory)
        if os.path.exists("/app") and os.getcwd().startswith("/app"):
            # Docker environment
            self.chromadb_dir = "/app/data/chromadb"
            self.config_path = "/app/data/rag_config_langchain.json"
            print("🐳 Detected Docker environment, using /app paths")
        else:
            # Local environment - use relative paths from script location
            script_dir = os.path.dirname(os.path.abspath(__file__))
            # Navigate to ai-service root: ../../../
            ai_service_root = os.path.abspath(os.path.join(script_dir, "../../../"))
            self.chromadb_dir = os.path.join(ai_service_root, "data", "chromadb")
            self.config_path = os.path.join(
                ai_service_root, "data", "rag_config_langchain.json"
            )
            print(f"💻 Detected local environment, using {ai_service_root}/data")

    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from file"""
        try:
            if os.path.exists(self.config_path):
                with open(self.config_path, "r") as f:
                    config = json.load(f)
                print(f"✅ Configuration loaded: {config['total_qa_pairs']} QA pairs")
                return config
            else:
                raise FileNotFoundError(
                    f"Configuration file not found: {self.config_path}"
                )
        except Exception as e:
            print(f"❌ Error loading configuration: {e}")
            raise e

    def _initialize_components(self):
        """Initialize embeddings and vector store"""
        try:
            # Setup embeddings
            self.embeddings = OpenAIEmbeddings(
                model=self.embedding_model,
                openai_api_key=os.getenv("OPENAI_API_KEY"),
                chunk_size=50,
                max_retries=3,
                request_timeout=60,
            )

            # Initialize ChromaDB client with allow_reset to handle existing instances
            chroma_client = chromadb.PersistentClient(
                path=self.chromadb_dir,
                settings=ChromaSettings(anonymized_telemetry=False, allow_reset=True),
            )

            # Load existing vector store
            self.vectorstore = Chroma(
                client=chroma_client,
                collection_name=self.collection_name,
                embedding_function=self.embeddings,
            )

            print(f"✅ LangChain RAG components initialized")

        except Exception as e:
            print(f"❌ Error initializing components: {e}")
            raise e

    def extract_entities(self, text: str) -> set:
        """Extract potential entities like school names"""
        pattern = r"\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b|[A-Z]{2,}"
        return set(re.findall(pattern, text))

    def retrieve_similar_questions(
        self, question: str, top_k: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve similar questions using LangChain and ChromaDB"""
        if top_k is None:
            top_k = self.top_k

        try:
            # Search similar documents with scores
            results = self.vectorstore.similarity_search_with_score(
                query=question, k=top_k
            )

            print(f"Retrieved {len(results)} results from ChromaDB")

            # Convert to our format and filter by similarity
            similarity_filtered_results = []
            for i, (doc, distance) in enumerate(results):
                # Convert distance to similarity (ChromaDB uses L2 distance)
                similarity_score = 1 / (1 + distance) if distance > 0 else 1.0

                if similarity_score >= self.similarity_threshold:
                    similarity_filtered_results.append(
                        {
                            "question": doc.metadata["question"],
                            "answer": doc.metadata["answer"],
                            "similarity": similarity_score,
                            "distance": distance,
                            "rank": i + 1,
                            "id": doc.metadata.get("id", "unknown"),
                        }
                    )
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
                candidate_entities = self.extract_entities(pair["question"])
                if user_entities.intersection(candidate_entities):
                    hard_filtered_results.append(pair)

            return (
                hard_filtered_results
                if hard_filtered_results
                else similarity_filtered_results
            )

        except Exception as e:
            print(f"❌ Error retrieving similar questions: {e}")
            return []

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

        return "\n".join(context_parts)

    def get_rag_context(
        self, question: str, top_k: Optional[int] = None
    ) -> Dict[str, Any]:
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
            "has_context": len(retrieved) > 0,
            "context": self.format_rag_context(retrieved),
            "retrieved_pairs": retrieved,
            "best_similarity": retrieved[0]["similarity"] if retrieved else 0.0,
            "total_pairs": len(retrieved),
        }

        return result

    def get_collection_info(self) -> Dict[str, Any]:
        """Get information about the ChromaDB collection"""
        try:
            chroma_client = chromadb.PersistentClient(
                path=self.chromadb_dir,
                settings=ChromaSettings(anonymized_telemetry=False, allow_reset=True),
            )

            collection = chroma_client.get_collection(name=self.collection_name)
            count = collection.count()

            return {
                "collection_name": self.collection_name,
                "document_count": count,
                "embedding_model": self.embedding_model,
                "chromadb_path": self.chromadb_dir,
            }

        except Exception as e:
            print(f"❌ Error getting collection info: {e}")
            return {}


def main():
    """Test the LangChain RAG retriever"""
    print("🔍 LangChain + ChromaDB RAG Retriever")
    print("=" * 50)

    try:
        retriever = LangChainRAGRetriever()

        # Show collection info
        info = retriever.get_collection_info()
        if info:
            print(f"📊 Collection: {info['collection_name']}")
            print(f"📄 Documents: {info['document_count']}")
            print(f"🔮 Model: {info['embedding_model']}")

        print('\n🚀 Ready for retrieval! (type "exit" to quit)')
        print("=" * 50)

        while True:
            question = input("\n💭 Enter your question: ")
            if question.lower() == "exit":
                break

            print("🔍 Retrieving similar QA pairs...")
            result = retriever.get_rag_context(question)

            print("\n--- 📚 RAG Retrieval Results ---")
            if result["has_context"]:
                print(f"Found {result['total_pairs']} relevant Q&A pairs:")
                print(f"Best similarity: {result['best_similarity']:.3f}")
                print("\nRetrieved Context:")
                print(result["context"])
            else:
                print("No relevant context found in knowledge base.")

    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n💡 Make sure to run the data preparation script first:")
        print(
            "   uv run python src/agents/general_qa_agent/prepare_rag_data_langchain.py"
        )


if __name__ == "__main__":
    main()
