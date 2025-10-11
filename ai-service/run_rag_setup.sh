#!/bin/bash

echo "🎓 RAG Setup for Hybrid QA Agent"
echo "================================="
echo ""

# Check if we're in the correct directory
if [ ! -f "pyproject.toml" ] || [ ! -d "src/agents" ]; then
    echo "❌ Please run this script from the project root directory"
    echo "💡 Expected structure: pyproject.toml, src/agents/, data/"
    exit 1
fi

# Check if uv is available
if ! command -v uv &> /dev/null; then
    echo "❌ uv not found. Please install uv first."
    exit 1
fi

echo "📦 Installing required dependencies..."
echo ""

# Install core dependencies
echo "⚡ Installing core packages..."
uv add pandas numpy faiss-cpu openai python-dotenv

# Install AutoGen for enhanced features (optional)
echo "🤖 Installing AutoGen for enhanced features..."
uv add "autogen-agentchat" "autogen-ext[openai]" || echo "⚠️ AutoGen installation failed - will work in basic mode"

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Check API keys (flexible for Docker and local environments)
echo "🔑 Checking API keys..."

# Check OPENAI_API_KEY (from .env file or environment)
if [ -n "$OPENAI_API_KEY" ]; then
    echo "✅ OPENAI_API_KEY found in environment"
elif grep -q "OPENAI_API_KEY=" .env 2>/dev/null; then
    echo "✅ OPENAI_API_KEY found in .env"
else
    echo "❌ OPENAI_API_KEY not found in .env file"
    echo "Please add: OPENAI_API_KEY=sk-your-key-here"
    exit 1
fi

# Check PERPLEXITY_API_KEY (from .env file or environment) - optional
if [ -n "$PERPLEXITY_API_KEY" ]; then
    echo "✅ PERPLEXITY_API_KEY found in environment"
elif grep -q "PERPLEXITY_API_KEY=" .env 2>/dev/null; then
    echo "✅ PERPLEXITY_API_KEY found in .env"
else
    echo "❌ PERPLEXITY_API_KEY not found in .env file"
    echo "Please add: PERPLEXITY_API_KEY=pplx-your-key-here"
    # Don't exit for PERPLEXITY_API_KEY as it's not critical for basic RAG setup
    echo "⚠️ Continuing without PERPLEXITY_API_KEY (some features may be limited)"
fi

# Check if CSV file exists
if [ ! -f "data/qa_pairs.csv" ]; then
    echo "❌ qa_pairs.csv not found in data/ directory"
    echo "Please ensure the CSV file exists at: data/qa_pairs.csv"
    exit 1
fi

echo ""
echo "📁 Ensuring data directory exists..."
mkdir -p data
echo "✅ Data directory ready: ./data/"

# Show CSV file info
if [ -f "data/qa_pairs.csv" ]; then
    QA_COUNT=$(tail -n +2 "data/qa_pairs.csv" | wc -l | tr -d ' ')
    echo "📊 Found qa_pairs.csv with $QA_COUNT Q&A pairs"
fi

echo ""
echo "🚀 Starting RAG data preparation..."
echo "This will:"
echo "  • Load Q&A pairs from CSV in data/ directory"
echo "  • Generate OpenAI text-embedding-3-large embeddings"
echo "  • Build FAISS similarity search index"
echo "  • Create all required files in ./data/ directory"
echo ""

# Change to the general_qa_agent directory and run the preparation script
cd src/agents/general_qa_agent
uv run python prepare_rag_data.py

if [ $? -eq 0 ]; then
    # Go back to root directory
    cd ../../..
    
    echo ""
    echo "🎉 RAG setup completed successfully!"
    echo ""
    echo "🎯 What you can do now:"
    echo "  • Interactive hybrid agent: python src/agents/hybrid_qa_agent.py"
    echo "  • Ask single question: python src/agents/hybrid_qa_agent.py --question 'Stanford admission requirements'"
    echo "  • Run test mode: python src/agents/hybrid_qa_agent.py --test"
    echo "  • Test RAG only: python src/agents/general_qa_agent/rag_agent.py"
    echo ""
    echo "📊 Files available in data/ directory:"
    ls -la data/*.pkl data/*.index data/*.npy data/*.json 2>/dev/null || echo "No files found"
else
    cd ../../..
    echo ""
    echo "❌ RAG setup failed. Check the error messages above."
    exit 1
fi 