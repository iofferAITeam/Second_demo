import asyncio
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_ext.agents.web_surfer import MultimodalWebSurfer
from autogen_core.models import UserMessage
import re
import sys
import os
import pickle

# Add the src path for importing settings
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
from src.settings import settings
# from src.infrastructure.db.mysql import mysql_connector

def extract_answer_only(response):
    """
    Extracts only the answer text from a model response object.

    Parameters:
    - response: a dict or object with a `content` field containing the model's answer

    Returns:
    - str: the answer content
    """
    if isinstance(response, dict):
        return response.get("content", "").strip()
    
    # If it's an object (e.g., from a class with `.content` attribute)
    if hasattr(response, "content"):
        return getattr(response, "content", "").strip()
    
    raise ValueError("Response does not contain a 'content' field.")

async def search_answers_for_questions(questions):
    # client = OpenAIChatCompletionClient(
    #     model="gpt-4.1-nano",
    #     api_key=settings.OPENAI_API_KEY
    # )

    # Configuration for the Gemini Pro model
    client = OpenAIChatCompletionClient(
        model="gemini-1.5-pro", api_key=settings.GEMINI_API_KEY)
    
    # surfer = MultimodalWebSurfer(
    #     name="basic_web_surfer",
    #     model_client=client,
    #     description="You are a web surfer that can search and browse the internet. Provide helpful answers based on online information. Only give back one answer for all webs you browse. ",
    #     headless=True,
    #     start_page="https://www.google.com",
    # )

    qa_pairs = []
    prompt_base = (
        "You are a professional university application advisor with years of experience in help students apply to U.S. universities. "
        "You can browse the web, especially the official websites of universities, to find accurate and up-to-date information. "
        "Browse multiple websites to find the best and most accurate answer for the question. "
        "No need to include any markdown formatting. Just give the answer in plain text.\n\n"
        "If you cannot find the answer, just say 'I don't know'.\n\n"

    )
    
    for q in questions:
        try:
            prompt = prompt_base + f"Question: {q}"
            ans = await client.create([UserMessage(content=prompt, source="user")]) # Send the prompt to the model
            ans = extract_answer_only(ans)  # Extract the answer text from the response
            qa_pairs.append({"question": q, "answer": ans})
        except Exception as e:
            qa_pairs.append({"question": q, "answer": f"Error: {str(e)}"})

    return qa_pairs


def fetch_all_questions_from_db(table):
    query = f"SELECT id, question FROM {table} WHERE answer = '' OR answer IS NULL"
    rows = mysql_connector.execute_query(query)
    return rows  # list of dicts with 'id' and 'question'


def update_answers_in_db(qa_pairs, table):
    update_query = f"UPDATE {table} SET answer = %s WHERE id = %s"
    params = [(pair["answer"], pair["id"]) for pair in qa_pairs]
    mysql_connector.execute_many(update_query, params)
    print(f"[✔] Updated {len(params)} rows in the database.")


async def main():
    table = "test_agent_qa"
    # rows = fetch_all_questions_from_db(table)
    # if not rows:
    #     print("No unanswered questions found.")
    #     return

    # questions = [row["question"] for row in rows]
    # ids = [row["id"] for row in rows]
    with open("./common_questions.pkl", "rb") as f:
        questions = pickle.load(f)
    ids = [i for i in range(len(questions))]  # Example IDs for testing

    qa_pairs_raw = await search_answers_for_questions(questions)

    # Attach ids
    qa_pairs = []
    for i, pair in enumerate(qa_pairs_raw):
        qa_pairs.append({
            "id": ids[i],
            "question": pair["question"],
            "answer": pair["answer"]
        })
    with open("qa_pairs.pkl", "wb") as f:
        pickle.dump(qa_pairs, f)

    # update_answers_in_db(qa_pairs, table)


if __name__ == "__main__":
    asyncio.run(main())
