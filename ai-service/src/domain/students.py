from __future__ import annotations

from typing import Any, List, Optional

from loguru import logger
from pydantic import BaseModel
from pymongo import errors

from src.domain.base.nosql import NoSQLBaseDocument
from src.infrastructure.db.mongo import connection
from src.settings import settings

# Get database instance
_database = connection.get_database(settings.DATABASE_NAME)


class Name(BaseModel):
    firstName: str = ""
    lastName: str = ""


class PhoneNumber(BaseModel):
    countryCode: str = ""
    number: str = ""


class ContactInformation(BaseModel):
    phoneNumber: PhoneNumber = PhoneNumber()
    email: str = ""


class BasicInformation(BaseModel):
    name: Name = Name()
    contactInformation: ContactInformation = ContactInformation()
    nationality: str = ""


class ApplicationDetails(BaseModel):
    degreeType: str = ""
    intendedMajor: str = ""
    targetCountry: str = ""
    applicationYear: str = ""
    applicationTerm: str = ""


class CurrentInstitution(BaseModel):
    name: str = ""
    type: str = ""


class Gpa(BaseModel):
    average: str = ""
    lastYear: str = ""


class Minor(BaseModel):
    hasMinor: Any = None
    name: str = ""
    gpa: str = ""
    motivation: str = ""


class OnlineOrOtherCourses(BaseModel):
    hasTaken: bool = False
    courseDetails: str = ""


class EducationBackground(BaseModel):
    highestDegree: str = ""
    currentInstitution: CurrentInstitution = CurrentInstitution()
    major: str = ""
    gpa: Gpa = Gpa()
    minor: Minor = Minor()
    onlineOrOtherCourses: OnlineOrOtherCourses = OnlineOrOtherCourses()
    coursesTaken: List = []


class Scores(BaseModel):
    total: str = ""
    reading: str = ""
    listening: str = ""
    speaking: str = ""
    writing: str = ""


class Test(BaseModel):
    type: str = ""
    testDate: str = ""
    scores: Scores = Scores()


class LanguageProficiencyItem(BaseModel):
    test: Test = Test()


class CareerDevelopment(BaseModel):
    careerPath: str = ""
    futureCareerPlan: str = ""
    graduateStudyPlan: str = ""
    hasWorkExperience: bool = False


class Period(BaseModel):
    startDate: str = ""
    endDate: str = ""


class References(BaseModel):
    name: str = ""
    position: str = ""
    contact: str = ""


class PracticalExperienceItem(BaseModel):
    type: str = ""
    organization: str = ""
    role: str = ""
    period: Period = Period()
    location: str = ""
    description: str = ""
    achievements: str = ""
    references: References = References()


class FinancialAid(BaseModel):
    applyingForScholarship: bool = False
    scholarshipType: str = ""
    financialNeed: str = ""
    otherScholarships: str = ""
    financialStatement: str = ""

class Recommendation(BaseModel):
    recommenderName: str = ""
    recommenderTitle: str = ""
    recommenderInstitution: str = ""
    recommenderEmail: str = ""
    recommenderPhone: str = ""
    relationshipToApplicant: str = ""
    recommendationStatus: str = ""
    recommendationDetails: str = ""

class PersonalStatements(BaseModel):
    personalStatement: str = ""
    statementOfPurpose: str = ""
    researchProposal: str = ""
    diversityStatement: str = ""
    additionalInformation: str = ""

class InternationalDegree(BaseModel):
    desiredInstitution: str = ""
    desiredProgram: str = ""
    campusPreferences: List = []

class LivingExpenses(BaseModel):
    budget: str = ""
    hasFamilySupport: bool = False


class LifestylePreferences(BaseModel):
    preferredCityType: List = []
    preferredEnvironment: List = []
    preferredGeography: List = []
    preferredLifestyle: List = []
    otherLifestylePreferences: str = ""


class StudyAbroadPreparation(BaseModel):
    internationalDegree: InternationalDegree = InternationalDegree()
    livingExpenses: LivingExpenses = LivingExpenses()
    additionalNeeds: str = ""
    lifestylePreferences: LifestylePreferences = LifestylePreferences()

class PersonalityProfile(BaseModel):
    mbtiType: str = ""
    strengths: str = ""
    interests: str = ""

class ConsentConfirmation(BaseModel):
    statement: str = ""
    agreed: bool = False

class AdditionalInformation(BaseModel):
    consentConfirmations: List[ConsentConfirmation] = []
    otherSupplements: str = ""

# Fixed duplicate Scores class - renamed the second one
class StandardizedTestScores(BaseModel):
    total: str = ""
    verbal: str = ""
    quantitative: str = ""
    analytical: str = ""

class StandardizedTest(BaseModel):
    type: str = ""
    testDate: str = ""
    scores: StandardizedTestScores = StandardizedTestScores()

class StudentBasicInfoModel(BaseModel):
    user_id: str = ""
    basicInformation: BasicInformation = BasicInformation()
    applicationDetails: ApplicationDetails = ApplicationDetails()
    educationBackground: EducationBackground = EducationBackground()
    additionalEducationBackground: List = []
    languageProficiencyExemption: str = ""
    languageProficiency: List[LanguageProficiencyItem] = []
    standardizedTests: List[StandardizedTest] = []
    careerDevelopment: CareerDevelopment = CareerDevelopment()
    practicalExperience: List[PracticalExperienceItem] = []
    financialAid: FinancialAid = FinancialAid()
    recommendations: List[Recommendation] = []
    personalStatements: PersonalStatements = PersonalStatements()
    studyAbroadPreparation: StudyAbroadPreparation = StudyAbroadPreparation()
    personalityProfile: PersonalityProfile = PersonalityProfile()
    additionalInformation: AdditionalInformation = AdditionalInformation()


class StudentDocument(StudentBasicInfoModel, NoSQLBaseDocument["StudentDocument"]):
    """MongoDB document for storing student profiles with user_id lookup capability."""
    
    class Settings:
        name = "students"
    
    @classmethod
    def find_by_user_id(cls, user_id: str) -> "StudentDocument | None":
        """Find a student profile by user_id."""
        return cls.find(user_id=user_id)
    
    @classmethod
    def create_or_update_student(cls, user_id: str, **student_data) -> "StudentDocument":
        """Create a new student profile or update an existing one by user_id."""
        existing_student = cls.find_by_user_id(user_id)
        
        if existing_student:
            # Update existing student
            for key, value in student_data.items():
                if hasattr(existing_student, key):
                    setattr(existing_student, key, value)
            
            # Update in database
            collection = _database[cls.get_collection_name()]
            collection.replace_one(
                {"user_id": user_id}, 
                existing_student.to_mongo()
            )
            return existing_student
        else:
            # Create new student
            new_student = cls(user_id=user_id, **student_data)
            return new_student.save()
    
    @classmethod
    def get_all_students(cls) -> list["StudentDocument"]:
        """Get all student profiles."""
        return cls.bulk_find()
    
    def update_basic_info(self, **basic_info_data) -> "StudentDocument | None":
        """Update basic information for this student."""
        for key, value in basic_info_data.items():
            if hasattr(self.basicInformation, key):
                setattr(self.basicInformation, key, value)
        
        # Save to database
        collection = _database[self.get_collection_name()]
        try:
            collection.replace_one(
                {"user_id": self.user_id}, 
                self.to_mongo()
            )
            return self
        except errors.WriteError:
            logger.exception("Failed to update student basic information.")
            return None
    
    @classmethod
    def create_session_profile(cls, user_id: str) -> "StudentDocument":
        """
        Create or load a user profile for the current conversation session.
        
        Args:
            user_id: The user ID for the session
            
        Returns:
            StudentDocument instance ready for use across all agents
        """
        # Get existing profile or create new one
        student_profile = cls.get_or_create(user_id=user_id)
        return student_profile

    def update_and_save(self, **updates) -> "StudentDocument":
        """
        Update multiple fields and save to database in one operation.
        
        Args:
            **updates: Dictionary of field updates
            
        Returns:
            Updated StudentDocument instance
        """
        # Update fields
        for field_name, field_value in updates.items():
            if hasattr(self, field_name):
                setattr(self, field_name, field_value)
        
        # Save to database
        collection = _database[self.get_collection_name()]
        collection.replace_one(
            {"user_id": self.user_id}, 
            self.to_mongo()
        )
        return self


# Example usage:
# 
# # Create or update a student profile
# student_doc = StudentDocument.create_or_update_student(
#     user_id="user123",
#     basicInformation=BasicInformation(
#         name=Name(firstName="John", lastName="Doe"),
#         contactInformation=ContactInformation(email="john.doe@email.com")
#     ),
#     applicationDetails=ApplicationDetails(
#         degreeType="Bachelor's",
#         intendedMajor="Computer Science",
#         targetCountry="USA"
#     )
# )
# # 
# # # Find student by user_id
# found_student = StudentDocument.find_by_user_id("user123")
# print(found_student)
# # 
# # # Update basic information
# if found_student:
#     found_student.update_basic_info(nationality="American")
# # 
# # # Get all students
# all_students = StudentDocument.get_all_students()


# student_doc = StudentDocument.create_or_update_student(
#     user_id="user456",
# )

# found_student = StudentDocument.find_by_user_id("user456")

# print(found_student)