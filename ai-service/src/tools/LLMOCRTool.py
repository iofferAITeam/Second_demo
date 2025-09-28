import io
import base64
import json
from datetime import datetime
from PIL import Image
from pdf2image import convert_from_bytes
from dotenv import load_dotenv
from google import genai
from google.genai import types
from src.settings import settings
from src.prompts.extraction import STUDENT_INIT_INFO_JSON_TEMPLATE

class OCRLLMTool:
    def __init__(self):
        self.name = "OCRLLMTool"
        self.description = "Uses Gemini multimodal model to extract structured text from images or PDFs."
        self.client = genai.Client( api_key=settings.GEMINI_API_KEY)

    def __call__(self, file_bytes: io.BytesIO, filetype: str = "image") -> str:
        return self.run(file_bytes, filetype)

    def run(self, file_bytes: io.BytesIO, filetype: str = "image") -> str:
        if filetype == "pdf":
            return  self.extract_text_from_pdf(file_bytes)
        else:
            return  self.extract_text_from_image(file_bytes)
        


    def extract_text_from_image(self, image_bytes: io.BytesIO) -> str:
        image_bytes.seek(0)
        raw_data = image_bytes.read()

        # Save file (optional, for debugging)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        with open(f"extracted_image_{timestamp}.jpg", "wb") as f:
            f.write(raw_data)

        image_parts = {
            "mime_type": "image/jpeg",
            "data": raw_data
        }

        prompt = (
            "Extract the text from the image with the below template",
            STUDENT_INIT_INFO_JSON_TEMPLATE
        )

        response = self.client.models.generate_content(model="gemini-2.5-pro",
                                                       contents=[types.Part.from_text(prompt),
                                                        types.Part.from_bytes(mime_type="image/jpeg", 
                                                                              data=raw_data)])
        return response.text.strip()

    def extract_text_from_pdf(self, pdf_stream: io.BytesIO) -> str:
        pdf_stream.seek(0)
        pdf_data = pdf_stream.read()


        prompt = (
            "Extract the text from the image with the below template",
            STUDENT_INIT_INFO_JSON_TEMPLATE
        )

        response = self.client.models.generate_content(model="gemini-2.5-pro",
                                                        contents=[prompt,
                                                                    types.Part.from_bytes(mime_type="application/pdf", data=pdf_data)])
        return response.text.strip()



if __name__ == "__main__":
    tool = OCRLLMTool()
    print(tool.extract_json_student_info(["my gpa is 3.4", "my name is hanyu"]))
