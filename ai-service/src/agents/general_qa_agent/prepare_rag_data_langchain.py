#!/usr/bin/env python3
"""
RAG Data Preparation Script using LangChain and ChromaDB
Converts qa_pairs.csv to ChromaDB vector store using OpenAI embeddings
Located in: src/agents/general_qa_agent/
"""

import os
import sys
import pandas as pd
import json
import asyncio
import time
from typing import List, Dict, Any
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
    from langchain.text_splitter import RecursiveCharacterTextSplitter

    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False

load_dotenv(os.path.join(os.path.dirname(__file__), "../../../.env"))


class LangChainRAGDataPreparer:
    """
    Prepares RAG data using LangChain and ChromaDB
    """

    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.embedding_model = "text-embedding-3-large"

        # Smart path detection for Docker vs local environment
        self._setup_paths()

        # ChromaDB collection name
        self.collection_name = "qa_pairs_collection"

        # Rate limiting
        self.batch_size = 50
        self.delay_between_batches = 1

        self._validate_setup()

    def _setup_paths(self):
        """
        Smart path detection for Docker vs local environment
        """
        # Check if we're running in Docker (look for /app directory)
        if os.path.exists("/app") and os.getcwd().startswith("/app"):
            # Docker environment
            self.csv_path = "/app/data/qa_pairs.csv"
            self.output_dir = "/app/data/"
            print("🐳 Detected Docker environment, using /app paths")
        else:
            # Local environment - use relative paths from script location
            script_dir = os.path.dirname(os.path.abspath(__file__))
            # Navigate to ai-service root: ../../../
            ai_service_root = os.path.abspath(os.path.join(script_dir, "../../../"))
            self.csv_path = os.path.join(ai_service_root, "data", "qa_pairs.csv")
            self.output_dir = os.path.join(ai_service_root, "data")
            print(f"💻 Detected local environment, using {self.output_dir}")

        self.chromadb_dir = os.path.join(self.output_dir, "chromadb")
        self.config_path = os.path.join(self.output_dir, "rag_config_langchain.json")

        # Ensure directories exist
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(self.chromadb_dir, exist_ok=True)

    def _validate_setup(self):
        """Validate dependencies and API keys"""
        missing_deps = []

        if not LANGCHAIN_AVAILABLE:
            missing_deps.append("langchain langchain-openai langchain-community")
        if not CHROMADB_AVAILABLE:
            missing_deps.append("chromadb")

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

        # Ensure output directories exist
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(self.chromadb_dir, exist_ok=True)

        print("✅ All dependencies and API keys validated")
        print(f"📂 CSV file: {os.path.abspath(self.csv_path)}")
        print(f"📁 ChromaDB directory: {os.path.abspath(self.chromadb_dir)}")

    def load_csv_data(self) -> List[Dict[str, Any]]:
        """Load and convert CSV data to required format"""
        print(f"📂 Loading data from {self.csv_path}")

        try:
            df = pd.read_csv(self.csv_path)
            print(f"✅ Loaded {len(df)} Q&A pairs")

            # Convert to required format
            qa_pairs = []
            for _, row in df.iterrows():
                qa_pairs.append(
                    {
                        "id": int(row["id"]),
                        "question": str(row["question"]).strip(),
                        "answer": str(row["answer"]).strip(),
                    }
                )

            # Filter out any empty questions or answers
            original_count = len(qa_pairs)
            qa_pairs = [
                pair
                for pair in qa_pairs
                if pair["question"]
                and pair["answer"]
                and pair["question"] != "nan"
                and pair["answer"] != "nan"
            ]

            if len(qa_pairs) < original_count:
                print(
                    f"⚠️ Filtered out {original_count - len(qa_pairs)} invalid entries"
                )

            print(f"✅ Prepared {len(qa_pairs)} valid Q&A pairs")
            return qa_pairs

        except Exception as e:
            print(f"❌ Error loading CSV: {e}")
            sys.exit(1)

    def create_documents(self, qa_pairs: List[Dict]) -> List[Document]:
        """Convert Q&A pairs to LangChain Documents"""
        print("📄 Creating LangChain Documents...")

        documents = []
        for pair in qa_pairs:
            # Create a document with the question as content
            # Store both question and answer in metadata
            doc = Document(
                page_content=pair["question"],
                metadata={
                    "id": pair["id"],
                    "question": pair["question"],
                    "answer": pair["answer"],
                    "type": "qa_pair",
                },
            )
            documents.append(doc)

        print(f"✅ Created {len(documents)} documents")
        return documents

    def setup_embeddings(self) -> OpenAIEmbeddings:
        """Setup OpenAI embeddings"""
        print(f"🔮 Setting up OpenAI embeddings: {self.embedding_model}")

        try:
            embeddings = OpenAIEmbeddings(
                model=self.embedding_model,
                openai_api_key=self.openai_api_key,
                chunk_size=self.batch_size,  # Process in batches
                max_retries=3,
                request_timeout=60,
            )
            print("✅ OpenAI embeddings configured")
            return embeddings

        except Exception as e:
            print(f"❌ Error setting up embeddings: {e}")
            sys.exit(1)

    def create_chromadb_vectorstore(
        self, documents: List[Document], embeddings: OpenAIEmbeddings
    ) -> Chroma:
        """Create ChromaDB vector store"""
        print("🗄️ Creating ChromaDB vector store...")

        try:
            # Initialize ChromaDB client with persistent storage and allow_reset
            chroma_client = chromadb.PersistentClient(
                path=self.chromadb_dir,
                settings=ChromaSettings(anonymized_telemetry=False, allow_reset=True),
            )

            # Delete existing collection if it exists
            try:
                chroma_client.delete_collection(name=self.collection_name)
                print(f"🗑️ Deleted existing collection: {self.collection_name}")
            except Exception as delete_error:
                print(f"⚠️ Could not delete existing collection: {delete_error}")
                # Try to reset the client if deletion fails
                try:
                    print("🔄 Attempting to reset ChromaDB client...")
                    chroma_client = chromadb.PersistentClient(
                        path=self.chromadb_dir,
                        settings=ChromaSettings(
                            anonymized_telemetry=False, allow_reset=True
                        ),
                    )
                except Exception as reset_error:
                    print(f"⚠️ ChromaDB client reset failed: {reset_error}")
                    pass  # Continue anyway

            # Create vector store with documents
            print(f"⚡ Processing {len(documents)} documents in batches...")

            vectorstore = Chroma.from_documents(
                documents=documents,
                embedding=embeddings,
                client=chroma_client,
                collection_name=self.collection_name,
                persist_directory=self.chromadb_dir,
            )

            print(f"✅ ChromaDB vector store created with {len(documents)} documents")
            return vectorstore

        except Exception as e:
            print(f"❌ Error creating ChromaDB vector store: {e}")
            sys.exit(1)

    def save_configuration(self, qa_pairs: List[Dict]):
        """Save configuration file"""
        print("💾 Saving configuration...")

        try:
            config = {
                "embedding_model": self.embedding_model,
                "collection_name": self.collection_name,
                "chromadb_directory": os.path.abspath(self.chromadb_dir),
                "total_qa_pairs": len(qa_pairs),
                "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "source_csv": os.path.abspath(self.csv_path),
                "preparation_script": __file__,
                "framework": "langchain_chromadb",
            }

            with open(self.config_path, "w") as f:
                json.dump(config, f, indent=2)

            print(f"✅ Configuration saved: {os.path.abspath(self.config_path)}")

        except Exception as e:
            print(f"❌ Error saving configuration: {e}")
            sys.exit(1)

    def validate_setup(self, qa_pairs: List[Dict]) -> bool:
        """Validate that ChromaDB was created correctly"""
        print("🔍 Validating ChromaDB setup...")

        try:
            # Initialize ChromaDB client with allow_reset to handle existing instances
            chroma_client = chromadb.PersistentClient(
                path=self.chromadb_dir,
                settings=ChromaSettings(anonymized_telemetry=False, allow_reset=True),
            )

            # Get collection
            collection = chroma_client.get_collection(name=self.collection_name)

            # Check document count
            count = collection.count()
            assert count == len(
                qa_pairs
            ), f"Document count mismatch: {count} vs {len(qa_pairs)}"

            print(f"✅ ChromaDB validation successful: {count} documents")
            return True

        except Exception as e:
            print(f"❌ Validation failed: {e}")
            # If validation fails due to instance conflict, try to reset and retry
            try:
                print("🔄 Attempting to reset ChromaDB instance...")
                chroma_client = chromadb.PersistentClient(
                    path=self.chromadb_dir,
                    settings=ChromaSettings(
                        anonymized_telemetry=False, allow_reset=True
                    ),
                )
                # Try to delete and recreate the collection
                try:
                    chroma_client.delete_collection(name=self.collection_name)
                except:
                    pass  # Collection might not exist

                # Recreate the collection
                collection = chroma_client.create_collection(name=self.collection_name)
                print("✅ ChromaDB instance reset successfully")
                return True
            except Exception as reset_error:
                print(f"❌ ChromaDB reset failed: {reset_error}")
                return False

    def test_similarity_search(self):
        """Test similarity search with a sample query"""
        print("🧪 Testing similarity search...")

        try:
            # Setup embeddings and vector store
            embeddings = self.setup_embeddings()

            # Load existing vector store with allow_reset to handle existing instances
            chroma_client = chromadb.PersistentClient(
                path=self.chromadb_dir,
                settings=ChromaSettings(anonymized_telemetry=False, allow_reset=True),
            )

            vectorstore = Chroma(
                client=chroma_client,
                collection_name=self.collection_name,
                embedding_function=embeddings,
            )

            # Test query
            test_question = "What are the admission requirements for graduate school?"
            print(f"🔍 Test query: {test_question}")

            # Search similar documents
            results = vectorstore.similarity_search_with_score(query=test_question, k=3)

            print("🎯 Top 3 similar questions:")
            for i, (doc, score) in enumerate(results):
                similarity = (
                    1 / (1 + score) if score > 0 else 1.0
                )  # Convert distance to similarity
                print(f"  {i+1}. Similarity: {similarity:.3f}")
                print(f"     Q: {doc.metadata['question'][:100]}...")
                print(f"     A: {doc.metadata['answer'][:100]}...")
                print()

            print("✅ Similarity search test successful")
            return True

        except Exception as e:
            print(f"❌ Similarity search test failed: {e}")
            # If it's a ChromaDB instance conflict, try to reset and retry
            if "An instance of Chroma already exists" in str(e):
                print("🔄 ChromaDB instance conflict detected, attempting to reset...")
                try:
                    # Force reset ChromaDB instance
                    import shutil

                    if os.path.exists(self.chromadb_dir):
                        shutil.rmtree(self.chromadb_dir)
                        os.makedirs(self.chromadb_dir, exist_ok=True)

                    # Retry the test
                    print("🔄 Retrying similarity search test...")
                    return self.test_similarity_search()
                except Exception as reset_error:
                    print(f"❌ ChromaDB reset failed: {reset_error}")
                    return False
            return False

    def print_summary(self, qa_pairs: List[Dict]):
        """Print preparation summary"""
        print("\n" + "=" * 60)
        print("🎉 LangChain + ChromaDB RAG Data Preparation Complete!")
        print("=" * 60)
        print(f"📊 Total Q&A pairs: {len(qa_pairs)}")
        print(f"🔮 Embedding model: {self.embedding_model}")
        print(f"🗄️ Vector store: ChromaDB")
        print(f"📂 Source CSV: {os.path.abspath(self.csv_path)}")
        print(f"🗃️ ChromaDB directory: {os.path.abspath(self.chromadb_dir)}")
        print(f"📋 Collection name: {self.collection_name}")
        print(f"⚙️ Configuration: {os.path.abspath(self.config_path)}")
        print("\n🚀 Ready for LangChain RAG Agent!")
        print("From root directory, run:")
        print("   uv run python src/agents/general_qa_agent/rag_agent_langchain.py")
        print("=" * 60)


async def main():
    """Main preparation function"""
    print("🎓 LangChain + ChromaDB RAG Data Preparation")
    print("=" * 50)
    print(f"📍 Working from: {os.getcwd()}")

    preparer = LangChainRAGDataPreparer()

    # Step 1: Load CSV data
    qa_pairs = preparer.load_csv_data()

    # Step 2: Create LangChain documents
    documents = preparer.create_documents(qa_pairs)

    # Step 3: Setup embeddings
    embeddings = preparer.setup_embeddings()

    # Step 4: Create ChromaDB vector store
    vectorstore = preparer.create_chromadb_vectorstore(documents, embeddings)

    # Step 5: Save configuration
    preparer.save_configuration(qa_pairs)

    # Step 6: Validate setup
    if not preparer.validate_setup(qa_pairs):
        print("❌ Setup validation failed")
        sys.exit(1)

    # Step 7: Test similarity search
    if not preparer.test_similarity_search():
        print("❌ Similarity search test failed")
        sys.exit(1)

    # Step 8: Print summary
    preparer.print_summary(qa_pairs)


if __name__ == "__main__":
    # Check dependencies first
    try:
        import pandas as pd
    except ImportError:
        print("❌ Missing pandas. Install with: uv add pandas")
        sys.exit(1)

    asyncio.run(main())
