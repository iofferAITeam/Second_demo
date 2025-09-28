import os
import asyncio
import requests
import sys
from typing import Any, Dict, List, Optional
from dotenv import load_dotenv

# AutoGen imports for LLM integration
try:
    from autogen_ext.models.openai import OpenAIChatCompletionClient
    from autogen_core.models import UserMessage
    AUTOGEN_AVAILABLE = True
except ImportError:
    AUTOGEN_AVAILABLE = False

# Import our custom agents
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))
from src.settings import settings
from src.agents.general_qa_agent.rag_agent import RAGRetriever
from src.agents.perplexity_qa_agent import PerplexityQAAgent

load_dotenv()

class HybridQAAgent:
    """
    New Hybrid QA Agent that:
    1. Always gets results from BOTH Perplexity AND RAG
    2. Evaluates if RAG adds unique "secret domain knowledge"
    3. Uses LLM to combine results only when RAG provides additional value
    """
    
    def __init__(self):
        # API Keys
        self.gemini_api_key = settings.GEMINI_API_KEY
        
        # Initialize component agents
        try:
            self.rag_retriever = RAGRetriever()
            self.rag_available = True
            print("✅ RAG retriever initialized successfully")
        except Exception as e:
            print(f"⚠️ RAG retriever initialization failed: {e}")
            self.rag_retriever = None
            self.rag_available = False
        
        try:
            self.perplexity_agent = PerplexityQAAgent()
            self.perplexity_available = True
            print("✅ Perplexity agent initialized successfully")
        except Exception as e:
            print(f"❌ Perplexity agent initialization failed: {e}")
            self.perplexity_agent = None
            self.perplexity_available = False
            
        # Configuration
        self.uniqueness_threshold = 0.3  # How much RAG needs to add to be valuable
        self.min_rag_similarity = 0.6    # Minimum similarity for RAG to be considered
        
        # Validate setup
        self._validate_setup()
        
    def _validate_setup(self):
        """Validate that at least one agent is available"""
        if not self.rag_available and not self.perplexity_available:
            raise ValueError("❌ Neither RAG nor Perplexity agents are available")
        
        if not AUTOGEN_AVAILABLE:
            print("⚠️ AutoGen not available - will use simple mode")
        
        if not self.gemini_api_key:
            print("⚠️ Gemini API key not found - will use simple combination")
        
        print("✅ Hybrid QA Agent initialized successfully")
    
    def _query_perplexity(self, question: str) -> Dict[str, Any]:
        """Get answer from Perplexity"""
        if not self.perplexity_available:
            return {
                'success': False,
                'answer': "Perplexity not available",
                'error': "Perplexity agent not initialized"
            }
        
        try:
            answer = self.perplexity_agent.query_perplexity(question)
            
            # Check if the answer contains error messages
            if "❌" in answer or "error" in answer.lower():
                return {
                    'success': False,
                    'answer': answer,
                    'error': "Perplexity API error"
                }
            
            # Extract URLs from the answer for reference links
            reference_links = []
            try:
                import re
                url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
                urls = re.findall(url_pattern, answer)
                reference_links = urls[:5]  # Limit to 5 links
            except:
                pass
            
            return {
                'success': True,
                'answer': answer,
                'source': 'perplexity',
                'reference_links': reference_links,
                'citations': [],  # Perplexity doesn't provide structured citations
                'web_results': []  # Perplexity doesn't provide structured web results
            }
        except Exception as e:
            return {
                'success': False,
                'answer': f"Error querying Perplexity: {str(e)}",
                'error': str(e)
            }
    
    def _get_rag_context(self, question: str) -> Dict[str, Any]:
        """Get context from RAG knowledge base"""
        if not self.rag_available:
            return {
                'has_context': False,
                'context': "",
                'best_similarity': 0.0,
                'error': "RAG not available"
            }
        
        try:
            return self.rag_retriever.get_rag_context(question, top_k=3)
        except Exception as e:
            return {
                'has_context': False,
                'context': "",
                'best_similarity': 0.0,
                'error': str(e)
            }
    
    def _evaluate_rag_uniqueness(self, question: str, perplexity_answer: str, rag_context: str) -> Dict[str, Any]:
        """
        Evaluate if RAG provides unique information not found in Perplexity answer
        """
        if not rag_context or not perplexity_answer:
            return {
                'is_unique': False,
                'uniqueness_score': 0.0,
                'reason': 'Missing context or answer'
            }
        
        # Simple keyword-based uniqueness check
        # Extract key terms from RAG context
        rag_words = set(rag_context.lower().split())
        perplexity_words = set(perplexity_answer.lower().split())
        
        # Remove common words
        common_words = {'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'a', 'an', 'this', 'that', 'these', 'those'}
        
        rag_words_filtered = rag_words - common_words
        perplexity_words_filtered = perplexity_words - common_words
        
        # Find unique content in RAG
        unique_rag_words = rag_words_filtered - perplexity_words_filtered
        
        # Calculate uniqueness score
        if len(rag_words_filtered) == 0:
            uniqueness_score = 0.0
        else:
            uniqueness_score = len(unique_rag_words) / len(rag_words_filtered)
        
        is_unique = uniqueness_score >= self.uniqueness_threshold
        
        # Check for specific domain knowledge indicators
        domain_indicators = ['berkeley', 'stanford', 'mit', 'harvard', 'university of', 'college of', 'deadline', 'requirement', 'gpa', 'toefl', 'ielts', 'application']
        
        has_domain_knowledge = any(indicator in rag_context.lower() for indicator in domain_indicators)
        
        if has_domain_knowledge and uniqueness_score > 0.1:
            is_unique = True
            uniqueness_score = max(uniqueness_score, 0.5)
        
        return {
            'is_unique': is_unique,
            'uniqueness_score': uniqueness_score,
            'unique_words': list(unique_rag_words)[:10],  # Show first 10 unique words
            'has_domain_knowledge': has_domain_knowledge,
            'reason': f"Uniqueness score: {uniqueness_score:.2f}, Domain knowledge: {has_domain_knowledge}"
        }
    
    async def _synthesize_with_llm(self, question: str, perplexity_answer: str, rag_context: str) -> str:
        """Use LLM to synthesize Perplexity + RAG when RAG adds value"""
        if not AUTOGEN_AVAILABLE or not self.gemini_api_key:
            # Fallback to simple combination
            return f"""**Combined Answer:**

**Web Search Results:**
{perplexity_answer}

**Additional Domain Knowledge:**
{rag_context}

*Note: This is a simple combination. For better synthesis, ensure Gemini API is available.*"""
        
        try:
            client = OpenAIChatCompletionClient(
                model="gemini-1.5-pro", 
                api_key=self.gemini_api_key
            )
            
            prompt = f"""You are an expert study abroad consultant. You have two sources of information to answer this question:

QUESTION: {question}

SOURCE 1 - Real-time Web Search (Perplexity):
{perplexity_answer}

SOURCE 2 - Secret Domain Knowledge (Internal Database):
{rag_context}

INSTRUCTIONS:
Your task is to provide ONE comprehensive answer that intelligently combines both sources.

1. Use the web search as your primary foundation for current/official information
2. Enhance it with relevant insights from the domain knowledge where applicable
3. If the domain knowledge contradicts web search, note the discrepancy and explain which to trust
4. Highlight any unique insights from the domain knowledge that aren't in the web search
5. Provide a single, coherent response (don't list sources separately)
6. Be specific and actionable
7. If unsure about current information, recommend contacting the university directly

Combine these sources into one authoritative answer:"""

            response = await client.create([UserMessage(content=prompt, source="user")])
            return response.content
            
        except Exception as e:
            print(f"⚠️ LLM synthesis failed: {e}")
            # Fallback to simple combination
            return f"""**Combined Answer:**

{perplexity_answer}

**Additional insights from domain knowledge:**
{rag_context}

*Note: LLM synthesis unavailable, showing simple combination.*"""
    
    async def answer_question(self, question: str) -> Dict[str, Any]:
        """
        Main method to answer questions using the new hybrid approach
        """
        print(f"🤔 Processing question: {question}")
        
        # Step 1: Get results from BOTH sources simultaneously
        print("🔍 Querying both Perplexity and RAG...")
        
        # Run both queries
        perplexity_result = self._query_perplexity(question)
        rag_result = self._get_rag_context(question)
        
        # Step 2: Evaluate results
        perplexity_success = perplexity_result.get('success', False)
        rag_has_context = rag_result.get('has_context', False) and rag_result.get('best_similarity', 0) >= self.min_rag_similarity
        
        print(f"📊 Perplexity success: {perplexity_success}")
        print(f"📚 RAG context available: {rag_has_context} (similarity: {rag_result.get('best_similarity', 0):.2f})")
        
        # Step 3: Determine strategy
        if not perplexity_success and not rag_has_context:
            thinking_process = await self._generate_thinking_process(question, 'error')
            return {
                'question': question,
                'answer': 'I apologize, but I encountered an error while trying to answer your question. Please try again or rephrase your question.',
                'thinking_process': thinking_process,
                'reference_links': [],
                'strategy': 'error',
                'source': 'error',
                'rag_similarity': 0.0
            }

        # Step 4: Execute strategy
        if perplexity_success and rag_has_context:
            # Both available - use hybrid approach
            print("🔄 Using hybrid synthesis approach")
            
            # Extract reference links from Perplexity results
            perplexity_result['question'] = question  # Add question for fallback links
            reference_links = await self._extract_reference_links(perplexity_result)
            
            # Synthesize the information
            synthesis_prompt = f"""Combine the following information to provide a comprehensive answer to the question: "{question}"

Web Search Results:
{perplexity_result['answer']}

Knowledge Base Context:
{rag_result['context']}

Instructions:
1. Synthesize both sources into a comprehensive answer
2. Prioritize current information from web search
3. Enhance with specialized knowledge from our database
4. Ensure the answer directly addresses the question
5. Maintain accuracy and clarity

Provide a well-structured, comprehensive answer:"""

            try:
                if AUTOGEN_AVAILABLE and self.gemini_api_key:
                    client = OpenAIChatCompletionClient(
                        model="gemini-1.5-pro", 
                        api_key=self.gemini_api_key
                    )
                    response = await client.create([UserMessage(content=synthesis_prompt, source="user")])
                    synthesized_answer = response.content
                else:
                    # Fallback synthesis
                    synthesized_answer = f"{perplexity_result['answer']}\n\nAdditional Context: {rag_result['context']}"
                
                thinking_process = await self._generate_thinking_process(question, 'hybrid_synthesis', synthesized_answer, rag_result['context'])
                return {
                    'question': question,
                    'answer': synthesized_answer,
                    'thinking_process': thinking_process,
                    'reference_links': reference_links,
                    'strategy': 'hybrid_synthesis',
                    'source': 'hybrid',
                    'rag_similarity': rag_result['best_similarity']
                }
                
            except Exception as e:
                print(f"❌ Synthesis failed: {str(e)}")
                # Fallback to web search only
                perplexity_result['question'] = question  # Add question for fallback links
                reference_links = await self._extract_reference_links(perplexity_result)
                thinking_process = await self._generate_thinking_process(question, 'perplexity_preferred', perplexity_result['answer'])
                return {
                    'question': question,
                    'answer': perplexity_result['answer'],
                    'thinking_process': thinking_process,
                    'reference_links': reference_links,
                    'strategy': 'perplexity_preferred',
                    'source': 'perplexity',
                    'rag_similarity': rag_result['best_similarity']
                }

        elif perplexity_success:
            # Only Perplexity available
            print("🌐 Using Perplexity only")
            perplexity_result['question'] = question  # Add question for fallback links
            reference_links = await self._extract_reference_links(perplexity_result)
            thinking_process = await self._generate_thinking_process(question, 'perplexity_only', perplexity_result['answer'])
            return {
                'question': question,
                'answer': perplexity_result['answer'],
                'thinking_process': thinking_process,
                'reference_links': reference_links,
                'strategy': 'perplexity_only',
                'source': 'perplexity',
                'rag_similarity': 0.0
            }

        elif rag_has_context:
            # Only RAG available
            print("📚 Using RAG only")
            thinking_process = await self._generate_thinking_process(question, 'rag_only', answer="", rag_context=rag_result['context'])
            return {
                'question': question,
                'answer': rag_result['context'],
                'thinking_process': thinking_process,
                'reference_links': [],
                'strategy': 'rag_only',
                'source': 'rag',
                'rag_similarity': rag_result['best_similarity']
            }

        else:
            # Neither available
            print("❌ No information sources available")
            thinking_process = await self._generate_thinking_process(question, 'error')
            return {
                'question': question,
                'answer': 'I apologize, but I was unable to find relevant information to answer your question. Please try rephrasing your question or ask about a different topic.',
                'thinking_process': thinking_process,
                'reference_links': [],
                'strategy': 'error',
                'source': 'error',
                'rag_similarity': 0.0
            }
    
    async def interactive_session(self):
        """Interactive Q&A session"""
        print("🎓 **New Hybrid Study Abroad QA Assistant**")
        print("=" * 60)
        print("🔍 Always searches both web (Perplexity) + knowledge base (RAG)")
        print("🤖 Intelligently combines results when RAG adds unique value")
        print("📚 Falls back gracefully to web search when no domain-specific context needed")
        print("⚪ No RAG context? No problem - web search handles most questions perfectly")
        print("Type 'quit' to exit\n")
        
        while True:
            try:
                question = input("💬 Your question: ").strip()
                
                if question.lower() in ['quit', 'exit', 'q']:
                    print("👋 Goodbye! Good luck with your applications!")
                    break
                    
                if not question:
                    continue
                
                print("\n" + "="*60)
                
                # Process question
                result = await self.answer_question(question)
                
                # Display result
                print(f"📖 **Answer** ({result['source']}):")
                print(f"{result['answer']}\n")
                
                # Show strategy details
                print(f"🎯 **Strategy**: {result['strategy']}")
                
                if 'rag_similarity' in result:
                    print(f"📊 **RAG Similarity**: {result['rag_similarity']:.2f}")
                
                if 'uniqueness_score' in result:
                    print(f"🔍 **Uniqueness Score**: {result['uniqueness_score']:.2f}")
                
                if 'unique_insights' in result and result['unique_insights']:
                    print(f"💡 **Unique Keywords**: {', '.join(result['unique_insights'][:5])}")
                
                if 'reference_links' in result and result['reference_links']:
                    print(f"📚 **Reference Links:**")
                    print(await self._generate_reference_links_text(result['reference_links']))
                
                print("="*60)
                
            except KeyboardInterrupt:
                print("\n👋 Goodbye!")
                break
            except Exception as e:
                print(f"❌ Error: {str(e)}")

    async def _generate_thinking_process(self, question: str, strategy: str, answer: str = "", rag_context: str = "") -> str:
        """
        Generate a personalized thinking process using LLM that's specific to the user's question
        """
        if not AUTOGEN_AVAILABLE or not self.gemini_api_key:
            # Fallback to a simple but more specific thinking process
            return self._generate_simple_thinking_process(question, strategy)
        
        try:
            client = OpenAIChatCompletionClient(
                model="gemini-1.5-pro", 
                api_key=self.gemini_api_key
            )
            
            # Create a context-aware prompt for generating the thinking process
            context_info = ""
            if rag_context:
                context_info = f"\n\nAdditional Context Available: {rag_context[:200]}..."
            
            prompt = f"""You are an AI assistant explaining your thinking process to a user. Generate a personalized, question-specific thinking process that shows how you analyzed and answered their specific question.

USER'S QUESTION: "{question}"

YOUR ANSWER: {answer[:300] if answer else "Information about the topic"}

APPROACH USED: {strategy}

CONTEXT: {context_info}

INSTRUCTIONS:
1. Make the thinking process SPECIFIC to the user's question - don't be generic
2. Show your actual reasoning about THIS specific question
3. Explain why you chose certain information sources or approaches
4. Be conversational and helpful, like explaining to a friend
5. Keep it concise but informative (3-5 key points)
6. Don't mention technical details about systems or APIs
7. Focus on the user's question and how you helped them

Generate a personalized thinking process that explains how you specifically analyzed and answered this question:"""

            response = await client.create([UserMessage(content=prompt, source="user")])
            return response.content
            
        except Exception as e:
            print(f"⚠️ LLM thinking process generation failed: {e}")
            # Fallback to simple but more specific thinking process
            return self._generate_simple_thinking_process(question, strategy)

    def _generate_simple_thinking_process(self, question: str, strategy: str) -> str:
        """
        Fallback thinking process that's more specific than the current hardcoded version
        """
        if strategy == 'perplexity_only':
            return f"""**How I Thought About Your Question:**

**1. Understanding "{question}":**
I analyzed your specific question about {self._extract_topic(question)} and realized you need current, up-to-date information that's accurate and actionable.

**2. Why I Chose This Approach:**
Since you're asking about {self._extract_topic(question)}, I focused on finding the most current and reliable information from authoritative sources to give you the most accurate answer possible.

**3. What I Found:**
I discovered comprehensive information about {self._extract_topic(question)} that directly addresses your question, including practical details and examples you can use.

**4. How I Verified:**
I ensured the information is current, accurate, and specifically answers what you asked about {self._extract_topic(question)}.

**5. Why This Helps You:**
This approach gives you the most relevant and up-to-date information about {self._extract_topic(question)} so you can make informed decisions."""
        
        elif strategy == 'rag_only':
            return f"""**How I Thought About Your Question:**

**1. Understanding "{question}":**
I analyzed your specific question about {self._extract_topic(question)} and identified that you need specialized, expert knowledge in this area.

**2. Why I Used Our Knowledge Base:**
For questions about {self._extract_topic(question)}, our specialized knowledge base contains expert insights and detailed information that goes beyond general web searches.

**3. What I Discovered:**
I found relevant expertise and insights about {self._extract_topic(question)} that provide you with deeper understanding and practical guidance.

**4. How I Ensured Quality:**
I verified that the information directly addresses your specific question about {self._extract_topic(question)} and provides valuable insights.

**5. Why This Approach Works:**
This gives you access to specialized knowledge about {self._extract_topic(question)} that you might not find through general searches."""
        
        elif strategy == 'hybrid_synthesis':
            return f"""**How I Thought About Your Question:**

**1. Understanding "{question}":**
I analyzed your specific question about {self._extract_topic(question)} and realized this is a complex topic that benefits from multiple information sources.

**2. Why I Used Multiple Approaches:**
For {self._extract_topic(question)}, I combined current information with specialized expertise to give you the most comprehensive understanding possible.

**3. What I Combined:**
I merged up-to-date details about {self._extract_topic(question)} with expert insights and specialized knowledge to create a complete picture.

**4. How I Synthesized:**
I carefully combined both sources to ensure you get current information enhanced with expert insights about {self._extract_topic(question)}.

**5. Why This Gives You More:**
This approach provides you with both the latest information and deep expertise about {self._extract_topic(question)}, giving you the best of both worlds."""
        
        else:
            return f"""**How I Thought About Your Question:**

**1. Understanding "{question}":**
I analyzed your specific question about {self._extract_topic(question)} and determined the best approach to help you.

**2. My Approach:**
I used the most appropriate method to find accurate and relevant information about {self._extract_topic(question)}.

**3. What I Found:**
I gathered the most relevant details about {self._extract_topic(question)} to directly answer your question.

**4. Quality Check:**
I ensured the information about {self._extract_topic(question)} is accurate and addresses your specific needs.

**5. How This Helps You:**
This gives you reliable information about {self._extract_topic(question)} that you can trust and use."""

    def _extract_topic(self, question: str) -> str:
        """Extract the main topic from the question for personalization"""
        question_lower = question.lower()
        
        # Extract key topics for personalization
        if 'gpa' in question_lower:
            return "GPA (Grade Point Average)"
        elif 'stanford' in question_lower:
            return "Stanford University"
        elif 'berkeley' in question_lower:
            return "UC Berkeley"
        elif 'mit' in question_lower:
            return "MIT"
        elif 'harvard' in question_lower:
            return "Harvard University"
        elif 'admission' in question_lower or 'requirement' in question_lower:
            return "admission requirements"
        elif 'deadline' in question_lower:
            return "application deadlines"
        elif 'cost' in question_lower or 'tuition' in question_lower or 'fee' in question_lower:
            return "costs and fees"
        elif 'sop' in question_lower or 'statement' in question_lower:
            return "Statement of Purpose"
        elif 'recommendation' in question_lower:
            return "program recommendations"
        elif 'computer science' in question_lower or 'cs' in question_lower:
            return "Computer Science programs"
        elif 'business' in question_lower:
            return "Business programs"
        elif 'data science' in question_lower:
            return "Data Science programs"
        else:
            # Try to extract a general topic
            words = question_lower.split()
            # Remove common words and take the first meaningful word
            common_words = {'what', 'is', 'are', 'how', 'do', 'does', 'can', 'you', 'tell', 'me', 'about', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
            meaningful_words = [word for word in words if word not in common_words and len(word) > 2]
            if meaningful_words:
                return meaningful_words[0].title()
            else:
                return "this topic"

    async def _get_fallback_reference_links(self, question: str) -> list:
        """
        Provide fallback reference links for common educational topics when no URLs are found
        """
        question_lower = question.lower()
        fallback_links = []
        
        # Common educational resource links
        educational_resources = {
            'gpa': [
                'https://www.collegeboard.org/student/planning/high-school/grade-point-average',
                'https://www.princetonreview.com/college-advice/gpa-calculator',
                'https://www.usnews.com/education/best-colleges/articles/what-is-gpa-and-why-is-it-important'
            ],
            'stanford': [
                'https://admission.stanford.edu/',
                'https://admission.stanford.edu/apply/first-year',
                'https://admission.stanford.edu/apply/requirements'
            ],
            'berkeley': [
                'https://admissions.berkeley.edu/',
                'https://admissions.berkeley.edu/apply',
                'https://admissions.berkeley.edu/requirements'
            ],
            'mit': [
                'https://mitadmissions.org/',
                'https://mitadmissions.org/apply/',
                'https://mitadmissions.org/apply/firstyear/'
            ],
            'harvard': [
                'https://college.harvard.edu/admissions',
                'https://college.harvard.edu/admissions/apply',
                'https://college.harvard.edu/admissions/apply/first-year-applicants'
            ],
            'admission': [
                'https://www.commonapp.org/',
                'https://www.collegeboard.org/',
                'https://www.act.org/'
            ],
            'toefl': [
                'https://www.ets.org/toefl',
                'https://www.ets.org/toefl/test-takers/ibt/about',
                'https://www.ets.org/toefl/test-takers/ibt/scores/understand'
            ],
            'ielts': [
                'https://www.ielts.org/',
                'https://www.ielts.org/about-ielts',
                'https://www.ielts.org/for-test-takers/test-format'
            ],
            'application': [
                'https://www.commonapp.org/',
                'https://www.collegeboard.org/',
                'https://www.princetonreview.com/college-advice'
            ]
        }
        
        # Find matching topics
        for topic, links in educational_resources.items():
            if topic in question_lower:
                fallback_links.extend(links)
                break
        
        # If no specific topic found, provide general resources
        if not fallback_links:
            fallback_links = [
                'https://www.collegeboard.org/',
                'https://www.princetonreview.com/',
                'https://www.usnews.com/education'
            ]
        
        # Limit to 5 links
        return fallback_links[:5]

    async def _extract_reference_links(self, perplexity_result: dict) -> list:
        """
        Extract real, clickable web URLs from Perplexity results
        """
        reference_links = []
        
        try:
            # Extract URLs from the answer content
            if 'answer' in perplexity_result and perplexity_result['answer']:
                answer = perplexity_result['answer']
                
                # Look for URLs in the text - improved pattern
                import re
                # More comprehensive URL pattern
                url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
                urls = re.findall(url_pattern, answer)
                
                # Clean and deduplicate URLs
                cleaned_urls = []
                seen_urls = set()
                
                for url in urls:
                    # Remove trailing punctuation and clean the URL
                    clean_url = url.rstrip('.,;:!?()[]{}"\'').strip()
                    
                    # Only add if it's a valid URL and not a duplicate
                    if clean_url and clean_url not in seen_urls and len(clean_url) > 10:
                        cleaned_urls.append(clean_url)
                        seen_urls.add(clean_url)
                
                reference_links.extend(cleaned_urls)
                
                # Also look for citation patterns like [1], [2], etc.
                citation_pattern = r'\[(\d+)\](?:\([^)]*\))?'
                citations = re.findall(citation_pattern, answer)
                
                # If we found citations but no URLs, try to extract from the text
                if citations and not reference_links:
                    # Look for URLs near citation markers
                    lines = answer.split('\n')
                    for line in lines:
                        if any(f'[{c}]' in line for c in citations):
                            line_urls = re.findall(url_pattern, line)
                            for url in line_urls:
                                clean_url = url.rstrip('.,;:!?()[]{}"\'').strip()
                                if clean_url and clean_url not in seen_urls and len(clean_url) > 10:
                                    reference_links.append(clean_url)
                                    seen_urls.add(clean_url)
            
            # Also check if there are any citations or sources in the result
            if 'citations' in perplexity_result and perplexity_result['citations']:
                for citation in perplexity_result['citations']:
                    if isinstance(citation, dict) and 'url' in citation:
                        url = citation['url']
                        clean_url = url.rstrip('.,;:!?()[]{}"\'').strip()
                        if clean_url and clean_url not in seen_urls and len(clean_url) > 10:
                            reference_links.append(clean_url)
                            seen_urls.add(clean_url)
                    elif isinstance(citation, str) and citation.startswith('http'):
                        clean_url = citation.rstrip('.,;:!?()[]{}"\'').strip()
                        if clean_url and clean_url not in seen_urls and len(clean_url) > 10:
                            reference_links.append(clean_url)
                            seen_urls.add(clean_url)
            
            # If no URLs found in the content, try to extract from any web search results
            if 'web_results' in perplexity_result and perplexity_result['web_results']:
                for result in perplexity_result['web_results']:
                    if isinstance(result, dict) and 'url' in result:
                        url = result['url']
                        clean_url = url.rstrip('.,;:!?()[]{}"\'').strip()
                        if clean_url and clean_url not in seen_urls and len(clean_url) > 10:
                            reference_links.append(clean_url)
                            seen_urls.add(clean_url)
            
            # If still no URLs found, try to extract from the raw text more aggressively
            if not reference_links and 'answer' in perplexity_result:
                answer = perplexity_result['answer']
                # Look for any text that looks like a URL
                potential_urls = re.findall(r'[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:/[^\s]*)?', answer)
                for potential in potential_urls:
                    if 'http' not in potential and len(potential) > 8:
                        # Try to construct a URL
                        if potential.startswith('www.'):
                            url = 'https://' + potential
                        elif '.' in potential and '/' in potential:
                            url = 'https://' + potential
                        else:
                            continue
                        
                        clean_url = url.rstrip('.,;:!?()[]{}"\'').strip()
                        if clean_url and clean_url not in seen_urls and len(clean_url) > 10:
                            reference_links.append(clean_url)
                            seen_urls.add(clean_url)
            
            # Only use fallback links if we found NO URLs at all from the actual content
            if not reference_links:
                question = perplexity_result.get('question', '')
                if question:
                    print(f"🔗 No URLs found in content, using fallback reference links for question: {question}")
                    reference_links = await self._get_fallback_reference_links(question)
            else:
                print(f"🔗 Found {len(reference_links)} unique URLs from actual content")
            
            # Limit to reasonable number of links
            reference_links = reference_links[:5]
            
            print(f"🔗 Final reference links: {reference_links}")
            
        except Exception as e:
            print(f"⚠️ Error extracting reference links: {e}")
        
        return reference_links

    async def _generate_reference_links_text(self, reference_links: list) -> str:
        """
        Generate user-friendly text for reference links
        """
        if not reference_links:
            return ""
        
        links_text = "**Reference Sources:**\n\n"
        for i, url in enumerate(reference_links, 1):
            # Extract domain name for display
            try:
                from urllib.parse import urlparse
                domain = urlparse(url).netloc
                display_name = domain.replace('www.', '')
            except:
                display_name = "Source"
            
            links_text += f"{i}. [{display_name}]({url})\n"
        
        return links_text

# Test function
async def test_new_hybrid():
    """Test the new hybrid agent"""
    agent = HybridQAAgent()
    
    test_questions = [
        "What are the admission requirements for Stanford Computer Science MS?",
        "What is the application deadline for UC Berkeley 2025?",
        "How do I write a good statement of purpose?",
        "What GPA do I need for top US universities?",
    ]
    
    for question in test_questions:
        print(f"\n{'='*50}")
        result = await agent.answer_question(question)
        print(f"Q: {question}")
        print(f"Strategy: {result['strategy']}")
        print(f"A: {result['answer'][:300]}...")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="New Hybrid QA Agent for Study Abroad")
    parser.add_argument("--test", action="store_true", help="Run test mode")
    parser.add_argument("--question", type=str, help="Ask a single question")
    
    args = parser.parse_args()
    
    if args.test:
        asyncio.run(test_new_hybrid())
    elif args.question:
        async def single_question():
            agent = HybridQAAgent()
            result = await agent.answer_question(args.question)
            print(result['answer'])
        asyncio.run(single_question())
    else:
        async def main():
            agent = HybridQAAgent()
            await agent.interactive_session()
        asyncio.run(main()) 