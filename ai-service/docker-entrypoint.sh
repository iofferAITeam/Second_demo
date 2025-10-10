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

# Function to check vector database file integrity
check_vector_db_integrity() {
    local db_type=$1
    local is_complete=true
    
    if [ "$db_type" = "faiss" ]; then
        # Check FAISS RAG files
        if [ ! -f "data/qa_pairs.pkl" ] || [ ! -f "data/faiss.index" ] || [ ! -f "data/embeddings.npy" ] || [ ! -f "data/mapping.pkl" ]; then
            echo "⚠️ FAISS RAG files incomplete or missing"
            is_complete=false
        else
            # Check file sizes (basic integrity check)
            if [ ! -s "data/qa_pairs.pkl" ] || [ ! -s "data/faiss.index" ] || [ ! -s "data/embeddings.npy" ] || [ ! -s "data/mapping.pkl" ]; then
                echo "⚠️ FAISS RAG files are empty or corrupted"
                is_complete=false
            else
                echo "✅ FAISS RAG files appear complete"
            fi
        fi
    elif [ "$db_type" = "chromadb" ]; then
        # Check ChromaDB files
        if [ ! -f "data/rag_config_langchain.json" ] || [ ! -d "data/chromadb" ]; then
            echo "⚠️ ChromaDB files incomplete or missing"
            is_complete=false
        else
            # Check if ChromaDB directory has content
            if [ ! "$(ls -A data/chromadb 2>/dev/null)" ]; then
                echo "⚠️ ChromaDB directory is empty"
                is_complete=false
            else
                # Check if config file indicates proper initialization
                if grep -q '"status": "not_initialized"' data/rag_config_langchain.json 2>/dev/null; then
                    echo "⚠️ ChromaDB not properly initialized"
                    is_complete=false
                else
                    echo "✅ ChromaDB files appear complete"
                fi
            fi
        fi
    fi
    
    echo $is_complete
}

# Step 1: Check and setup FAISS RAG system
echo "🔧 Step 1: Checking FAISS RAG system..."
if [ "$(check_vector_db_integrity faiss)" = "true" ]; then
    echo "✅ FAISS RAG system files are complete and valid"
else
    echo "🔧 FAISS RAG files incomplete or corrupted, rebuilding..."
    ./run_rag_setup.sh || echo "⚠️ FAISS RAG setup failed, continuing anyway"
fi

# Step 2: Check and setup LangChain + ChromaDB RAG system
echo "🔧 Step 2: Checking LangChain + ChromaDB RAG system..."
if [ "$(check_vector_db_integrity chromadb)" = "true" ]; then
    echo "✅ LangChain + ChromaDB RAG system files are complete and valid"
else
    echo "🔧 ChromaDB files incomplete or corrupted, rebuilding..."
    if [ -n "$OPENAI_API_KEY" ]; then
        echo "🔑 OPENAI_API_KEY found, running full LangChain RAG setup..."
        ./run_langchain_rag_setup_docker.sh || echo "⚠️ LangChain RAG setup failed, will create fallback"
    else
        echo "⚠️ OPENAI_API_KEY not set, creating fallback configuration..."
        mkdir -p data/chromadb
        echo '{"status": "not_initialized", "message": "OPENAI_API_KEY not available"}' > data/rag_config_langchain.json
    fi
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
