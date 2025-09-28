#all of the templates should be stored in the mongoDB database and retrieved at the start of the program and as needed
#so the returned JSONs should be the a set of jsons that are stored in the database

import json
import io
import openai
import os
from google import genai
from src.tools.MongoDBTool import MongoDBTool
from src.tools.LLMOCRTool import OCRLLMTool
from src.tools.extraction import STUDENT_INFO_TEMPLATE_JSON, COMBINED_EXTRACTION_PROMPT, STUDENT_INFO_SCHEMA, text_prompt
from openai import OpenAI
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_core.models import ModelInfo
from src.prompts.extraction import STUDENT_INIT_INFO_JSON_TEMPLATE, get_student_info_extract_prompt
from src.settings import settings

ocr = OCRLLMTool()

class InfoExtractionTool:
    def __init__(self, source):
        self.source = source
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY)

    def run(self): #excecute automatically when call this tool
        results = self.extract_text_from_source(self.source)
        # result_dict = self.extract_student_info(results)
        return results  # ✅ convert to JSON string

    def extract_student_info(self, result: str):
        """
        Extract student information from a list of OCR results using Gemini structured output.
        Each item in `result` is expected to contain keys: 'status' and 'extracted_text'.
        Returns a Python dict parsed from the model's JSON output.
        """

        prompt = None 
        student_info = None

        prompt = get_student_info_extract_prompt(STUDENT_INIT_INFO_JSON_TEMPLATE, result)

        response = self.client.models.generate_content(
            model="gemini-2.5-fast",
            contents=[
                {"role": "user", "parts": [{"text": prompt}]},
            ]
        )

        student_info = response.text
        
        return student_info


    def extract_text_from_source(self, source):
        """
        Extracts structured data from a file path (PDF/image) or user input string.
        - If `source` is a valid file path to PDF/image, OCR will be used first.
        - Otherwise, it is treated as plain text (user chat input).
        Returns extracted views as JSON.
        """
        if isinstance(source, str):
            source = source.strip()
        
        if os.path.isfile(source) and source.lower().endswith(('.pdf', '.jpg', '.jpeg', '.png')):
            text = self.extract_from_file(source)
        else:
            text = source  # Treat as direct user input
        return text

    def extract_from_file(self, file_path):
        filetype = "pdf" if file_path.lower().endswith(".pdf") else "image"
        with open(file_path, "rb") as f:
            file_bytes = io.BytesIO(f.read())
            return ocr(file_bytes, filetype=filetype)

    def _safe_json_parse(self, text):
        """
        Attempts to convert LLM output to valid JSON.
        Handles common formatting issues like single quotes or trailing commas.
        """
        # Attempt correction
        corrected = text.replace("'", '"').replace(",}", "}").replace(",]", "]")
        try:
            return json.loads(corrected)
        except Exception as e:
            print("⚠️ Could not parse corrected JSON either. Returning empty dict.")
            return {}
        

if __name__ == "__main__":
    tool = InfoExtractionTool("I have a minor in computer science")
    print(tool.run())