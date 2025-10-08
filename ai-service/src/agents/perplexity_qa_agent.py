import os
import asyncio
import requests
from typing import Any, Dict, List
from dotenv import load_dotenv

# For modern AutoGen - using the new agentchat version
try:
    from autogen_agentchat.agents import AssistantAgent
    from autogen_agentchat.teams import RoundRobinGroupChat
    from autogen_agentchat.messages import TextMessage
    from autogen_ext.models.openai import OpenAIChatCompletionClient

    MODERN_AUTOGEN = True
except ImportError:
    # Fallback to old AutoGen 0.2
    from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager

    MODERN_AUTOGEN = False

load_dotenv()


class PerplexityQAAgent:
    def __init__(self):
        # API Keys
        self.perplexity_api_key = os.getenv("PERPLEXITY_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")

        # Perplexity API endpoint
        self.perplexity_endpoint = "https://api.perplexity.ai/chat/completions"

        # Validate API keys
        if not self.perplexity_api_key:
            raise ValueError("PERPLEXITY_API_KEY not found in environment variables")
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")

        print("✅ API keys loaded successfully")

    def query_perplexity(self, question: str, model: str = "sonar") -> str:
        """
        Query the Perplexity API for study abroad information
        Available models: 'sonar', 'sonar-reasoning', 'sonar-deep-research'
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.perplexity_api_key}",
                "Content-Type": "application/json",
            }

            data = {
                "model": model,
                "messages": [
                    {
                        "role": "system",
                        "content": "Please be helpful when assist the specialized in university applications and studying abroad. Provide accurate, up-to-date information about admission requirements, deadlines, and procedures. Include specific details and cite sources when possible. IMPORTANT: When you find relevant information, include the actual URLs from your search results in your response so users can visit the source websites. Do NOT include generic sources like 'Perplexity AI' - only include real, clickable web page URLs.",
                    },
                    {"role": "user", "content": question},
                ],
                "temperature": 0.1,
                "max_tokens": 1500,
                "return_citations": True,  # Request citations
                "return_search_results": True,  # Request search results with URLs
                "return_images": False,
            }

            print(f"🔍 Querying Perplexity with model: {model}")
            print(f"🔗 Endpoint: {self.perplexity_endpoint}")

            response = requests.post(
                self.perplexity_endpoint, headers=headers, json=data, timeout=30
            )

            # Debug information
            print(f"📊 Response status: {response.status_code}")
            if response.status_code != 200:
                print(f"❌ Response content: {response.text}")

            response.raise_for_status()

            result = response.json()

            # Extract the main content
            main_content = result["choices"][0]["message"]["content"]

            # Try to extract citations if available (for internal use only)
            citations = []
            if "citations" in result:
                citations = result["citations"]
                print(
                    f"📚 Found {len(citations)} citations from Perplexity (for internal use)"
                )

            # Try to extract search results if available (for internal use only)
            search_results = []
            if "search_results" in result:
                search_results = result["search_results"]
                print(
                    f"🔍 Found {len(search_results)} search results from Perplexity (for internal use)"
                )

            # Clean the main content by removing sources section
            # Look for common patterns that indicate the end of the main answer
            clean_content = main_content

            # Remove sources section if present
            sources_patterns = [
                r"\*\*Sources:\*\*.*",
                r"\*\*Additional Sources:\*\*.*",
                r"\*\*References:\*\*.*",
                r"\n\n\*\*.*\*\*.*",  # Remove any bold headers followed by content
                r"\[here\]\([^)]+\)",  # Remove inline links like [here](url)
                r"For more.*?\.",  # Remove "For more information..." sentences
            ]

            import re

            for pattern in sources_patterns:
                clean_content = re.sub(
                    pattern, "", clean_content, flags=re.DOTALL | re.IGNORECASE
                )

            # Clean up extra whitespace and newlines
            clean_content = re.sub(
                r"\n\s*\n\s*\n", "\n\n", clean_content
            )  # Remove excessive newlines
            clean_content = clean_content.strip()

            # Add actual URLs from search results to the cleaned content
            if search_results:
                clean_content += "\n\n**Reference Sources:**\n"
                seen_urls = set()
                link_counter = 1

                for search_result in search_results:
                    if isinstance(search_result, dict):
                        title = search_result.get("title", "Source")
                        url = search_result.get("url", "")
                        if url and url not in seen_urls:
                            clean_url = url.rstrip(".,;:!?()[]{}\"'").strip()
                            if clean_url and len(clean_url) > 10:
                                clean_content += (
                                    f"{link_counter}. {title}: {clean_url}\n"
                                )
                                seen_urls.add(clean_url)
                                link_counter += 1
                        elif not url:
                            clean_content += f"{link_counter}. {title}\n"
                            link_counter += 1
                    else:
                        clean_content += f"{link_counter}. {search_result}\n"
                        link_counter += 1

            # Also add citations if they have URLs
            if citations:
                clean_content += "\n**Additional Sources:**\n"
                link_counter = 1

                for citation in citations:
                    if isinstance(citation, dict):
                        title = citation.get("title", "Source")
                        url = citation.get("url", "")
                        if url and url not in seen_urls:
                            clean_url = url.rstrip(".,;:!?()[]{}\"'").strip()
                            if clean_url and len(clean_url) > 10:
                                clean_content += (
                                    f"{link_counter}. {title}: {clean_url}\n"
                                )
                                seen_urls.add(clean_url)
                                link_counter += 1
                        elif not url:
                            clean_content += f"{link_counter}. {title}\n"
                            link_counter += 1
                    else:
                        clean_content += f"{link_counter}. {citation}\n"
                        link_counter += 1

            print("✅ Perplexity query successful")
            print(f"📝 Original content length: {len(main_content)} characters")
            print(f"🧹 Cleaned content length: {len(clean_content)} characters")

            return clean_content

        except requests.exceptions.RequestException as e:
            error_msg = f"❌ Perplexity API error: {str(e)}"
            if hasattr(e, "response") and e.response is not None:
                try:
                    error_details = e.response.json()
                    error_msg += f"\n📋 Error details: {error_details}"
                except:
                    error_msg += f"\n📋 Raw response: {e.response.text}"
            print(error_msg)
            return error_msg
        except KeyError as e:
            error_msg = f"❌ Unexpected response format: {str(e)}"
            print(error_msg)
            return error_msg
        except Exception as e:
            error_msg = f"❌ Unexpected error: {str(e)}"
            print(error_msg)
            return error_msg

    async def run_modern_qa_session(self, question: str) -> str:
        """
        Run QA session using modern AutoGen (agentchat)
        """
        if not MODERN_AUTOGEN:
            return "❌ Modern AutoGen not available. Please install autogen-agentchat."

        try:
            # Create model client
            model_client = OpenAIChatCompletionClient(
                model="gpt-4o-mini", api_key=self.openai_api_key
            )

            # Create enhanced assistant with Perplexity integration
            assistant = AssistantAgent(
                name="StudyAbroadAssistant",
                model_client=model_client,
                system_message=f"""You are a specialized study abroad consultant. When answering questions:

1. First, I'll provide you with up-to-date information from Perplexity AI
2. Use this information as your primary source
3. Add your own expertise and analysis
4. Provide structured, actionable advice
5. Include specific next steps for the student

Here's the latest information from Perplexity:

{self.query_perplexity(question)}

Now provide a comprehensive response based on this information.""",
            )

            # Create team
            team = RoundRobinGroupChat([assistant], max_turns=1)

            # Run the conversation
            print("🤖 Starting modern AutoGen QA session...")
            result = await team.run(task=question)

            return (
                result.messages[-1].content
                if result.messages
                else "No response generated"
            )

        except Exception as e:
            return f"❌ Modern QA session error: {str(e)}"

    def run_simple_qa_session(self, question: str) -> str:
        """
        Run a simple QA session using just Perplexity
        """
        print("🔍 Running simple Perplexity QA session...")

        # Get answer from Perplexity
        perplexity_answer = self.query_perplexity(question)

        # Format the response
        formatted_response = f"""🎓 **Study Abroad Q&A Result**

**Question:** {question}

**Answer from Perplexity AI:**
{perplexity_answer}

---
*Powered by Perplexity AI - Information is current and sourced from the web*
"""

        return formatted_response

    async def interactive_qa_session(self):
        """
        Interactive Q&A session
        """
        print("🎓 **Interactive Study Abroad Q&A Session**")
        print("=" * 50)
        print(
            "Ask questions about university admissions, requirements, deadlines, etc."
        )
        print("Type 'quit' to exit")
        print("=" * 50)

        while True:
            try:
                question = input("\n💬 Your question: ").strip()

                if question.lower() in ["quit", "exit", "q"]:
                    print("👋 Goodbye!")
                    break

                if not question:
                    continue

                print("\n" + "=" * 50)

                # Try modern AutoGen first, fallback to simple mode
                if MODERN_AUTOGEN:
                    try:
                        response = await self.run_modern_qa_session(question)
                        print(response)
                    except Exception as e:
                        print(f"⚠️ Modern mode failed: {e}")
                        print("🔄 Falling back to simple mode...")
                        print(self.run_simple_qa_session(question))
                else:
                    print(self.run_simple_qa_session(question))

                print("=" * 50)

            except KeyboardInterrupt:
                print("\n👋 Goodbye!")
                break
            except Exception as e:
                print(f"❌ Error: {str(e)}")


def test_perplexity_api():
    """Test Perplexity API connection"""
    try:
        agent = PerplexityQAAgent()
        test_question = "What are the general requirements for studying abroad?"
        result = agent.query_perplexity(test_question)
        print("🧪 **API Test Result:**")
        print(result[:200] + "..." if len(result) > 200 else result)

        # Check if the result contains an error message
        if "❌" in result or "error" in result.lower():
            print("\n⚠️ **API test detected an error in the response**")
            return False

        return True
    except Exception as e:
        print(f"❌ API Test Failed: {str(e)}")
        return False


async def main():
    """Main function to run the QA agent"""

    print("🎓 **Perplexity Study Abroad QA Agent**")
    print("=" * 50)

    # Test API first
    if not test_perplexity_api():
        print("\n❌ Please check your API keys and try again.")
        return

    # Create agent
    try:
        agent = PerplexityQAAgent()

        # Check what mode we're running
        if MODERN_AUTOGEN:
            print("✅ Modern AutoGen available")
        else:
            print(
                "⚠️ Using simple mode (install autogen-agentchat for enhanced features)"
            )

        # Run interactive session
        await agent.interactive_qa_session()

    except Exception as e:
        print(f"❌ Failed to initialize agent: {str(e)}")


if __name__ == "__main__":
    asyncio.run(main())
