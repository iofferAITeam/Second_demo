import requests
from src.settings import settings
import pandas as pd
from autogen_core.tools import FunctionTool
from src.domain.sql_models import QSRanking
from src.infrastructure.db.sql import SQLDatabaseConnector
from src.utils.session_manager import get_current_profile, init_session
from src.domain.students_prediction import (
    StudentTagInfo,
    GPALevel,
    PaperLevel,
    LanguageLevel,
    GRELevel,
    ResearchLevel,
    CollegeLevel,
    RecommendationLevel,
    NetworkingLevel,
    InterestField,
)

from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from src.domain.qs_models import QSSubjectQuery
import sys
import json
import joblib
import numpy as np


def perplexity_search(prompt: list[dict[str, str]]):

    url = "https://api.perplexity.ai/chat/completions"

    payload = {
        "model": "sonar-pro",
        "messages": prompt,
        "web_search_options": {"search_context_size": "high"},
        "search_recency_filter": "month",
        "temperature": 0.0,
    }
    headers = {
        "Authorization": f"Bearer {settings.PERPLEXITY_API_KEY}",
        "Content-Type": "application/json",
    }

    response = requests.request("POST", url, json=payload, headers=headers)

    return response.json()["choices"][0]["message"]["content"]


def check_addmission_requirement(university: str, program: str):
    """
    Get the admission requirement for a program in a university
    """

    prompt = [
        {
            "role": "user",
            "content": f"What are the admission requirements for {program} at {university}?",
        }
    ]

    return perplexity_search(prompt)


def check_program_in_university(
    university: str, program: str, student_addmission_info: str, degree_type: str
):
    """
    Check if the program is offered in the university that the student can apply to
    """
    content = f"Is there a {program} {degree_type} program in {university} that student with the following profile can apply to?\n\n Only use official school websites as the source of information."

    prompt = [{"role": "user", "content": f"{content} {student_addmission_info}"}]

    return perplexity_search(prompt)


def get_qs_ranking(query: QSSubjectQuery):
    """
    Get the QS ranking for a program in a university
    """
    connector = SQLDatabaseConnector()
    Session = sessionmaker(bind=connector)
    session = Session()

    stmt = select(QSRanking).where(
        QSRanking.subject == query.subject,
        QSRanking.rank_2025_start <= query.rank,
        QSRanking.rank_2025_end >= query.rank,
    )
    result = session.execute(stmt)
    qs_ranking = result.scalars().all()
    return [q.institution for q in qs_ranking]


def get_user_application_details():
    """
    Get the user's program interest
    """
    profile = get_current_profile()
    if profile:
        return profile.applicationDetails
    return None


def get_user_work_experience():
    """
    Get the user's work experience
    """
    profile = get_current_profile()
    if profile:
        return profile.practicalExperience
    return None


def get_user_target_country():
    """
    Get the user's target country
    """

    profile = get_current_profile()
    if profile:
        return profile.applicationDetails.targetCountry
    return None


def get_complete_user_profile(force_refresh: bool = True):
    """
    Get the complete user profile as JSON/dictionary format

    Args:
        force_refresh: If True, force refresh from API instead of using cached data (default: True)
    """
    # Always force refresh by default to get latest data
    user_id = get_current_user_id()
    print(f"🔍 DEBUG: user_id = {user_id}")

    if user_id:
        from src.domain.students_pg import StudentDocument

        fresh_profile = StudentDocument.find_by_user_id(user_id)
        if fresh_profile:
            print(
                f"🔍 DEBUG: Fresh profile from API - languageTestsData: {len(fresh_profile.languageTestsData) if hasattr(fresh_profile, 'languageTestsData') else 'N/A'}"
            )
            print(
                f"🔍 DEBUG: Fresh profile from API - standardizedTestsData: {len(fresh_profile.standardizedTestsData) if hasattr(fresh_profile, 'standardizedTestsData') else 'N/A'}"
            )

            if (
                hasattr(fresh_profile, "languageTestsData")
                and fresh_profile.languageTestsData
            ):
                for i, test in enumerate(fresh_profile.languageTestsData):
                    print(f"🔍 DEBUG: Language Test {i}: {test}")

            if (
                hasattr(fresh_profile, "standardizedTestsData")
                and fresh_profile.standardizedTestsData
            ):
                for i, test in enumerate(fresh_profile.standardizedTestsData):
                    print(f"🔍 DEBUG: Standardized Test {i}: {test}")

            # Update the session cache with fresh data
            from src.utils.session_manager import current_session

            current_session["user_profile"] = fresh_profile
            print(f"🔍 DEBUG: Updated current_session with fresh profile")

            # Print what's now in current_session
            cached_profile = current_session.get("user_profile")
            if cached_profile:
                print(
                    f"🔍 DEBUG: Cached profile - languageTestsData: {len(cached_profile.languageTestsData) if hasattr(cached_profile, 'languageTestsData') else 'N/A'}"
                )
                print(
                    f"🔍 DEBUG: Cached profile - standardizedTestsData: {len(cached_profile.standardizedTestsData) if hasattr(cached_profile, 'standardizedTestsData') else 'N/A'}"
                )

            return fresh_profile.model_dump()
        else:
            print(f"🔍 DEBUG: No fresh profile found from API")

    # Fallback to cached profile if API fails
    profile = get_current_profile()
    if profile:
        print(
            f"🔍 DEBUG: Using cached profile - languageTestsData: {len(profile.languageTestsData) if hasattr(profile, 'languageTestsData') else 'N/A'}"
        )
        print(
            f"🔍 DEBUG: Using cached profile - standardizedTestsData: {len(profile.standardizedTestsData) if hasattr(profile, 'standardizedTestsData') else 'N/A'}"
        )
        return profile.model_dump()

    print(f"🔍 DEBUG: No profile found at all")
    return None


def get_user_basic_information():
    """
    Get the user's basic information (name, contact, nationality)
    """
    profile = get_current_profile()
    if profile:
        return profile.basicInformation.model_dump()
    return None


def get_user_education_background():
    """
    Get the user's education background
    """
    profile = get_current_profile()
    if profile:
        return profile.educationBackground.model_dump()
    return None


def get_user_language_proficiency():
    """
    Get the user's language proficiency scores
    """
    profile = get_current_profile()
    if profile:
        return [lang.model_dump() for lang in profile.languageProficiency]
    return []


def extract_test_scores_from_profile(profile):
    """
    Extract numerical test scores from user profile
    """
    scores = {
        "gpa": np.nan,
        "gre": np.nan,
        "gmat": np.nan,
        "ielts": np.nan,
        "toefl": np.nan,
    }

    # Extract GPA
    if hasattr(profile.educationBackground, "gpa") and hasattr(
        profile.educationBackground.gpa, "average"
    ):
        try:
            gpa_str = profile.educationBackground.gpa.average
            if gpa_str and gpa_str.strip():
                scores["gpa"] = float(gpa_str) / 4.0  # Normalize to 0-1 scale
        except (ValueError, AttributeError):
            pass

    # Extract standardized test scores
    if hasattr(profile, "standardizedTests") and profile.standardizedTests:
        for test in profile.standardizedTests:
            test_type = test.type.lower()
            if "gre" in test_type and hasattr(test.scores, "total"):
                try:
                    scores["gre"] = (
                        float(test.scores.total) if test.scores.total else np.nan
                    )
                except (ValueError, AttributeError):
                    pass
            elif "gmat" in test_type and hasattr(test.scores, "total"):
                try:
                    scores["gmat"] = (
                        float(test.scores.total) if test.scores.total else np.nan
                    )
                except (ValueError, AttributeError):
                    pass

    # Extract language proficiency scores
    if hasattr(profile, "languageProficiency") and profile.languageProficiency:
        for lang_test in profile.languageProficiency:
            test_type = lang_test.test.type.lower()
            if "ielts" in test_type and hasattr(lang_test.test.scores, "total"):
                try:
                    scores["ielts"] = (
                        float(lang_test.test.scores.total)
                        if lang_test.test.scores.total
                        else np.nan
                    )
                except (ValueError, AttributeError):
                    pass
            elif "toefl" in test_type and hasattr(lang_test.test.scores, "total"):
                try:
                    scores["toefl"] = (
                        float(lang_test.test.scores.total)
                        if lang_test.test.scores.total
                        else np.nan
                    )
                except (ValueError, AttributeError):
                    pass

    return scores


def get_prediction(student_info: StudentTagInfo):
    print("Getting prediction", flush=True)
    profile = get_current_profile()
    print("[pred] loading features csv", flush=True)
    features = pd.read_csv("src/ml_models/prediction_features.csv").columns.tolist()
    interest_field = student_info.interest_field.field_name

    # Pipeline will be loaded inside isolated worker to avoid native crashes

    print(f"[pred] loading QS csv for: {interest_field}", flush=True)
    qs_data = pd.read_csv(f"data/qs_data/{interest_field}.csv")
    print("[pred] qs csv loaded", flush=True)

    qs_data["Country / Territory"] = qs_data["Country / Territory"].str.replace(
        "United States of America", "United States"
    )

    # TODO: Need to make sure the country is in the qs_data need to be fixed
    if (
        profile.applicationDetails.targetCountry
        in qs_data["Country / Territory"].values
    ):
        qs_data = qs_data[
            qs_data["Country / Territory"] == profile.applicationDetails.targetCountry
        ]
    else:
        qs_data = qs_data[qs_data["Country / Territory"] == "United States"]

    univeristies = qs_data["Institution"]
    qs_data.rename(
        columns={
            "Country / Territory": "country",
            "2025": "ranking",
            "Academic": "academic",
            "AR rank": "ar_rank",
            "Employer": "employer",
            "ER Rank": "er_ank",
            "Citations": "citations",
            "CPP Rank": "cpp_rank",
            "H": "H",
            "H Rank": "H_rank",
            "International Research Network": "IRN",
            "IRN Rank": "IRN Rank",
            "Score": "Score",
        },
        inplace=True,
    )

    qs_data = pd.get_dummies(qs_data, columns=["country"])
    qs_data["country_nan"] = False

    qs_columns = [col for col in features if "qs_category_" in col]
    qs_data.loc[:, qs_columns] = False
    qs_data.loc[:, f"qs_category_{interest_field}"] = True

    country_columns = [col for col in features if "country_" in col]
    qs_data.loc[:, country_columns] = False

    # Get numerical values from StudentTagInfo
    print("[pred] computing tag values", flush=True)
    tag_values = student_info.get_prediction_values()

    # Extract actual test scores from profile
    print("[pred] extracting test scores from profile", flush=True)
    test_scores = extract_test_scores_from_profile(profile)
    print("11111", flush=True)
    # Combine tag values and actual scores
    data = {
        # Tag-based features (numerical values from text levels)
        "gpa_tag": tag_values.get("gpa_tag", np.nan),
        "paper_tag": tag_values.get("paper_tag", np.nan),
        "toefl_tag": tag_values.get("toefl_tag", np.nan),
        "gre_tag": tag_values.get("gre_tag", np.nan),
        "research_tag": tag_values.get("research_tag", np.nan),
        "college_type_tag": tag_values.get("college_type_tag", np.nan),
        "recommendation_tag": tag_values.get("recommendation_tag", np.nan),
        "networking_tag": tag_values.get("networking_tag", np.nan),
        # Actual test scores from profile
        "gpa": test_scores["gpa"],
        "gre": test_scores["gre"],
        "gmat": test_scores["gmat"],
        "ielts": test_scores["ielts"],
        "toefl": test_scores["toefl"],
    }
    print("22222", flush=True)
    score_features = [
        "gpa_tag",
        "paper_tag",
        "toefl_tag",
        "gre_tag",
        "research_tag",
        "college_type_tag",
        "recommendation_tag",
        "networking_tag",
        "gpa",
        "gre",
        "gmat",
        "ielts",
        "toefl",
    ]

    # This creates all columns at once
    print("[pred] assigning score features", flush=True)
    qs_data = qs_data.assign(**{col: data[col] for col in score_features})

    print("[pred] reindexing to feature columns", flush=True)
    qs_data = qs_data[features]

    numeric_columns = [
        "ranking",
        "academic",
        "ar_rank",
        "employer",
        "er_ank",
        "citations",
        "cpp_rank",
        "H",
        "H_rank",
        "IRN",
        "IRN Rank",
        "Score",
    ]
    qs_data.loc[:, "ranking"] = (
        qs_data["ranking"].astype(str).apply(lambda x: x.split("-")[0])
    )
    qs_data.loc[:, "Score"] = qs_data["Score"].astype(str).replace("-", np.nan)

    for col in numeric_columns:
        if col in qs_data.columns:
            qs_data[col] = (
                qs_data[col].astype(str).str.replace("+", "").str.replace("=", "")
            )
            qs_data[col] = qs_data[col].astype(float)

    # Offload predict to isolated subprocess to avoid native segfaults
    print("[pred] spawning predict worker", flush=True)
    import tempfile
    import subprocess
    from pathlib import Path

    with tempfile.TemporaryDirectory() as tmpdir:
        features_path = Path(tmpdir) / "features.csv"
        qs_data[features].to_csv(features_path, index=False)
        cmd = [
            sys.executable,
            str(
                Path(__file__).resolve().parents[1] / "ml_models" / "predict_worker.py"
            ),
            "--pipeline",
            str(Path("src/ml_models/xgboost_pipeline.joblib").resolve()),
            "--features-csv",
            str(features_path),
        ]
        try:
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        except Exception as e:
            raise RuntimeError(
                f"Predict subprocess failed to start: {type(e).__name__}: {e}"
            )
        if proc.returncode != 0:
            stderr = (proc.stderr or "").strip()
            raise RuntimeError(
                f"Predict subprocess exited with {proc.returncode}: {stderr}"
            )
        try:
            payload = json.loads(proc.stdout)
            probabilities = np.array(payload.get("probabilities", []), dtype=float)
        except Exception as e:
            raise RuntimeError(
                f"Failed to parse predict output: {type(e).__name__}: {e}"
            )

    print("[pred] filtering final universities", flush=True)
    final_univeristies = univeristies[probabilities > 0.95]
    x = 1
    while len(final_univeristies) < 20:
        final_univeristies = univeristies[probabilities > (0.95 - (x * 0.01))]
        x += 1

    return final_univeristies


def get_prediction_tool():
    return FunctionTool(
        get_prediction, description="Get the prediction for the user's profile"
    )


def get_user_work_experience_tool():
    return FunctionTool(
        get_user_work_experience, description="Get the user's work experience"
    )


def get_user_target_country_tool():
    return FunctionTool(
        get_user_target_country, description="Get the user's target country"
    )


def get_user_application_details_tool():
    return FunctionTool(
        get_user_application_details, description="Get the user's program interest"
    )


def get_complete_user_profile_tool():
    return FunctionTool(
        get_complete_user_profile,
        name="get_complete_user_profile",
        description="MANDATORY: Get the complete user profile as JSON format. Always fetches fresh data from API by default. You MUST call this tool as your first action.",
    )


def get_user_basic_information_tool():
    return FunctionTool(
        get_user_basic_information,
        description="Get the user's basic information (name, contact, nationality)",
    )


def get_user_education_background_tool():
    return FunctionTool(
        get_user_education_background,
        description="Get the user's education background and academic history",
    )


def get_user_language_proficiency_tool():
    return FunctionTool(
        get_user_language_proficiency,
        description="Get the user's language proficiency test scores",
    )


def get_preplexity_tool():
    return FunctionTool(
        check_addmission_requirement,
        description="Get the admission requirement for a program in a university",
    )


def get_qs_ranking_tool():
    return FunctionTool(
        get_qs_ranking, description="Get the QS ranking for a program in a university"
    )


def demonstrate_text_to_numerical_conversion():
    """
    Demonstrate how text levels are converted to numerical values
    """
    print("=== Text to Numerical Conversion Demo ===")

    # Show available options for each category
    print("\n1. GPA Level Options:")
    gpa_options = GPALevel.get_options()
    for key, option in gpa_options.items():
        print(f"   '{key}' ('{option.level}') → {option.prediction_value}")

    print("\n2. Paper Level Options:")
    paper_options = PaperLevel.get_options()
    for key, option in paper_options.items():
        print(f"   '{key}' ('{option.level}') → {option.prediction_value}")

    print("\n3. College Level Options:")
    college_options = CollegeLevel.get_options()
    for key, option in college_options.items():
        print(f"   '{key}' ('{option.level}') → {option.prediction_value}")

    # Create a sample student and show conversion
    print("\n4. Sample Student Conversion:")
    sample_student = create_sample_student_tag_info()
    tag_values = sample_student.get_prediction_values()

    print("   Text Levels → Numerical Values:")
    print(f"   GPA: '{sample_student.gpa_level.level}' → {tag_values['gpa_tag']}")
    print(
        f"   Papers: '{sample_student.paper_level.level}' → {tag_values['paper_tag']}"
    )
    print(
        f"   Research: '{sample_student.research_level.level}' → {tag_values['research_tag']}"
    )
    print(
        f"   College: '{sample_student.college_level.level}' → {tag_values['college_type_tag']}"
    )
    print(
        f"   Interest Field: '{sample_student.interest_field.field_name}' → '{tag_values['interest_field']}'"
    )

    return tag_values


def create_sample_student_tag_info() -> StudentTagInfo:
    """
    Create a sample StudentTagInfo object using the provided JSON data
    """
    # Create individual level objects
    gpa_level = GPALevel(level="high", description="high GPA", prediction_value=0.9)

    research_level = ResearchLevel(
        level="rich", description="rich research experience", prediction_value=0.7
    )

    college_level = CollegeLevel(
        level="overseas", description="overseas college", prediction_value=0.8
    )

    interest_field = InterestField(
        field_name="Data Science",
        description="Data Science field of interest",
        prediction_value="Data Science",
    )

    networking_level = NetworkingLevel(
        level="high_quality",
        description="high quality networking",
        prediction_value=0.85,
    )

    language_level = LanguageLevel(
        level="high", description="high language proficiency", prediction_value=0.9
    )

    paper_level = PaperLevel(
        level="none", description="no research papers", prediction_value=0.1
    )

    recommendation_level = RecommendationLevel(
        level="overseas_top",
        description="overseas top recommendation",
        prediction_value=0.9,
    )

    # Create the StudentTagInfo object
    student_tag_info = StudentTagInfo(
        gpa_level=gpa_level,
        paper_level=paper_level,
        language_level=language_level,
        gre_level=None,  # null in the JSON
        research_level=research_level,
        college_level=college_level,
        recommendation_level=recommendation_level,
        networking_level=networking_level,
        interest_field=interest_field,
    )

    return student_tag_info


def get_program_in_university_tool():
    return FunctionTool(
        check_program_in_university,
        description="Check if the program is offered in the university that the student can apply to",
    )


if __name__ == "__main__":
    # Demonstrate text to numerical conversion
    profile = init_session("hanyu_liu_003")
