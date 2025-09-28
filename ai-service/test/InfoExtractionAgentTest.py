# test_info_extraction_agent.py

from autogen_agentchat.agents import UserProxyAgent
from agents.info_extraction_agent import create_info_extraction_agent
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_core.models import ModelInfo
from autogen_agentchat.ui import Console
import asyncio
from tools.InfoExtractionTool import InfoExtractionTool

import os

api_key = os.getenv("GOOGLE_API_KEY")


async def main():
    # Initialize Gemini client
    client = OpenAIChatCompletionClient(
        model="gemini-2.0-flash-lite",
        model_info=ModelInfo(vision=True, function_calling=True, json_output=True, family="unknown", structured_output=True),
        api_key=api_key
    )


    # Simulated user input
    user_input_text = """
    My name is Alice Zhang. I'm currently a senior at Tsinghua University majoring in Computer Science with a GPA of 3.9.
    I have taken courses like Data Structures (95), Machine Learning (97), and Operating Systems (93).
    I took the GRE and scored 328 overall, with 160 Verbal and 168 Quant. I am planning to apply to US graduate programs in Fall 2025.
    """

    user_input_text = "C:/Users/Jupit/Downloads/STUDENT ONE_merged_limit.pdf"

    # if os.path.isfile(user_input_text) and user_input_text.lower().endswith(('.pdf', '.jpg', '.jpeg', '.png')):
    #         print("📄 Detected file path. Extracting text...")
    #         extracted_text = InfoExtractionTool(user_input_text).run()
    #         user_input_text = extracted_text
    # else:
    #     user_input_text = user_input_text

    # Create the agent
    agent = create_info_extraction_agent(client)

    # Simulate a call from the user
    user_proxy = UserProxyAgent(name="User")

    print("▶️ Sending request to info_extraction_agent...\n")
    response = agent.run_stream(task=user_input_text)

    return await Console(response)


if __name__ == "__main__":
    asyncio.run(main())
