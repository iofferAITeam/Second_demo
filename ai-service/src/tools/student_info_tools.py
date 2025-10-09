from src.domain.students_pg import (
    StudentBasicInfoModel,
    BasicInformation,
    ApplicationDetails,
    EducationBackground,
    CareerDevelopment,
    PracticalExperienceItem,
    FinancialAid,
    Recommendation,
    PersonalStatements,
    StudyAbroadPreparation,
    PersonalityProfile,
    AdditionalInformation,
    LanguageProficiencyItem,
    StandardizedTest,
)
from src.utils.session_manager import get_current_profile
from pydantic import BaseModel
import json
from google import genai

from autogen_core.tools import FunctionTool
from src.tools.InfoExtractionTool import InfoExtractionTool


def update_student_information(update_data: StudentBasicInfoModel):
    """
    Merge/update fields on the current session profile and persist to MongoDB.
    Accepts either a JSON string or dict. If payload contains a top-level
    key "studentInfo" (from the extractor schema), it will be flattened
    into the StudentDocument structure.
    Rule: If an incoming value is an empty string, keep the original value.
    Returns the updated profile as a JSON-serializable dict.
    """
    # 1) Load current session profile
    profile = get_current_profile()
    if profile is None:
        raise ValueError("No active session profile found. Initialize session first.")

    # 2) Normalize incoming payload to dict
    payload = update_data
    if isinstance(update_data, str):
        try:
            payload = json.loads(update_data)
        except json.JSONDecodeError:
            raise ValueError("update_data must be a valid JSON string or dict")

    # If a StudentDocument-like object was passed, convert to dict
    if hasattr(payload, "model_dump") and callable(getattr(payload, "model_dump")):
        payload = payload.model_dump()

    if not isinstance(payload, dict):
        raise ValueError("update_data must be a dict or JSON string")

    # 3) Handle extractor format that nests under 'studentInfo'
    if "studentInfo" in payload and isinstance(payload["studentInfo"], dict):
        payload = payload["studentInfo"]

    # 4) Map known top-level fields to their Pydantic models
    single_model_fields = {
        "basicInformation": BasicInformation,
        "applicationDetails": ApplicationDetails,
        "educationBackground": EducationBackground,
        "careerDevelopment": CareerDevelopment,
        "financialAid": FinancialAid,
        "personalStatements": PersonalStatements,
        "studyAbroadPreparation": StudyAbroadPreparation,
        "personalityProfile": PersonalityProfile,
        "additionalInformation": AdditionalInformation,
    }
    list_model_fields = {
        "languageProficiency": LanguageProficiencyItem,
        "standardizedTests": StandardizedTest,
        "practicalExperience": PracticalExperienceItem,
        "recommendations": Recommendation,
    }

    def as_model(model_cls, value):
        if isinstance(value, model_cls):
            return value
        if isinstance(value, dict):
            return model_cls(**value)
        return value

    def as_model_list(model_cls, values):
        if not isinstance(values, list):
            return values
        return [as_model(model_cls, v) for v in values]

    def is_empty_string(val) -> bool:
        return isinstance(val, str) and val == ""

    def merge_into_model(model_obj: BaseModel, updates: dict):
        for sub_key, sub_val in updates.items():
            if not hasattr(model_obj, sub_key):
                continue
            if is_empty_string(sub_val):
                # Skip empty strings to preserve existing values
                continue
            current_val = getattr(model_obj, sub_key)
            # Recurse for nested models
            if isinstance(current_val, BaseModel) and isinstance(sub_val, dict):
                merge_into_model(current_val, sub_val)
            # Lists: only set if non-empty list provided
            elif isinstance(current_val, list) and isinstance(sub_val, list):
                if not sub_val:
                    continue
                setattr(model_obj, sub_key, sub_val)
            else:
                setattr(model_obj, sub_key, sub_val)

    # 5) Apply updates to the in-memory profile (mutate in place)
    for field_name, field_value in payload.items():
        # Skip empty-string direct assignments
        if is_empty_string(field_value):
            continue

        if field_name in single_model_fields and field_value is not None:
            # Merge into existing nested model; do not overwrite with empty strings
            nested_model = getattr(profile, field_name)
            if isinstance(field_value, dict) and isinstance(nested_model, BaseModel):
                merge_into_model(nested_model, field_value)
            else:
                setattr(
                    profile,
                    field_name,
                    as_model(single_model_fields[field_name], field_value),
                )
        elif field_name in list_model_fields and field_value is not None:
            # Only set lists if non-empty; convert dict items to proper models
            if isinstance(field_value, list) and not field_value:
                continue
            setattr(
                profile,
                field_name,
                as_model_list(list_model_fields[field_name], field_value),
            )
        elif field_name == "additionalEducationBackground":
            if isinstance(field_value, list) and not field_value:
                continue
            setattr(
                profile,
                field_name,
                field_value if isinstance(field_value, list) else [],
            )
        elif field_name not in {"scoreInformation", "programInterest", "user_id"}:
            # For any other direct fields that exist on the model
            if hasattr(profile, field_name) and not is_empty_string(field_value):
                setattr(profile, field_name, field_value)

    # 6) Persist the updated profile to MongoDB using model method
    profile.update_and_save()

    # 7) Return updated profile
    return "Successfully updated the student information"


def extract_info_from_source(source: str) -> dict:
    extracted_info = InfoExtractionTool(source).run()
    return extracted_info


def get_update_student_information_tool():
    return FunctionTool(
        name="update_student_information",
        func=update_student_information,
        description="Updates the student information in the database.",
    )


def get_extract_student_information_tool():
    return FunctionTool(
        name="extract_student_information",
        func=extract_info_from_source,
        description="Extracts student information from a text or file and returns a JSON object with the extracted information.",
    )
