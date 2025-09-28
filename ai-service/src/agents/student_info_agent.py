from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_core.tools import FunctionTool

from shared_memory import shared_memory
from src.settings import settings
from tools.ingestion_functions import (
    extract_student_scores,
    extract_program_interest,
    extract_student_info,
    identify_missing_fields,
    mongo
)


def handle_extraction(view_name, text, extractor_fn):
    user_id = shared_memory["user_id"]
    new_data = extractor_fn(text)
    existing = shared_memory[view_name] or {}
    updated = merge_json(existing, new_data)
    shared_memory[view_name] = updated
    mongo.run("update", view_name, query={"user_id": user_id}, data={"user_id": user_id, "data": updated})

    # Detect missing fields and store for follow-up
    missing = identify_missing_fields(updated)
    shared_memory["missing_questions"] = [f"Please provide your {field}." for field in missing]
    return updated

def score_agent_fn(client):
    client = OpenAIChatCompletionClient(
        model="gpt-4o",
        api_key=settings.OPENAI_API_KEY
    )
    return AssistantAgent(
        name="ScoreExtractionAgent",
        model_client=client,
        tools=[FunctionTool(
            name="extract_student_scores",
            func=extract_score_wrapped,
            description="Extracts student scores from a text or file and merges into the current score view. "
        )],
        description="Handles score extraction and merging.",
        system_message=
            "You extract student scores from the input text or file. You merge the extracted scores into the current student_scores view in shared memory. You should always return the updated student_scores view as a JSON string."
    )

def extract_score_wrapped(input_text: str) -> str:
   return handle_extraction("student_scores", input_text, extract_student_scores)