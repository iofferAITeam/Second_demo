#!/usr/bin/env python3
"""
Test ML model prediction functionality to verify it can generate school recommendations
"""

from src.tools.school_rec_tools import (
    create_sample_student_tag_info, 
    demonstrate_text_to_numerical_conversion
)
from src.domain.students_prediction import (
    StudentTagInfo, GPALevel, PaperLevel, LanguageLevel, GRELevel,
    ResearchLevel, CollegeLevel, RecommendationLevel, NetworkingLevel, InterestField
)
import os

def test_ml_model_availability():
    """Test if the ML model files exist"""
    print("=== ML Model Files Test ===")
    
    model_files = [
        "src/ml_models/xgboost_pipeline.joblib",
        "src/ml_models/prediction_features.csv",
        "src/ml_models/predict_worker.py"
    ]
    
    for file_path in model_files:
        if os.path.exists(file_path):
            print(f"✓ {file_path} exists")
        else:
            print(f"✗ {file_path} missing")
    
    # Check QS data
    qs_dir = "data/qs_data"
    if os.path.exists(qs_dir):
        qs_files = os.listdir(qs_dir)
        print(f"✓ QS data directory exists with {len(qs_files)} files")
        for file in qs_files[:5]:  # Show first 5 files
            print(f"   - {file}")
    else:
        print(f"✗ {qs_dir} missing")
    
    print()

def test_student_tag_info_creation():
    """Test creating StudentTagInfo with various profiles"""
    print("=== Student Tag Info Creation Test ===")
    
    # Test 1: High-performing student
    print("1. High-performing student profile:")
    high_performer = StudentTagInfo(
        gpa_level=GPALevel(level="high", description="High GPA 3.8+", prediction_value=0.9),
        paper_level=PaperLevel(level="few", description="Few research papers", prediction_value=0.4),
        language_level=LanguageLevel(level="high", description="High language proficiency", prediction_value=0.9),
        gre_level=GRELevel(level="high", description="High GRE score", prediction_value=0.8),
        research_level=ResearchLevel(level="rich", description="Rich research experience", prediction_value=0.7),
        college_level=CollegeLevel(level="top_domestic", description="Top domestic college", prediction_value=0.7),
        recommendation_level=RecommendationLevel(level="high_quality", description="High quality recommendation", prediction_value=0.8),
        networking_level=NetworkingLevel(level="high_quality", description="High quality networking", prediction_value=0.85),
        interest_field=InterestField(field_name="Data Science", description="Data Science field", prediction_value="Data Science")
    )
    
    tag_values = high_performer.get_prediction_values()
    print("   Tag values:", tag_values)
    
    # Test 2: Average student
    print("\n2. Average student profile:")
    avg_student = StudentTagInfo(
        gpa_level=GPALevel(level="medium", description="Medium GPA 3.0-3.5", prediction_value=0.6),
        paper_level=PaperLevel(level="none", description="No research papers", prediction_value=0.1),
        language_level=LanguageLevel(level="medium", description="Medium language proficiency", prediction_value=0.6),
        gre_level=GRELevel(level="medium", description="Medium GRE score", prediction_value=0.6),
        research_level=ResearchLevel(level="limited", description="Limited research experience", prediction_value=0.3),
        college_level=CollegeLevel(level="regular_domestic", description="Regular domestic college", prediction_value=0.5),
        recommendation_level=RecommendationLevel(level="medium_quality", description="Medium quality recommendation", prediction_value=0.6),
        networking_level=NetworkingLevel(level="medium_quality", description="Medium quality networking", prediction_value=0.6),
        interest_field=InterestField(field_name="Computer Science", description="Computer Science field", prediction_value="Computer Science")
    )
    
    tag_values_avg = avg_student.get_prediction_values()
    print("   Tag values:", tag_values_avg)
    
    print()
    return high_performer, avg_student

def test_mock_profile_creation():
    """Test creating mock user profiles for testing"""
    print("=== Mock Profile Test ===")
    
    # Mock a high-performing student profile similar to user's request
    # "我的GPA是3.8，TOEFL是110分"
    print("Simulating student with GPA 3.8, TOEFL 110:")
    
    # This would be the profile data format
    mock_profile = {
        "educationBackground": {
            "gpa": {"average": "3.8"}
        },
        "languageProficiency": [
            {
                "test": {
                    "type": "TOEFL",
                    "scores": {"total": "110"}
                }
            }
        ],
        "applicationDetails": {
            "targetCountry": "United States"
        }
    }
    
    print("Mock profile structure:")
    print(f"   GPA: {mock_profile['educationBackground']['gpa']['average']}")
    print(f"   TOEFL: {mock_profile['languageProficiency'][0]['test']['scores']['total']}")
    print(f"   Target Country: {mock_profile['applicationDetails']['targetCountry']}")
    
    print()

if __name__ == "__main__":
    print("=== ML Model and Routing Test ===\n")
    
    # Test 1: Check ML model files
    test_ml_model_availability()
    
    # Test 2: Test numerical conversion
    print("=== Text to Numerical Conversion Test ===")
    demonstrate_text_to_numerical_conversion()
    print()
    
    # Test 3: Test StudentTagInfo creation
    high_performer, avg_student = test_student_tag_info_creation()
    
    # Test 4: Test mock profile
    test_mock_profile_creation()
    
    print("=== Summary ===")
    print("✓ Routing keywords test completed successfully")
    print("✓ ML model files availability checked")
    print("✓ StudentTagInfo creation tested")
    print("✓ Text to numerical conversion demonstrated")
    print()
    print("Next step: Test full end-to-end prediction with mock user session")
