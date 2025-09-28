# src/agents/web_surfer_agent_simple.py
from autogen_ext.agents.web_surfer import MultimodalWebSurfer
from autogen_ext.models.openai import OpenAIChatCompletionClient
import os

from src.settings import settings

def create_simple_web_surfer():
    """
    Creates a simple MultimodalWebSurfer agent with basic configuration.
    """
    # Configuration for the model
    model_client = OpenAIChatCompletionClient(
        model="gpt-4o-2024-08-06", 
        api_key=settings.OPENAI_API_KEY
    )

    # Create the MultimodalWebSurfer with minimal configuration
    web_surfer = MultimodalWebSurfer(
        name="web_surfer",
        model_client=model_client,
        description="You are a helpful assistant that can search the web for information. When asked questions, search online and provide accurate, up-to-date answers with sources.",
        headless=False,  # Run browser with GUI for debugging
        start_page="https://www.google.com",  # Start with Google
        to_save_screenshots=False,  # Don't save screenshots to save space
        animate_actions=False,  # Don't animate actions for faster operation
        use_ocr=False,  # Don't use OCR for simplicity
    )
    
    return web_surfer

def create_basic_web_surfer():
    """
    Creates a specialized web surfer for iOffer AI study abroad assistant.
    """
    model_client = OpenAIChatCompletionClient(
        model="gpt-4o-2024-08-06", 
        api_key=settings.OPENAI_API_KEY
    )

    web_surfer = MultimodalWebSurfer(
        name="basic_web_surfer",
        model_client=model_client,
        description="""You are an intelligent study abroad assistant specialized in finding accurate, official information about universities and study abroad programs.

IMPORTANT SEARCH STRATEGY:
1. When users ask about specific universities, ALWAYS navigate to the OFFICIAL university website
2. Look for official admission pages, program pages, and department pages
3. AVOID relying only on search result summaries - click through to actual university pages
4. IGNORE advertisements and promotional content from competing universities
5. Focus on finding official, current information directly from the target institution

Your expertise includes:
- University admission requirements and application processes
- Academic program information (Bachelor's, Master's, PhD)
- Scholarship and financial aid opportunities  
- Visa and immigration requirements
- Student life and campus information
- Cost of living and tuition fees
- Language requirements (TOEFL, IELTS, etc.)
- Standardized test requirements (GRE, GMAT, etc.)

SEARCH BEHAVIOR:
- When asked about "Columbia University MSCS admission requirements", navigate to columbia.edu
- Look for the Computer Science department page
- Find the official MS program admission page
- Extract complete, official requirements
- Verify information is current and from official sources

Always prioritize official university websites, government education departments, and reputable educational resources. Navigate directly to official pages rather than relying on search result snippets. Provide accurate, up-to-date information with proper source attribution.

Help students make informed decisions by finding comprehensive and reliable official information.""",
        headless=False,
        start_page="https://www.google.com",
    )
    
    return web_surfer 