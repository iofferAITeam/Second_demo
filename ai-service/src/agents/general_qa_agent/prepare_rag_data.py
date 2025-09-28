#!/usr/bin/env python3
"""
RAG Data Preparation Script for Hybrid QA Agent
Converts qa_pairs.csv (from data/ directory) to RAG format using OpenAI text-embedding-3-large
Located in: src/agents/general_qa_agent/
"""

import os
import sys
import pandas as pd
import numpy as np
import pickle
import json
import asyncio
import time
from typing import List, Dict, Any
from dotenv import load_dotenv

# Add the src path for importing settings
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
from src.settings import settings

try:
    import openai
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False

load_dotenv(os.path.join(os.path.dirname(__file__), "../../../.env"))

class RAGDataPreparer:
    """
    Prepares RAG data using OpenAI text-embedding-3-large model
    """
    
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.embedding_model = "text-embedding-3-large"
        self.embedding_dimensions = 3072  # text-embedding-3-large dimensions
        
        # File paths - CSV moved to data directory, output files in data folder
        self.csv_path = "../../../data/qa_pairs.csv"  # CSV now in data directory
        self.output_dir = "../../../data/"   # Data directory
        self.qa_pairs_path = os.path.join(self.output_dir, "qa_pairs.pkl")
        self.faiss_index_path = os.path.join(self.output_dir, "faiss.index")
        self.embeddings_path = os.path.join(self.output_dir, "embeddings.npy")
        self.mapping_path = os.path.join(self.output_dir, "mapping.pkl")
        self.config_path = os.path.join(self.output_dir, "rag_config.json")
        
        # Rate limiting
        self.batch_size = 50  # Process embeddings in batches
        self.delay_between_batches = 1  # seconds
        
        self._validate_setup()
    
    def _validate_setup(self):
        """Validate dependencies and API keys"""
        missing_deps = []
        
        if not OPENAI_AVAILABLE:
            missing_deps.append("openai")
        if not FAISS_AVAILABLE:
            missing_deps.append("faiss-cpu")
        
        if missing_deps:
            print("❌ Missing dependencies. Please install:")
            for dep in missing_deps:
                print(f"   uv add {dep}")
            sys.exit(1)
        
        if not self.openai_api_key:
            print("❌ OPENAI_API_KEY not found in environment variables")
            print("Please add to .env file: OPENAI_API_KEY=sk-...")
            sys.exit(1)
        
        if not os.path.exists(self.csv_path):
            print(f"❌ CSV file not found: {self.csv_path}")
            print(f"Expected location: data/qa_pairs.csv in project root")
            print(f"Current directory: {os.getcwd()}")
            sys.exit(1)
        
        # Ensure output directory exists
        os.makedirs(self.output_dir, exist_ok=True)
        
        print("✅ All dependencies and API keys validated")
        print(f"📂 CSV file: {os.path.abspath(self.csv_path)}")
        print(f"📁 Output directory: {os.path.abspath(self.output_dir)}")
    
    def load_csv_data(self) -> List[Dict[str, Any]]:
        """Load and convert CSV data to required format"""
        print(f"📂 Loading data from {self.csv_path}")
        
        try:
            df = pd.read_csv(self.csv_path)
            print(f"✅ Loaded {len(df)} Q&A pairs")
            
            # Convert to required format
            qa_pairs = []
            for _, row in df.iterrows():
                qa_pairs.append({
                    'id': int(row['id']),
                    'question': str(row['question']).strip(),
                    'answer': str(row['answer']).strip()
                })
            
            # Filter out any empty questions or answers
            original_count = len(qa_pairs)
            qa_pairs = [
                pair for pair in qa_pairs 
                if pair['question'] and pair['answer'] and 
                   pair['question'] != 'nan' and pair['answer'] != 'nan'
            ]
            
            if len(qa_pairs) < original_count:
                print(f"⚠️ Filtered out {original_count - len(qa_pairs)} invalid entries")
            
            print(f"✅ Prepared {len(qa_pairs)} valid Q&A pairs")
            return qa_pairs
            
        except Exception as e:
            print(f"❌ Error loading CSV: {e}")
            sys.exit(1)
    
    async def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a batch of texts using OpenAI API"""
        try:
            client = OpenAI(api_key=self.openai_api_key)
            
            response = client.embeddings.create(
                model=self.embedding_model,
                input=texts,
                encoding_format="float"
            )
            
            embeddings = [item.embedding for item in response.data]
            return embeddings
            
        except Exception as e:
            print(f"❌ Error generating embeddings: {e}")
            if "rate limit" in str(e).lower():
                print("⏳ Rate limited, waiting 30 seconds...")
                await asyncio.sleep(30)
                return await self.generate_embeddings_batch(texts)
            raise e
    
    async def generate_all_embeddings(self, qa_pairs: List[Dict]) -> np.ndarray:
        """Generate embeddings for all questions with rate limiting"""
        print(f"🔮 Generating embeddings using {self.embedding_model}")
        print(f"📊 Processing {len(qa_pairs)} questions in batches of {self.batch_size}")
        
        all_embeddings = []
        questions = [pair['question'] for pair in qa_pairs]
        
        # Process in batches to avoid rate limits
        for i in range(0, len(questions), self.batch_size):
            batch = questions[i:i + self.batch_size]
            batch_num = i // self.batch_size + 1
            total_batches = (len(questions) + self.batch_size - 1) // self.batch_size
            
            print(f"⚡ Processing batch {batch_num}/{total_batches} ({len(batch)} questions)")
            
            try:
                batch_embeddings = await self.generate_embeddings_batch(batch)
                all_embeddings.extend(batch_embeddings)
                
                # Rate limiting delay
                if i + self.batch_size < len(questions):
                    print(f"⏳ Waiting {self.delay_between_batches}s before next batch...")
                    await asyncio.sleep(self.delay_between_batches)
                    
            except Exception as e:
                print(f"❌ Error in batch {batch_num}: {e}")
                sys.exit(1)
        
        embeddings_array = np.array(all_embeddings, dtype=np.float32)
        print(f"✅ Generated embeddings: {embeddings_array.shape}")
        return embeddings_array
    
    def build_faiss_index(self, embeddings: np.ndarray) -> faiss.Index:
        """Build FAISS index for fast similarity search"""
        print("🔍 Building FAISS index for fast similarity search")
        
        try:
            # Use IndexFlatL2 for exact search (good for smaller datasets)
            dimension = embeddings.shape[1]
            index = faiss.IndexFlatL2(dimension)
            
            # Add embeddings to index
            index.add(embeddings)
            
            print(f"✅ FAISS index built: {index.ntotal} vectors, {dimension} dimensions")
            return index
            
        except Exception as e:
            print(f"❌ Error building FAISS index: {e}")
            sys.exit(1)
    
    def save_all_files(self, qa_pairs: List[Dict], embeddings: np.ndarray, index: faiss.Index):
        """Save all required files for the hybrid agent"""
        print("💾 Saving all RAG files...")
        
        try:
            # Save Q&A pairs in required format
            with open(self.qa_pairs_path, 'wb') as f:
                pickle.dump(qa_pairs, f)
            print(f"✅ Saved Q&A pairs: {os.path.abspath(self.qa_pairs_path)}")
            
            # Save FAISS index
            faiss.write_index(index, self.faiss_index_path)
            print(f"✅ Saved FAISS index: {os.path.abspath(self.faiss_index_path)}")
            
            # Save embeddings
            np.save(self.embeddings_path, embeddings)
            print(f"✅ Saved embeddings: {os.path.abspath(self.embeddings_path)}")
            
            # Save mapping (index -> Q&A pair)
            mapping = {i: pair for i, pair in enumerate(qa_pairs)}
            with open(self.mapping_path, 'wb') as f:
                pickle.dump(mapping, f)
            print(f"✅ Saved mapping: {os.path.abspath(self.mapping_path)}")
            
            # Save configuration
            config = {
                'embedding_model': self.embedding_model,
                'embedding_dimensions': self.embedding_dimensions,
                'total_qa_pairs': len(qa_pairs),
                'created_at': time.strftime('%Y-%m-%d %H:%M:%S'),
                'source_csv': os.path.abspath(self.csv_path),
                'preparation_script': __file__
            }
            with open(self.config_path, 'w') as f:
                json.dump(config, f, indent=2)
            print(f"✅ Saved config: {os.path.abspath(self.config_path)}")
            
        except Exception as e:
            print(f"❌ Error saving files: {e}")
            sys.exit(1)
    
    def validate_setup(self, qa_pairs: List[Dict]) -> bool:
        """Validate that all files were created correctly"""
        print("🔍 Validating RAG setup...")
        
        try:
            # Test loading all files
            with open(self.qa_pairs_path, 'rb') as f:
                loaded_qa_pairs = pickle.load(f)
            
            loaded_index = faiss.read_index(self.faiss_index_path)
            loaded_embeddings = np.load(self.embeddings_path)
            
            with open(self.mapping_path, 'rb') as f:
                loaded_mapping = pickle.load(f)
            
            # Validate consistency
            assert len(loaded_qa_pairs) == len(qa_pairs), "Q&A pairs count mismatch"
            assert loaded_index.ntotal == len(qa_pairs), "FAISS index count mismatch"
            assert loaded_embeddings.shape[0] == len(qa_pairs), "Embeddings count mismatch"
            assert len(loaded_mapping) == len(qa_pairs), "Mapping count mismatch"
            
            print("✅ All files validated successfully")
            return True
            
        except Exception as e:
            print(f"❌ Validation failed: {e}")
            return False
    
    def test_similarity_search(self):
        """Test similarity search with a sample query"""
        print("🧪 Testing similarity search...")
        
        try:
            # Load the files
            with open(self.qa_pairs_path, 'rb') as f:
                qa_pairs = pickle.load(f)
            
            index = faiss.read_index(self.faiss_index_path)
            
            with open(self.mapping_path, 'rb') as f:
                mapping = pickle.load(f)
            
            # Test query
            test_question = "What are the admission requirements for graduate school?"
            print(f"🔍 Test query: {test_question}")
            
            # Generate embedding for test question
            client = OpenAI(api_key=self.openai_api_key)
            response = client.embeddings.create(
                model=self.embedding_model,
                input=[test_question],
                encoding_format="float"
            )
            
            query_embedding = np.array([response.data[0].embedding], dtype=np.float32)
            
            # Search similar questions
            distances, indices = index.search(query_embedding, 3)
            
            print("🎯 Top 3 similar questions:")
            for i, (dist, idx) in enumerate(zip(distances[0], indices[0])):
                similar_qa = mapping[idx]
                similarity = 1 / (1 + dist)  # Convert distance to similarity
                print(f"  {i+1}. Similarity: {similarity:.3f}")
                print(f"     Q: {similar_qa['question'][:100]}...")
                print(f"     A: {similar_qa['answer'][:100]}...")
                print()
            
            print("✅ Similarity search test successful")
            return True
            
        except Exception as e:
            print(f"❌ Similarity search test failed: {e}")
            return False
    
    def print_summary(self, qa_pairs: List[Dict]):
        """Print preparation summary"""
        print("\n" + "="*60)
        print("🎉 RAG Data Preparation Complete!")
        print("="*60)
        print(f"📊 Total Q&A pairs: {len(qa_pairs)}")
        print(f"🔮 Embedding model: {self.embedding_model}")
        print(f"📐 Embedding dimensions: {self.embedding_dimensions}")
        print(f"📂 Source CSV: {os.path.abspath(self.csv_path)}")
        print(f"🗃️ Files created in data/ directory:")
        print(f"   • data/qa_pairs.pkl")
        print(f"   • data/faiss.index")
        print(f"   • data/embeddings.npy")
        print(f"   • data/mapping.pkl")
        print(f"   • data/rag_config.json")
        print("\n🚀 Ready for Hybrid QA Agent!")
        print("From root directory, run:")
        print("   uv run python src/agents/hybrid_qa_agent.py")
        print("="*60)

async def main():
    """Main preparation function"""
    print("🎓 RAG Data Preparation for Hybrid QA Agent")
    print("=" * 50)
    print(f"📍 Working from: {os.getcwd()}")
    
    preparer = RAGDataPreparer()
    
    # Step 1: Load CSV data
    qa_pairs = preparer.load_csv_data()
    
    # Step 2: Generate embeddings
    embeddings = await preparer.generate_all_embeddings(qa_pairs)
    
    # Step 3: Build FAISS index
    index = preparer.build_faiss_index(embeddings)
    
    # Step 4: Save all files
    preparer.save_all_files(qa_pairs, embeddings, index)
    
    # Step 5: Validate setup
    if not preparer.validate_setup(qa_pairs):
        print("❌ Setup validation failed")
        sys.exit(1)
    
    # Step 6: Test similarity search
    if not preparer.test_similarity_search():
        print("❌ Similarity search test failed")
        sys.exit(1)
    
    # Step 7: Print summary
    preparer.print_summary(qa_pairs)

if __name__ == "__main__":
    # Check dependencies first
    try:
        import pandas as pd
    except ImportError:
        print("❌ Missing pandas. Install with: uv add pandas")
        sys.exit(1)
    
    asyncio.run(main()) 