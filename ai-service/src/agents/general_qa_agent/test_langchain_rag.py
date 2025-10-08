#!/usr/bin/env python3
"""
Test script for LangChain + ChromaDB RAG implementation
Compares performance with original FAISS implementation
"""

import os
import sys
import time
import asyncio
from typing import Dict, Any, List

# Add the src path for importing settings
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))


def test_langchain_rag():
    """Test the LangChain + ChromaDB RAG implementation"""
    print("🧪 Testing LangChain + ChromaDB RAG Implementation")
    print("=" * 60)

    try:
        from rag_agent_langchain import LangChainRAGRetriever

        # Initialize retriever
        print("🔧 Initializing LangChain RAG Retriever...")
        start_time = time.time()
        retriever = LangChainRAGRetriever()
        init_time = time.time() - start_time
        print(f"✅ Initialization completed in {init_time:.2f} seconds")

        # Show collection info
        info = retriever.get_collection_info()
        if info:
            print(f"\n📊 Collection Information:")
            print(f"   • Collection: {info['collection_name']}")
            print(f"   • Documents: {info['document_count']}")
            print(f"   • Model: {info['embedding_model']}")
            print(f"   • Path: {info['chromadb_path']}")

        # Test queries
        test_queries = [
            "What are the admission requirements for graduate school?",
            "How do I apply for financial aid?",
            "What is the application deadline?",
            "Tell me about computer science programs",
            "What are the tuition fees?",
        ]

        print(f"\n🔍 Testing {len(test_queries)} sample queries:")
        print("-" * 60)

        total_retrieval_time = 0
        successful_retrievals = 0

        for i, query in enumerate(test_queries, 1):
            print(f"\n[Query {i}] {query}")

            # Measure retrieval time
            start_time = time.time()
            result = retriever.get_rag_context(query)
            retrieval_time = time.time() - start_time
            total_retrieval_time += retrieval_time

            print(f"⏱️ Retrieval time: {retrieval_time:.3f} seconds")

            if result["has_context"]:
                successful_retrievals += 1
                print(f"✅ Found {result['total_pairs']} relevant pairs")
                print(f"🎯 Best similarity: {result['best_similarity']:.3f}")

                # Show top result
                if result["retrieved_pairs"]:
                    top_result = result["retrieved_pairs"][0]
                    print(f"📝 Top result:")
                    print(f"   Q: {top_result['question'][:80]}...")
                    print(f"   A: {top_result['answer'][:80]}...")
            else:
                print("❌ No relevant context found")

        # Performance summary
        avg_retrieval_time = total_retrieval_time / len(test_queries)
        success_rate = (successful_retrievals / len(test_queries)) * 100

        print(f"\n📈 Performance Summary:")
        print(f"   • Average retrieval time: {avg_retrieval_time:.3f} seconds")
        print(
            f"   • Success rate: {success_rate:.1f}% ({successful_retrievals}/{len(test_queries)})"
        )
        print(f"   • Total test time: {total_retrieval_time:.3f} seconds")

        return True

    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False


def test_original_rag():
    """Test the original FAISS RAG implementation for comparison"""
    print("\n🧪 Testing Original FAISS RAG Implementation")
    print("=" * 60)

    try:
        from rag_agent import RAGRetriever

        # Initialize retriever
        print("🔧 Initializing FAISS RAG Retriever...")
        start_time = time.time()
        retriever = RAGRetriever()
        init_time = time.time() - start_time
        print(f"✅ Initialization completed in {init_time:.2f} seconds")

        # Test the same queries
        test_queries = [
            "What are the admission requirements for graduate school?",
            "How do I apply for financial aid?",
            "What is the application deadline?",
            "Tell me about computer science programs",
            "What are the tuition fees?",
        ]

        print(f"\n🔍 Testing {len(test_queries)} sample queries:")
        print("-" * 60)

        total_retrieval_time = 0
        successful_retrievals = 0

        for i, query in enumerate(test_queries, 1):
            print(f"\n[Query {i}] {query}")

            # Measure retrieval time
            start_time = time.time()
            result = retriever.get_rag_context(query)
            retrieval_time = time.time() - start_time
            total_retrieval_time += retrieval_time

            print(f"⏱️ Retrieval time: {retrieval_time:.3f} seconds")

            if result["has_context"]:
                successful_retrievals += 1
                print(f"✅ Found {result['total_pairs']} relevant pairs")
                print(f"🎯 Best similarity: {result['best_similarity']:.3f}")
            else:
                print("❌ No relevant context found")

        # Performance summary
        avg_retrieval_time = total_retrieval_time / len(test_queries)
        success_rate = (successful_retrievals / len(test_queries)) * 100

        print(f"\n📈 Performance Summary:")
        print(f"   • Average retrieval time: {avg_retrieval_time:.3f} seconds")
        print(
            f"   • Success rate: {success_rate:.1f}% ({successful_retrievals}/{len(test_queries)})"
        )
        print(f"   • Total test time: {total_retrieval_time:.3f} seconds")

        return True

    except Exception as e:
        print(f"❌ Original RAG test failed: {e}")
        print("💡 Make sure the original RAG data is prepared")
        return False


def main():
    """Main test function"""
    print("🚀 RAG Implementation Comparison Test")
    print("=" * 60)
    print(
        "This script tests both LangChain+ChromaDB and original FAISS implementations"
    )

    # Test LangChain implementation
    langchain_success = test_langchain_rag()

    # Test original implementation (if available)
    original_success = test_original_rag()

    # Final summary
    print("\n" + "=" * 60)
    print("🏁 Test Summary")
    print("=" * 60)
    print(f"LangChain + ChromaDB: {'✅ PASSED' if langchain_success else '❌ FAILED'}")
    print(f"Original FAISS:       {'✅ PASSED' if original_success else '❌ FAILED'}")

    if langchain_success:
        print("\n🎉 LangChain + ChromaDB RAG implementation is working correctly!")
        print("💡 You can now use the new implementation in your applications")
    else:
        print("\n⚠️ LangChain + ChromaDB implementation needs attention")
        print("💡 Make sure to run the data preparation script first:")
        print(
            "   uv run python src/agents/general_qa_agent/prepare_rag_data_langchain.py"
        )


if __name__ == "__main__":
    main()
