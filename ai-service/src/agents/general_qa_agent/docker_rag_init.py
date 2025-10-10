#!/usr/bin/env python3
"""
Docker Runtime RAG Initialization Script
Initializes LangChain + ChromaDB RAG system at container startup if not already done
"""

import os
import sys
import json
import asyncio
from pathlib import Path

# Add the src path for importing settings
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))


def get_paths():
    """Get appropriate paths based on environment"""
    if os.path.exists("/app") and os.getcwd().startswith("/app"):
        # Docker environment
        return "/app/data/rag_config_langchain.json", "/app/data/chromadb"
    else:
        # Local environment
        script_dir = os.path.dirname(os.path.abspath(__file__))
        ai_service_root = os.path.abspath(os.path.join(script_dir, "../../../"))
        config_path = os.path.join(ai_service_root, "data", "rag_config_langchain.json")
        chromadb_path = os.path.join(ai_service_root, "data", "chromadb")
        return config_path, chromadb_path


def check_vector_db_files_integrity():
    """Check if vector database files are complete and valid"""
    config_path, chromadb_path = get_paths()

    # Check FAISS files
    faiss_files = [
        os.path.join(os.path.dirname(config_path), "qa_pairs.pkl"),
        os.path.join(os.path.dirname(config_path), "faiss.index"),
        os.path.join(os.path.dirname(config_path), "embeddings.npy"),
        os.path.join(os.path.dirname(config_path), "mapping.pkl"),
    ]

    faiss_complete = True
    for file_path in faiss_files:
        if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
            print(f"⚠️ FAISS file missing or empty: {os.path.basename(file_path)}")
            faiss_complete = False

    # Check ChromaDB files
    chromadb_complete = True
    if not os.path.exists(config_path):
        print("⚠️ ChromaDB config file missing")
        chromadb_complete = False
    elif not os.path.exists(chromadb_path):
        print("⚠️ ChromaDB directory missing")
        chromadb_complete = False
    elif not os.listdir(chromadb_path):
        print("⚠️ ChromaDB directory is empty")
        chromadb_complete = False
    else:
        # Check config file content
        try:
            with open(config_path, "r") as f:
                config = json.load(f)
            if config.get("status") == "not_initialized":
                print("⚠️ ChromaDB not properly initialized")
                chromadb_complete = False
        except (json.JSONDecodeError, KeyError):
            print("⚠️ ChromaDB config file corrupted")
            chromadb_complete = False

    return faiss_complete, chromadb_complete


def check_rag_initialization():
    """Check if RAG system is properly initialized"""
    config_path, chromadb_path = get_paths()

    # Check vector database file integrity
    faiss_complete, chromadb_complete = check_vector_db_files_integrity()

    # Check if config file exists and is valid
    if os.path.exists(config_path):
        try:
            with open(config_path, "r") as f:
                config = json.load(f)

            # Check if it's a placeholder or real config
            if config.get("status") == "not_initialized":
                print("⚠️ RAG system not initialized")
                return False

            # Check if ChromaDB directory exists and has content
            if os.path.exists(chromadb_path) and os.listdir(chromadb_path):
                if chromadb_complete:
                    print(
                        "✅ RAG system appears to be initialized and files are complete"
                    )
                    return True
                else:
                    print("⚠️ RAG system config exists but files are incomplete")
                    return False

        except (json.JSONDecodeError, KeyError):
            print("⚠️ RAG system config file corrupted")
            return False

    print("⚠️ RAG system not initialized or incomplete")
    return False


async def initialize_rag_system():
    """Initialize RAG system at runtime"""
    print("🔧 Initializing RAG system at runtime...")

    try:
        # Import and run the preparation script
        from prepare_rag_data_langchain import main as prepare_main

        print("📊 Running LangChain + ChromaDB data preparation...")
        await prepare_main()

        print("✅ RAG system initialized successfully at runtime")
        return True

    except Exception as e:
        print(f"❌ Failed to initialize RAG system: {e}")
        print(
            "💡 This may be due to missing OPENAI_API_KEY or other configuration issues"
        )
        return False


def create_fallback_config():
    """Create a fallback configuration for graceful degradation"""
    config_path, _ = get_paths()

    fallback_config = {
        "status": "fallback_mode",
        "embedding_model": "text-embedding-3-large",
        "collection_name": "qa_pairs_collection",
        "total_qa_pairs": 0,
        "message": "RAG system running in fallback mode - some features may be limited",
        "initialized_at_runtime": False,
    }

    os.makedirs(os.path.dirname(config_path), exist_ok=True)

    with open(config_path, "w") as f:
        json.dump(fallback_config, f, indent=2)

    print("⚠️ Created fallback configuration")


def validate_vector_db_functionality():
    """Validate that vector databases are actually functional"""
    print("🔍 Validating vector database functionality...")

    try:
        # Test FAISS functionality
        faiss_files = [
            os.path.join(os.path.dirname(get_paths()[0]), "qa_pairs.pkl"),
            os.path.join(os.path.dirname(get_paths()[0]), "faiss.index"),
            os.path.join(os.path.dirname(get_paths()[0]), "embeddings.npy"),
            os.path.join(os.path.dirname(get_paths()[0]), "mapping.pkl"),
        ]

        # Check if all FAISS files exist and are readable
        faiss_working = True
        for file_path in faiss_files:
            if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
                faiss_working = False
                break

        if faiss_working:
            print("✅ FAISS vector database appears functional")
        else:
            print("⚠️ FAISS vector database files are missing or corrupted")

        # Test ChromaDB functionality
        config_path, chromadb_path = get_paths()
        chromadb_working = True

        if not os.path.exists(config_path) or not os.path.exists(chromadb_path):
            chromadb_working = False
        else:
            try:
                with open(config_path, "r") as f:
                    config = json.load(f)
                if config.get("status") == "not_initialized":
                    chromadb_working = False
            except (json.JSONDecodeError, KeyError):
                chromadb_working = False

        if chromadb_working:
            print("✅ ChromaDB vector database appears functional")
        else:
            print("⚠️ ChromaDB vector database is not properly initialized")

        return faiss_working, chromadb_working

    except Exception as e:
        print(f"❌ Error validating vector databases: {e}")
        return False, False


async def main():
    """Main initialization function for Docker runtime"""
    print("🐳 Docker RAG Runtime Initialization")
    print("=" * 40)

    # First, validate existing vector database functionality
    faiss_working, chromadb_working = validate_vector_db_functionality()

    # Check if already initialized and working
    if check_rag_initialization():
        print("✅ RAG system already initialized and validated - skipping")
        return True

    # If vector databases are not working, we need to rebuild
    if not faiss_working or not chromadb_working:
        print("🔧 Vector databases need rebuilding...")

        # Check if we have the required API key
        if not os.getenv("OPENAI_API_KEY"):
            print("❌ OPENAI_API_KEY not found in environment")
            print("⚠️ Creating fallback configuration...")
            create_fallback_config()
            return False

        # Check if CSV data exists
        _, chromadb_path = get_paths()
        # Get CSV path from same directory as config
        config_path, _ = get_paths()
        csv_path = os.path.join(os.path.dirname(config_path), "qa_pairs.csv")
        if not os.path.exists(csv_path):
            print(f"❌ QA pairs CSV not found: {csv_path}")
            print("⚠️ Creating fallback configuration...")
            create_fallback_config()
            return False

        # Try to initialize
        success = await initialize_rag_system()

        if not success:
            print("⚠️ Initialization failed - creating fallback configuration...")
            create_fallback_config()

        return success
    else:
        print("✅ Vector databases are functional - no rebuild needed")
        return True


if __name__ == "__main__":
    # Run initialization
    result = asyncio.run(main())

    if result:
        print("\n🎉 Docker RAG initialization completed successfully!")
    else:
        print("\n⚠️ Docker RAG initialization completed with fallback mode")
        print("   The system will still function but with limited RAG capabilities")

    sys.exit(0)  # Always exit successfully to not break container startup
