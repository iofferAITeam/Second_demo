from typing import Literal, Optional
from pydantic import BaseModel

class GPALevel(BaseModel):
    """GPA performance level with description and prediction value"""
    level: Literal["low", "medium", "high"]
    description: str
    prediction_value: float
    
    @classmethod
    def get_options(cls):
        return {
            "low": cls(level="low", description="低GPA - Low GPA performance", prediction_value=1.0),
            "medium": cls(level="medium", description="中等GPA - Medium GPA performance", prediction_value=2.0), 
            "high": cls(level="high", description="高GPA - High GPA performance", prediction_value=3.0)
        }

class PaperLevel(BaseModel):
    """Research paper quality level with description and prediction value"""
    level: Literal["none", "weak", "many", "top"]
    description: str
    prediction_value: float
    
    @classmethod
    def get_options(cls):
        return {
            "none": cls(level="none", description="无paper - No research papers", prediction_value=1.0),
            "weak": cls(level="weak", description="水paper - Low quality papers", prediction_value=2.0),
            "many": cls(level="many", description="多paper - Multiple papers", prediction_value=3.0),
            "top": cls(level="top", description="牛paper - Top quality papers", prediction_value=4.0)
        }

class LanguageLevel(BaseModel):
    """Language proficiency level (TOEFL/IELTS) with description and prediction value"""
    level: Literal["low", "medium", "high"]
    description: str
    prediction_value: float
    
    @classmethod
    def get_options(cls):
        return {
            "low": cls(level="low", description="低语言成绩 - Low language scores", prediction_value=1.0),
            "medium": cls(level="medium", description="中等语言成绩 - Medium language scores", prediction_value=2.0),
            "high": cls(level="high", description="高语言成绩 - High language scores", prediction_value=3.0)
        }

class GRELevel(BaseModel):
    """GRE score level with description and prediction value"""
    level: Literal["low", "medium", "high"]
    description: str
    prediction_value: float
    
    @classmethod
    def get_options(cls):
        return {
            "low": cls(level="low", description="L GRE score - Low GRE scores", prediction_value=1.0),
            "medium": cls(level="medium", description="M GRE score - Medium GRE scores", prediction_value=2.0),
            "high": cls(level="high", description="H GRE score - High GRE scores", prediction_value=3.0)
        }

class ResearchLevel(BaseModel):
    """Research experience level with description and prediction value"""
    level: Literal["none", "rich"]
    description: str
    prediction_value: float
    
    @classmethod
    def get_options(cls):
        return {
            "none": cls(level="none", description="无科研经历 - No research experience", prediction_value=0.0),
            "rich": cls(level="rich", description="丰富科研经历 - Rich research experience", prediction_value=1.0)
        }

class CollegeLevel(BaseModel):
    """College type classification with description and prediction value"""
    level: Literal["non_top", "domestic_top", "overseas"]
    description: str
    prediction_value: float
    
    @classmethod
    def get_options(cls):
        return {
            "non_top": cls(level="non_top", description="双非申请（非211非985）- Non-top domestic university", prediction_value=0.0),
            "domestic_top": cls(level="domestic_top", description="211/985院校 - Top domestic university", prediction_value=1.0),
            "overseas": cls(level="overseas", description="海外本科 - Overseas undergraduate", prediction_value=2.0)
        }

class RecommendationLevel(BaseModel):
    """Recommendation letter quality with description and prediction value"""
    level: Literal["none", "domestic_top", "overseas_top"]
    description: str
    prediction_value: float
    
    @classmethod
    def get_options(cls):
        return {
            "none": cls(level="none", description="无牛推 - No strong recommendations", prediction_value=0.0),
            "domestic_top": cls(level="domestic_top", description="国内牛推 - Strong domestic recommendations", prediction_value=1.0),
            "overseas_top": cls(level="overseas_top", description="国外牛推 - Strong overseas recommendations", prediction_value=2.0)
        }

class NetworkingLevel(BaseModel):
    """Networking/outreach quality with description and prediction value"""
    level: Literal["none", "high_quality"]
    description: str
    prediction_value: float
    
    @classmethod
    def get_options(cls):
        return {
            "none": cls(level="none", description="无套磁 - No networking/outreach", prediction_value=0.0),
            "high_quality": cls(level="high_quality", description="高质量套磁 - High quality networking", prediction_value=1.0)
        }

class InterestField(BaseModel):
    """Academic field of interest with description and field name"""
    field_name: Literal[
        "Dentistry", "Politics", "Earth & Marine Sciences", "Education", 
        "Pharmacy", "Materials Science", "Veterinary Science", "Linguistics", 
        "Geophysics", "Architecture", "Engineering & Technology", "Environmental Sciences", 
        "Engineering - Chemical", "Development Studies", "Modern Languages", "Archaeology", 
        "Sociology", "Psychology", "Anatomy", "Statistics", "Economics & Econometrics", "Anthropology", 
        "Nursing", "Life Sciences & Medicine", "Marketing", "Business", "Social Policy", "Communication", 
        "Sports-related Subjects", "English Language", "History of Art", "Geography", "Chemistry", 
        "Engineering - Civil", "Music", "Natural Sciences", "Library", "Computer Science", "Arts & Humanities", 
        "Performing Arts", "Accounting", "Mathematics", "Engineering - Mineral", "Art & Design", "Theology", 
        "Philosophy", "Geology", "Biological", "Physics", "History", "Engineering - Electrical", "Medicine",
        "Data Science", "Agriculture", "Classics", "Petroleum Engineering", "Engineering - Mechanical", "Law", 
        "Hospitality", "Social Sciences & Management"
    ]
    description: str
    prediction_value: str  # The field name for prediction
    
    @classmethod
    def get_options(cls):
        fields = [
            "Dentistry", "Politics", "Earth & Marine Sciences", "Education", 
            "Pharmacy", "Materials Science", "Veterinary Science", "Linguistics", 
            "Geophysics", "Architecture", "Engineering & Technology", "Environmental Sciences", 
            "Engineering - Chemical", "Development Studies", "Modern Languages", "Archaeology", 
            "Sociology", "Psychology", "Anatomy", "Statistics", "Economics & Econometrics", "Anthropology", 
            "Nursing", "Life Sciences & Medicine", "Marketing", "Business", "Social Policy", "Communication", 
            "Sports-related Subjects", "English Language", "History of Art", "Geography", "Chemistry", 
            "Engineering - Civil", "Music", "Natural Sciences", "Library", "Computer Science", "Arts & Humanities", 
            "Performing Arts", "Accounting", "Mathematics", "Engineering - Mineral", "Art & Design", "Theology", 
            "Philosophy", "Geology", "Biological", "Physics", "History", "Engineering - Electrical", "Medicine",
            "Data Science", "Agriculture", "Classics", "Petroleum Engineering", "Engineering - Mechanical", "Law", 
            "Hospitality", "Social Sciences & Management"
        ]
        
        options = {}
        for field_name in fields:
            # Create a key from the field name (lowercase, replace spaces/special chars with underscores)
            key = field_name.lower().replace(' ', '_').replace('&', 'and').replace('-', '_')
            options[key] = cls(
                field_name=field_name,
                description=f"{field_name} - Academic field in {field_name}",
                prediction_value=field_name
            )
        return options

class StudentTagInfo(BaseModel):
    """Student tag information for LLM agents and prediction models"""
    gpa_level: Optional[GPALevel] = None
    paper_level: Optional[PaperLevel] = None
    language_level: Optional[LanguageLevel] = None  # TOEFL/IELTS
    gre_level: Optional[GRELevel] = None
    research_level: Optional[ResearchLevel] = None
    college_level: Optional[CollegeLevel] = None
    recommendation_level: Optional[RecommendationLevel] = None
    networking_level: Optional[NetworkingLevel] = None
    interest_field: Optional[InterestField] = None
    
    def get_prediction_values(self) -> dict:
        """Extract numerical values for prediction model"""
        return {
            "gpa_tag": self.gpa_level.prediction_value if self.gpa_level else None,
            "paper_tag": self.paper_level.prediction_value if self.paper_level else None,
            "toefl_tag": self.language_level.prediction_value if self.language_level else None,
            "gre_tag": self.gre_level.prediction_value if self.gre_level else None,
            "research_tag": self.research_level.prediction_value if self.research_level else None,
            "college_type_tag": self.college_level.prediction_value if self.college_level else None,
            "recommendation_tag": self.recommendation_level.prediction_value if self.recommendation_level else None,
            "networking_tag": self.networking_level.prediction_value if self.networking_level else None,
            "interest_field": self.interest_field.prediction_value if self.interest_field else None,
        }
    
    @classmethod
    def get_all_options_for_llm(cls) -> dict:
        """Get all available options for LLM agents to choose from"""
        return {
            "gpa_options": GPALevel.get_options(),
            "paper_options": PaperLevel.get_options(),
            "language_options": LanguageLevel.get_options(),
            "gre_options": GRELevel.get_options(),
            "research_options": ResearchLevel.get_options(),
            "college_options": CollegeLevel.get_options(),
            "recommendation_options": RecommendationLevel.get_options(),
            "networking_options": NetworkingLevel.get_options(),
            "interest_field_options": InterestField.get_options(),
        }

class StudenInfoForPrediction(BaseModel):
    """Complete student information model for prediction purposes"""
    user_id: str = ""
    tag_info: StudentTagInfo = StudentTagInfo()
    
    def get_prediction_data(self) -> dict:
        """Get data formatted for prediction model"""
        return self.tag_info.get_prediction_values()