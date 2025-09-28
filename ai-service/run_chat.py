# run_chat.py
import asyncio
from dotenv import load_dotenv
import os
from shared_memory import shared_memory
from tools.ingestion_functions import load_user_json_views, extract_data_from_source
from agents.user_proxy import create_user_proxy
from agents.create_selector_team import create_selector_team, create_roundrobin_groupchat, create_swarm_team
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_agentchat.messages import HandoffMessage  
from autogen_core import CancellationToken
from datetime import datetime


timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
token_log_path = f"token_summary_{timestamp}.txt"


def init_env():
    load_dotenv()
    #load_dotenv(dotenv_path="c:/Users/Jupit/OneDrive/Desktop/Extration_Agent/.venv/config.env")

def log_token_usage(agent_name, page_number, prompt_tokens, completion_tokens):
    with open(token_log_path, "a", encoding="utf-8") as f:
        f.write(
            f"Page {page_number}, Agent {agent_name} → "
            f"Prompt: {prompt_tokens}, Completion: {completion_tokens}, Total: {prompt_tokens + completion_tokens}\n"
        )

def summarize_token_usage():
    total_prompt = 0
    total_completion = 0

    with open(token_log_path, "r", encoding="utf-8") as f:
        for line in f:
            if "Prompt:" in line and "Completion:" in line:
                parts = line.split("→")[1].split(",")
                total_prompt += int(parts[0].split(":")[1])
                total_completion += int(parts[1].split(":")[1])

    with open(token_log_path, "a", encoding="utf-8") as f:
        f.write("\n=== TOTAL ===\n")
        f.write(f"Total Prompt: {total_prompt}\n")
        f.write(f"Total Completion: {total_completion}\n")
        f.write(f"Total Combined: {total_prompt + total_completion}\n")



async def main():
    user_id = input("Enter your user ID: ").strip()
    load_user_json_views(user_id)
    shared_memory["user_id"] = user_id
    for view in shared_memory:
        print(f"Initial {view} data: {shared_memory[view]}")

    client = OpenAIChatCompletionClient(
        model="gpt-4o",
        api_key=os.getenv("OPENAI_API_KEY"),
    )

    team, user_proxy, agents = create_swarm_team(client)

    print("\n📋 Welcome to the Student Profile Ingestion System (Swarm version).")
    print("💬 Type your message or upload a file. End the session with a message containing 'TERMINATE'.")

    while True:
        user_input = input("Enter your response: ").strip()
        if "TERMINATE" in user_input.upper():
            break

        # Use OCR if it's a valid file path
        if os.path.isfile(user_input) and user_input.lower().endswith(('.pdf', '.jpg', '.jpeg', '.png')):
            print("📄 Detected file path. Extracting text...")
            extracted_text = extract_data_from_source(user_input)
            processed_input = extracted_text
        else:
            processed_input = [user_input]

        shared_memory["last_user_message"] = user_input
        shared_memory["active_view"] = None
        print(f"🔹 Processed input for agents: {processed_input}")
        page_num = 0

        for input_part in processed_input:
            page_num += 1
            for agent in agents:
                agent.on_reset(CancellationToken())
            shared_memory["last_user_message"] = input_part
            shared_memory["active_view"] = None
            for agent_name in ["ScoreExtractionAgent", "InterestExtractionAgent", "StudentInfoExtractionAgent", "MissingInfoAgent"]:
                handoff = HandoffMessage(source="user", target=agent_name, content=input_part)
                await Console(team.run_stream(task=handoff), output_stats =True)
                 



if __name__ == "__main__":
    asyncio.run(main())

##remain: 1. info update logic
##remain: 2. missing info logic
##remain: 3. extraction content for each agent
