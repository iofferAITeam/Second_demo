from pymongo import MongoClient
from bson import json_util
import json
import os
from dotenv import load_dotenv
from src.tools.extraction import STUDENT_INFO_TEMPLATE_JSON
from src.settings import settings

load_dotenv(dotenv_path="c:/Users/Jupit/OneDrive/Desktop/Extration_Agent/.venv/config.env")

class MongoDBTool:
    def __init__(self, user_id: str = None):
        self.client = MongoClient(settings.DATABASE_HOST)
        self.db = self.client[settings.DATABASE_NAME]
        self.collection_name = "Student_Info"  # You can make this dynamic if needed
        self.user_id = user_id

    def run(self, action: str, collection: str, data: dict = None, query: dict = None) -> dict:
        if action == "insert":
            return self.insert_data(collection, data)
        elif action == "find_one":
            return self.find_one_data(collection, query)
        elif action == "find_many":
            return self.find_many_data(collection, query)
        elif action == "update":
            return self.update_data(collection, query, data)
        else:
            raise ValueError("Invalid action. Use 'insert', 'find_one', 'find_many', or 'update'.")

    def insert_data(self, collection: str, data: dict) -> dict:
        result = self.db[collection].insert_one(data)
        return {"inserted_id": str(result.inserted_id)}

    def find_one_data(self, collection: str, query: dict) -> dict:
        result = self.db[collection].find_one(query)
        return {"data": json.loads(json_util.dumps(result))} if result else {"data": None}

    def find_many_data(self, collection: str, query: dict = {}) -> dict:
        results = self.db[collection].find(query)
        return {"data": [json.loads(json_util.dumps(doc)) for doc in results]}

    def update_data(self, collection: str, query: dict, data: dict) -> dict:
        result = self.db[collection].update_one(query, {"$set": data}, upsert=True)
        return {"matched_count": result.matched_count, "modified_count": result.modified_count}

    def get_or_create_user(self) -> dict:
        result = self.find_one_data(self.collection_name, {"user_id": self.user_id})
        if result["data"]:
            return result["data"]
        else:
            default_data = json.loads(STUDENT_INFO_TEMPLATE_JSON)
            default_data["user_id"] = self.user_id
            self.insert_data(self.collection_name, default_data)
            return default_data

    def merge_json(self, original, update):
        """
        Recursively merges `update` into `original`.
        Existing non-null values in `original` are preserved unless `update` provides new ones.
        """
        if "_id" in original:
            original = {k: v for k, v in original.items() if k != "_id"}
        if isinstance(original, dict) and isinstance(update, dict):
            for key, value in update.items():
                if key == "_id":
                    continue  # Don't attempt to update immutable _id field
                if key in original:
                    if isinstance(value, dict):
                        self.merge_json(original[key], value)
                    elif value not in (None, "", [], {}):
                        original[key] = value
                else:
                    original[key] = value
        return original

    def update_user_info(self, update_data: dict) -> dict:
        original_data = self.get_or_create_user()
        if not original_data:
            return {"error": "User not found and no default data provided."}
        updated_data = self.merge_json(original_data, update_data)
        safe_data = {k: v for k, v in updated_data.items() if k != "_id"}
        
        #self.update_data(self.collection_name, {"user_id": self.user_id}, updated_data)
        self.update_data(self.collection_name, {"user_id": self.user_id}, safe_data)

        return updated_data

    # def ask_user_for_missing(self, updated_data: dict) -> str:
    #     #user_data = self.get_or_create_user()
    #     user_data = updated_data
    #     missing_fields = [field for field in user_data if not user_data[field]]
    #     if not missing_fields:
    #         return "✅ All required information has been collected."

    #     questions = [f"What is your {field}?" for field in missing_fields]
    #     return "I still need the following details from you:\n" + "\n".join(questions)

    def ask_user_for_missing(self, updated_data: dict) -> str:
        def find_missing(d, path=""):
            missing = []
            if isinstance(d, dict):
                for k, v in d.items():
                    new_path = f"{path}.{k}" if path else k
                    missing += find_missing(v, new_path)
            elif isinstance(d, list):
                if not d:
                    missing.append(path)
                else:
                    for i, item in enumerate(d):
                        missing += find_missing(item, f"{path}[{i}]")
            elif d in ("", None):
                missing.append(path)
            return missing

        missing_fields = find_missing(updated_data)
        
        if not missing_fields:
            return "✅ All required information has been collected."

        questions = [f"What is your '{field}'?" for field in missing_fields]
        return "I still need the following details from you:\n" + "\n".join(questions)

        
