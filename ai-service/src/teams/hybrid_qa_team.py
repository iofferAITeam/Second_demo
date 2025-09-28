import json
from typing import Dict, Any
from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_agentchat.teams import Swarm
from autogen_agentchat.conditions import HandoffTermination, TextMentionTermination
from autogen_agentchat.messages import TextMessage
from autogen_core.tools import FunctionTool
from src.settings import settings
import asyncio
import sys
import os

# Import the hybrid QA agent
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))
from src.agents.hybrid_qa_agent import HybridQAAgent

class HybridQAAssistantAgent(AssistantAgent):
    """
    Simple AutoGen wrapper that uses standard AutoGen mechanisms
    """
    
    def __init__(self, *args, **kwargs):
        # Initialize the hybrid QA agent first
        try:
            self.hybrid_qa = HybridQAAgent()
            print("✅ Hybrid QA Agent integrated successfully")
        except Exception as e:
            print(f"❌ Failed to initialize Hybrid QA Agent: {e}")
            self.hybrid_qa = None
        
        # Update system message to include hybrid QA behavior
        if 'system_message' in kwargs:
            kwargs['system_message'] += f"""

IMPORTANT: You must call the hybrid QA function for every user question and include 'TERMINATE' at the end of your response.

When a user asks a question:
1. Use the hybrid_qa_query tool to get the answer
2. Present the answer clearly 
3. Always end with 'TERMINATE'
"""
        
        super().__init__(*args, **kwargs)

# Global hybrid QA agent instance
_global_hybrid_qa = None

async def hybrid_qa_query(question: str) -> str:
    """Query the hybrid QA system with a question"""
    global _global_hybrid_qa
    
    try:
        # Initialize the global hybrid QA agent if not already done
        if _global_hybrid_qa is None:
            try:
                _global_hybrid_qa = HybridQAAgent()
                print("✅ Global Hybrid QA Agent initialized")
            except Exception as e:
                print(f"❌ Failed to initialize Global Hybrid QA Agent: {e}")
                error_result = {
                    'question': question,
                    'answer': f"Error: Failed to initialize QA system: {str(e)}",
                    'thinking_process': "I encountered an error while trying to initialize the QA system. Please try again.",
                    'reference_links': [],
                    'strategy': 'error',
                    'source': 'error',
                    'rag_similarity': 0.0
                }
                return json.dumps(error_result, indent=2)
        
        # Get the result from the hybrid QA agent
        result = await _global_hybrid_qa.answer_question(question)
        
        # Clean the result for JSON serialization
        cleaned_result = _clean_result_for_json(result)
        
        # Ensure reference_links is included
        if 'reference_links' not in cleaned_result:
            cleaned_result['reference_links'] = []
        
        # Convert to JSON string
        return json.dumps(cleaned_result, indent=2)
        
    except Exception as e:
        print(f"❌ Error in hybrid_qa_query: {e}")
        error_result = {
            'question': question,
            'answer': f"Error occurred while processing your question: {str(e)}",
            'thinking_process': "I encountered an error while trying to answer your question. Please try again.",
            'reference_links': [],
            'strategy': 'error',
            'source': 'error',
            'rag_similarity': 0.0
        }
        return json.dumps(error_result, indent=2)

def _clean_result_for_json(obj):
    """Clean the result object to make it JSON serializable"""
    if isinstance(obj, dict):
        cleaned = {}
        for key, value in obj.items():
            try:
                cleaned[key] = _clean_result_for_json(value)
            except:
                # If we can't clean a key, skip it
                continue
        return cleaned
    elif isinstance(obj, list):
        return [_clean_result_for_json(item) for item in obj]
    elif isinstance(obj, (int, float, str, bool, type(None))):
        return obj
    else:
        # Handle numpy types specifically
        try:
            import numpy as np
            if isinstance(obj, np.integer):
                return int(obj)
            elif isinstance(obj, np.floating):
                return float(obj)
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            elif isinstance(obj, np.bool_):
                return bool(obj)
        except ImportError:
            pass
        
        # Convert other types to string representation
        try:
            return str(obj)
        except:
            return "Non-serializable object"

def create_hybrid_qa_team():
    """Create the hybrid QA team with proper termination"""
    client = OpenAIChatCompletionClient(
        model="gpt-4o-mini",  # Use a lighter model since hybrid agent does the heavy lifting
        api_key=settings.OPENAI_API_KEY
    )
    
    # Create the tool that the agent can use
    hybrid_qa_tool = FunctionTool(
        hybrid_qa_query,
        name="hybrid_qa_query",
        description="Use this tool to answer questions using the hybrid QA system that combines web search with domain knowledge."
    )
    
    # Create the hybrid QA assistant agent with the tool
    hybrid_qa_agent = HybridQAAssistantAgent(
        name="hybrid_qa_assistant",
        model_client=client,
        tools=[hybrid_qa_tool],
        system_message="""You are a hybrid QA assistant that answers questions about university admissions and study abroad.

IMPORTANT INSTRUCTIONS:
1. For every user question, call the 'hybrid_qa_query' tool with the user's question
2. Present the tool's response clearly to the user
3. Always end your response with 'TERMINATE' to complete the conversation

Example:
User: "What are Stanford MSCS requirements?"
You: [call hybrid_qa_query tool, then present the answer]

TERMINATE"""
    )
    
    # Allow agent to hand back to user
    hybrid_qa_agent.handoffs = ["user"]
    
    # Strong termination conditions - multiple ways to terminate
    termination = (
        HandoffTermination(target="user") | 
        TextMentionTermination("TERMINATE") |
        TextMentionTermination("terminate") |
        TextMentionTermination("COMPLETE")
    )
    
    # Create swarm team with immediate termination
    swarm_team = Swarm(
        participants=[hybrid_qa_agent],
        termination_condition=termination,
        max_turns=2  # Allow one turn for tool call, one for response
    )
    
    return swarm_team 