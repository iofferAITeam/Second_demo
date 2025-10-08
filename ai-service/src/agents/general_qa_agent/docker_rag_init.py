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


def check_rag_initialization():
    """Check if RAG system is properly initialized"""
    config_path, chromadb_path = get_paths()

    # Check if config file exists and is valid
    if os.path.exists(config_path):
        try:
            with open(config_path, "r") as f:
                config = json.load(f)

            # Check if it's a placeholder or real config
            if config.get("status") == "not_initialized":
                return False

            # Check if ChromaDB directory exists and has content
            if os.path.exists(chromadb_path) and os.listdir(chromadb_path):
                print("✅ RAG system appears to be initialized")
                return True

        except (json.JSONDecodeError, KeyError):
            pass

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


async def main():
    """Main initialization function for Docker runtime"""
    print("🐳 Docker RAG Runtime Initialization")
    print("=" * 40)

    # Check if already initialized
    if check_rag_initialization():
        print("✅ RAG system already initialized - skipping")
        return True

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


if __name__ == "__main__":
    # Run initialization
    result = asyncio.run(main())

    if result:
        print("\n🎉 Docker RAG initialization completed successfully!")
    else:
        print("\n⚠️ Docker RAG initialization completed with fallback mode")
        print("   The system will still function but with limited RAG capabilities")

    sys.exit(0)  # Always exit successfully to not break container startup
