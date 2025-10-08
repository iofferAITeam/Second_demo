#!/bin/bash

# Docker Entrypoint Script for AI Service
# Handles RAG initialization and starts the main application

set -e

echo "🐳 Starting iOffer AI Service in Docker"
echo "======================================"

# Set Python path
export PYTHONPATH=/app:$PYTHONPATH

# Initialize RAG systems at runtime
echo "🔍 Initializing RAG systems at runtime..."
cd /app

# Step 1: Run original FAISS RAG setup (doesn't need API key for basic setup)
echo "🔧 Step 1: Setting up FAISS RAG system..."
if [ ! -f "data/rag_data/qa_pairs.json" ]; then
    ./run_rag_setup.sh || echo "⚠️ FAISS RAG setup failed, continuing anyway"
else
    echo "✅ FAISS RAG system already initialized"
fi

# Step 2: Run LangChain + ChromaDB RAG setup
echo "🔧 Step 2: Setting up LangChain + ChromaDB RAG system..."
if [ ! -f "data/rag_config_langchain.json" ] || grep -q '"status": "not_initialized"' data/rag_config_langchain.json 2>/dev/null; then
    if [ -n "$OPENAI_API_KEY" ]; then
        echo "🔑 OPENAI_API_KEY found, running full LangChain RAG setup..."
        ./run_langchain_rag_setup_docker.sh || echo "⚠️ LangChain RAG setup failed, will create fallback"
    else
        echo "⚠️ OPENAI_API_KEY not set, creating fallback configuration..."
        mkdir -p data/chromadb
        echo '{"status": "not_initialized", "message": "OPENAI_API_KEY not available"}' > data/rag_config_langchain.json
    fi
else
    echo "✅ LangChain RAG system already initialized"
fi

# Step 3: Final validation and fallback creation
echo "🔧 Step 3: Final RAG system validation..."
uv run python src/agents/general_qa_agent/docker_rag_init.py

# Check if initialization was successful
if [ -f "data/rag_config_langchain.json" ]; then
    echo "✅ RAG configuration found"
    
    # Check if it's in fallback mode
    if grep -q '"status": "fallback_mode"' data/rag_config_langchain.json; then
        echo "⚠️ RAG system running in fallback mode"
        echo "   Some features may be limited"
    else
        echo "✅ RAG system fully initialized"
    fi
else
    echo "⚠️ RAG configuration not found - creating minimal config"
    mkdir -p data
    echo '{"status": "not_available", "message": "RAG system not available"}' > data/rag_config_langchain.json
fi

# Start the main application
echo ""
echo "🚀 Starting AI Service..."
echo "========================"

# Execute the main command
exec "$@"
