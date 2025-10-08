#!/bin/bash

# LangChain + ChromaDB RAG Setup Script for Docker Environment
# This script sets up the new RAG implementation using LangChain and ChromaDB in Docker

set -e  # Exit on any error

echo "🐳 LangChain + ChromaDB RAG Setup (Docker Environment)"
echo "====================================================="

# Check if we're in the right directory
if [ ! -f "pyproject.toml" ]; then
    echo "❌ Error: Please run this script from the ai-service directory"
    exit 1
fi

# Check if data directory exists
if [ ! -d "data" ]; then
    echo "❌ Error: data/ directory not found"
    echo "   Please ensure the data directory with qa_pairs.csv exists"
    exit 1
fi

# Check if qa_pairs.csv exists
if [ ! -f "data/qa_pairs.csv" ]; then
    echo "❌ Error: data/qa_pairs.csv not found"
    echo "   Please ensure the QA pairs CSV file exists in the data directory"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Check if dependencies are installed
echo ""
echo "📦 Checking dependencies..."
if ! python -c "import langchain" 2>/dev/null; then
    echo "❌ LangChain not found - dependencies should be installed via uv sync"
    exit 1
fi

if ! python -c "import chromadb" 2>/dev/null; then
    echo "❌ ChromaDB not found - dependencies should be installed via uv sync"
    exit 1
fi

echo "✅ Dependencies check passed"

# Check environment variables
echo ""
echo "🔑 Checking environment variables..."
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY environment variable not set"
    echo "   This is required for embedding generation"
    echo "   Make sure it's set in docker-compose.yml or .env"
    
    # Create placeholder config and exit
    echo "   Creating placeholder configuration..."
    mkdir -p data/chromadb
    echo '{"status": "not_initialized", "message": "OPENAI_API_KEY not available during setup"}' > data/rag_config_langchain.json
    echo "⚠️ RAG setup skipped - will retry at runtime when API key is available"
    exit 0
else
    echo "✅ OPENAI_API_KEY is set"
fi

# Create necessary directories
echo ""
echo "📁 Creating directories..."
mkdir -p data/chromadb
mkdir -p logs
echo "✅ Directories created"

# Run data preparation (with error handling for Docker environment)
echo ""
echo "🔧 Preparing RAG data with LangChain + ChromaDB..."
echo "   This may take a few minutes depending on the dataset size..."
echo ""

# Set Python path for Docker environment
export PYTHONPATH=/app:$PYTHONPATH

# Run the preparation script with proper error handling
if python src/agents/general_qa_agent/prepare_rag_data_langchain.py; then
    echo ""
    echo "✅ Data preparation completed successfully!"
else
    echo ""
    echo "❌ Data preparation failed"
    
    # In Docker build context, we might want to continue with a warning
    # rather than failing the entire build
    if [ "$DOCKER_BUILD_CONTEXT" = "true" ]; then
        echo "⚠️  Running in Docker build context - continuing anyway"
        echo "   RAG data preparation can be done at runtime"
        
        # Create placeholder files to prevent runtime errors
        touch data/rag_config_langchain.json
        mkdir -p data/chromadb
        
        echo '{"status": "not_initialized", "message": "Run setup at runtime"}' > data/rag_config_langchain.json
    else
        exit 1
    fi
fi

# Run basic validation (skip embedding tests in Docker build)
echo ""
echo "🔍 Running basic validation..."

if [ -f "data/rag_config_langchain.json" ]; then
    echo "✅ Configuration file exists"
else
    echo "⚠️  Configuration file not found - may need runtime setup"
fi

if [ -d "data/chromadb" ]; then
    echo "✅ ChromaDB directory exists"
else
    echo "⚠️  ChromaDB directory not found - may need runtime setup"
fi

# Final summary
echo ""
echo "🎉 LangChain + ChromaDB RAG Docker Setup Complete!"
echo "=================================================="
echo ""
echo "📁 Expected files:"
echo "   • data/chromadb/ - ChromaDB vector database"
echo "   • data/rag_config_langchain.json - Configuration file"
echo ""
echo "🐳 Docker Integration Notes:"
echo "   • Make sure OPENAI_API_KEY is set in docker-compose.yml"
echo "   • ChromaDB data will persist in Docker volumes"
echo "   • RAG setup runs during Docker build process"
echo ""
echo "🚀 Ready for Docker deployment!"
echo ""
echo "🔧 To use in your application:"
echo "   from src.agents.general_qa_agent.rag_agent_langchain import LangChainRAGRetriever"
echo "   retriever = LangChainRAGRetriever()"
echo "   result = retriever.get_rag_context('your question here')"
echo ""
