from __future__ import annotations

from typing import Any, Dict, List, Optional
import json
import uuid
import os
import requests
from datetime import datetime

from loguru import logger
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from src.infrastructure.db.postgres import postgres_connector


def _fetch_user_profile_from_api(user_id: str) -> Optional[Dict[str, Any]]:
    """从后端API获取用户档案数据"""
    try:
        # 获取API密钥
        api_key = os.getenv("AI_SERVICE_API_KEY")
        if not api_key:
            logger.error("AI_SERVICE_API_KEY environment variable not set")
            return None

        # 构建API URL - 在Docker环境中使用服务名称
        api_url = f"http://backend:8001/api/user/profile?user_id={user_id}"

        # 设置请求头
        headers = {"x-api-key": api_key, "Content-Type": "application/json"}

        # 发送请求
        response = requests.get(api_url, headers=headers, timeout=30)

        if response.status_code == 200:
            data = response.json()
            logger.info(
                f"Successfully fetched user profile from API for user_id: {user_id}"
            )
            return data
        elif response.status_code == 404:
            logger.info(f"No user profile found for user_id: {user_id}")
            return None
        else:
            logger.error(
                f"API request failed with status {response.status_code}: {response.text}"
            )
            return None

    except requests.exceptions.RequestException as e:
        logger.error(f"Request error when fetching user profile for {user_id}: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error when fetching user profile for {user_id}: {e}")
        return None


# 扩展的 Pydantic 模型结构，匹配PostgreSQL数据库字段
class Name(BaseModel):
    firstName: str = ""
    lastName: str = ""


class PhoneNumber(BaseModel):
    countryCode: str = ""
    number: str = ""


class ContactInformation(BaseModel):
    phoneNumber: PhoneNumber = PhoneNumber()
    email: str = ""
    wechat: str = ""
    birthDate: str = ""


class BasicInformation(BaseModel):
    name: Name = Name()
    contactInformation: ContactInformation = ContactInformation()
    nationality: str = ""
    visaRequired: bool = False


class ApplicationDetails(BaseModel):
    degreeType: str = ""
    intendedMajor: str = ""
    targetCountry: str = ""
    applicationYear: str = ""
    applicationTerm: str = ""
    targetDegreeType: str = ""
    targetMajors: List[str] = []
    targetCountries: List[str] = []
    intendedDegree: str = ""
    intendedIntakeTerm: str = ""
    intendedCountries: List[str] = []
    intendedBudgets: str = ""
    scholarshipRequirements: str = ""
    otherPreference: str = ""
    budgetRange: str = ""
    scholarshipNeeds: bool = False


class CurrentInstitution(BaseModel):
    name: str = ""
    type: str = ""


class Gpa(BaseModel):
    average: str = ""
    lastYear: str = ""


# 为了兼容性，先定义MongoDB版本中存在的其他模型类
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
    lastTwoYearsGpa: str = ""
    graduationDate: str = ""
    undergraduateUniversity: str = ""
    universityRank: str = ""
    universityType: str = ""
    highSchoolName: str = ""
    graduationYear: str = ""
    majorSubjects: str = ""
    majorSubjectsData: List[str] = []
    # 添加MongoDB版本的字段以完全兼容
    minor: Minor = Minor()
    onlineOrOtherCourses: OnlineOrOtherCourses = OnlineOrOtherCourses()
    coursesTaken: List = []


class CareerDevelopment(BaseModel):
    careerPath: str = ""
    futureCareerPlan: str = ""
    graduateStudyPlan: str = ""
    hasWorkExperience: bool = False


class InternationalDegree(BaseModel):
    desiredInstitution: str = ""
    desiredProgram: str = ""


class LifestylePreferences(BaseModel):
    preferredCityType: List[str] = []
    preferredEnvironment: List[str] = []
    preferredGeography: List[str] = []
    preferredLifestyle: List[str] = []


class StudyAbroadPreparation(BaseModel):
    internationalDegree: InternationalDegree = InternationalDegree()
    lifestylePreferences: LifestylePreferences = LifestylePreferences()


# 新增缺失的模型类
class LanguageTestDetails(BaseModel):
    testType: str = ""
    score: str = ""
    date: str = ""
    reading: str = ""
    listening: str = ""
    speaking: str = ""
    writing: str = ""


class StandardizedTestDetails(BaseModel):
    testType: str = ""
    score: str = ""
    date: str = ""
    verbal: str = ""
    quantitative: str = ""
    analytical: str = ""


class WorkExperience(BaseModel):
    company: str = ""
    position: str = ""
    startDate: str = ""
    endDate: str = ""
    description: str = ""
    location: str = ""
    achievements: str = ""


class InternshipExperience(BaseModel):
    company: str = ""
    position: str = ""
    startDate: str = ""
    endDate: str = ""
    description: str = ""
    location: str = ""
    achievements: str = ""


class ResearchProject(BaseModel):
    title: str = ""
    institution: str = ""
    supervisor: str = ""
    startDate: str = ""
    endDate: str = ""
    description: str = ""
    achievements: str = ""


class Award(BaseModel):
    name: str = ""
    organization: str = ""
    date: str = ""
    description: str = ""


class RecommendationLetter(BaseModel):
    recommenderName: str = ""
    recommenderTitle: str = ""
    recommenderInstitution: str = ""
    recommenderEmail: str = ""
    recommenderPhone: str = ""
    relationshipToApplicant: str = ""
    recommendationStatus: str = ""
    recommendationDetails: str = ""


class ProgrammingSkill(BaseModel):
    language: str = ""
    proficiency: str = ""
    experience: str = ""


class LanguageSkill(BaseModel):
    language: str = ""
    proficiency: str = ""
    certification: str = ""


class PersonalityProfile(BaseModel):
    mbtiType: str = ""
    strengths: str = ""
    interests: str = ""
    hobbies: str = ""
    personalStrengths: str = ""
    extracurricular: str = ""


# 继续定义其他兼容性模型类
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


class LivingExpenses(BaseModel):
    budget: str = ""
    hasFamilySupport: bool = False


class ConsentConfirmation(BaseModel):
    statement: str = ""
    agreed: bool = False


class AdditionalInformation(BaseModel):
    consentConfirmations: List[ConsentConfirmation] = []
    otherSupplements: str = ""


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
    """基础学生信息模型 - 兼容MongoDB版本"""

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


class StudentDocument(BaseModel):
    user_id: str
    basicInformation: BasicInformation = BasicInformation()
    applicationDetails: ApplicationDetails = ApplicationDetails()
    educationBackground: EducationBackground = EducationBackground()
    careerDevelopment: CareerDevelopment = CareerDevelopment()
    studyAbroadPreparation: StudyAbroadPreparation = StudyAbroadPreparation()
    personalityProfile: PersonalityProfile = PersonalityProfile()

    # 新增字段匹配PostgreSQL数据库
    researchExperience: str = ""
    publications: str = ""
    languageTestsData: List[LanguageTestDetails] = []
    standardizedTestsData: List[StandardizedTestDetails] = []
    workExperiences: List[WorkExperience] = []
    internshipExperiences: List[InternshipExperience] = []
    researchProjects: List[ResearchProject] = []
    extracurricularActivities: List[str] = []
    awards: List[Award] = []
    recommendationLetters: List[RecommendationLetter] = []
    programmingSkills: List[ProgrammingSkill] = []
    languageSkills: List[LanguageSkill] = []

    # 统计字段
    hasResearchExperience: bool = False
    publicationCount: int = 0
    totalWorkMonths: int = 0
    leadershipScore: int = 0

    # 标签字段
    gpaTag: str = ""
    paperTag: str = ""
    toeflTag: str = ""
    greTag: str = ""
    researchTag: str = ""
    collegeTypeTag: str = ""
    recommendationTag: str = ""
    networkingTag: str = ""

    # 同步状态
    lastSyncAt: Optional[str] = None
    syncStatus: str = "pending"
    syncErrors: Optional[str] = None

    # 时间戳
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

    @classmethod
    def find_by_user_id(cls, user_id: str) -> Optional[StudentDocument]:
        """根据用户 ID 查找用户档案 - 从API获取数据"""
        try:
            # 从API获取用户数据
            api_data = _fetch_user_profile_from_api(user_id)
            if not api_data:
                logger.info(f"No user profile found for user_id: {user_id}")
                return None

            # 解析API返回的数据
            user_data = api_data.get("user", {})
            profile_data = api_data.get("profileData", {})
            basic_info = profile_data.get("basicInfo", {})
            academic_performance = profile_data.get("academicPerformance", {})
            application_intentions = profile_data.get("applicationIntentions", {})

            # 解析JSON字段的辅助函数
            def safe_json_parse(data, default=None):
                if default is None:
                    default = {}
                if not data:
                    return default
                try:
                    return json.loads(data) if isinstance(data, str) else data
                except (json.JSONDecodeError, TypeError):
                    return default

            # 解析语言测试数据
            language_tests_data = academic_performance.get("languageTestsData", [])
            standardized_tests_data = academic_performance.get(
                "standardizedTestsData", []
            )

            # 构建完整的学生档案
            student_profile = StudentDocument(
                user_id=user_id,
                basicInformation=BasicInformation(
                    name=Name(
                        firstName=basic_info.get("firstName", ""),
                        lastName=basic_info.get("lastName", ""),
                    ),
                    contactInformation=ContactInformation(
                        email=basic_info.get("email", user_data.get("email", "")),
                        phoneNumber=PhoneNumber(
                            countryCode="+1", number=basic_info.get("phone", "")
                        ),
                        wechat="",  # API数据中未包含
                        birthDate="",  # API数据中未包含
                    ),
                    nationality=basic_info.get("nationality", ""),
                    visaRequired=basic_info.get("visaRequired", False),
                ),
                applicationDetails=ApplicationDetails(
                    degreeType=application_intentions.get("intendedDegree", ""),
                    intendedMajor=application_intentions.get("intendedMajor", ""),
                    targetCountry="",  # 从数组中提取
                    applicationYear="",  # API数据中未包含
                    applicationTerm=application_intentions.get(
                        "intendedIntakeTerm", ""
                    ),
                    targetDegreeType=application_intentions.get("intendedDegree", ""),
                    targetMajors=[application_intentions.get("intendedMajor", "")],
                    targetCountries=application_intentions.get("intendedCountries", []),
                    intendedDegree=application_intentions.get("intendedDegree", ""),
                    intendedIntakeTerm=application_intentions.get(
                        "intendedIntakeTerm", ""
                    ),
                    intendedCountries=application_intentions.get(
                        "intendedCountries", []
                    ),
                    intendedBudgets=application_intentions.get("intendedBudgets", ""),
                    scholarshipRequirements=application_intentions.get(
                        "scholarshipRequirements", ""
                    ),
                    otherPreference=application_intentions.get("otherPreference", ""),
                    budgetRange=application_intentions.get("intendedBudgets", ""),
                    scholarshipNeeds=application_intentions.get(
                        "otherFinancialAidsRequired", False
                    ),
                ),
                educationBackground=EducationBackground(
                    highestDegree=academic_performance.get("highestDegree", ""),
                    currentInstitution=CurrentInstitution(
                        name="",  # API数据中未包含
                        type="University",
                    ),
                    major=academic_performance.get("major", ""),
                    gpa=Gpa(
                        average=academic_performance.get("gpa", ""),
                        lastYear=academic_performance.get("majorGpa", ""),
                    ),
                    lastTwoYearsGpa=academic_performance.get("majorGpa", ""),
                    graduationDate="",  # API数据中未包含
                    undergraduateUniversity="",  # API数据中未包含
                    universityRank="",  # API数据中未包含
                    universityType="",  # API数据中未包含
                    highSchoolName="",  # API数据中未包含
                    graduationYear="",  # API数据中未包含
                    majorSubjects="",  # API数据中未包含
                    majorSubjectsData=[],
                ),
                careerDevelopment=CareerDevelopment(
                    careerPath=application_intentions.get("careerIntentions", ""),
                    futureCareerPlan=application_intentions.get("careerIntentions", ""),
                    graduateStudyPlan="",  # API数据中未包含
                    hasWorkExperience=bool(
                        application_intentions.get("internshipExperience", "")
                    ),
                ),
                studyAbroadPreparation=StudyAbroadPreparation(
                    internationalDegree=InternationalDegree(
                        desiredInstitution="",  # API数据中未包含
                        desiredProgram="",  # API数据中未包含
                    ),
                    lifestylePreferences=LifestylePreferences(
                        preferredCityType=[],
                        preferredEnvironment=[],
                        preferredGeography=[],
                        preferredLifestyle=[],
                    ),
                ),
                personalityProfile=PersonalityProfile(
                    mbtiType=basic_info.get("mbti", ""),
                    strengths=basic_info.get("personalStrengths", ""),
                    interests="",  # API数据中未包含
                    hobbies=basic_info.get("hobbies", ""),
                    personalStrengths=basic_info.get("personalStrengths", ""),
                    extracurricular=basic_info.get("extracurricular", ""),
                ),
                # 新增字段
                researchExperience=academic_performance.get("researchExperience", ""),
                publications=academic_performance.get("publications", ""),
                languageTestsData=[
                    LanguageTestDetails(**test) for test in language_tests_data
                ],
                standardizedTestsData=[
                    StandardizedTestDetails(**test) for test in standardized_tests_data
                ],
                workExperiences=[],  # API数据中未包含
                internshipExperiences=[],  # API数据中未包含
                researchProjects=[],  # API数据中未包含
                extracurricularActivities=[],  # API数据中未包含
                awards=[],  # API数据中未包含
                recommendationLetters=[],  # API数据中未包含
                programmingSkills=[],  # API数据中未包含
                languageSkills=[],  # API数据中未包含
                # 统计字段
                hasResearchExperience=academic_performance.get("researchExperience", "")
                != "NONE",
                publicationCount=0,  # API数据中未包含
                totalWorkMonths=0,  # API数据中未包含
                leadershipScore=0,  # API数据中未包含
                # 标签字段
                gpaTag="",  # API数据中未包含
                paperTag="",  # API数据中未包含
                toeflTag="",  # API数据中未包含
                greTag="",  # API数据中未包含
                researchTag="",  # API数据中未包含
                collegeTypeTag="",  # API数据中未包含
                recommendationTag="",  # API数据中未包含
                networkingTag="",  # API数据中未包含
                # 同步状态
                lastSyncAt=None,
                syncStatus="pending",
                syncErrors=None,
                # 时间戳
                createdAt=user_data.get("createdAt"),
                updatedAt=None,
            )

            logger.info(f"Successfully found user profile for: {user_id}")
            return student_profile

        except Exception as e:
            logger.error(f"Error finding user {user_id}: {e}")
            return None

    @classmethod
    def create_or_update_student(
        cls,
        user_id: str,
        basicInformation: Optional[BasicInformation] = None,
        applicationDetails: Optional[ApplicationDetails] = None,
        educationBackground: Optional[EducationBackground] = None,
        careerDevelopment: Optional[CareerDevelopment] = None,
        studyAbroadPreparation: Optional[StudyAbroadPreparation] = None,
        personalityProfile: Optional[PersonalityProfile] = None,
    ) -> Optional[StudentDocument]:
        """创建或更新学生档案"""
        try:
            session = postgres_connector.get_session()
            session.begin()

            # 构建 experiences JSON 数据
            experiences = {
                "career": careerDevelopment.dict() if careerDevelopment else {},
                "studyAbroad": (
                    studyAbroadPreparation.dict() if studyAbroadPreparation else {}
                ),
                "personality": personalityProfile.dict() if personalityProfile else {},
                "degreeType": (
                    applicationDetails.degreeType if applicationDetails else ""
                ),
                "targetCountry": (
                    applicationDetails.targetCountry if applicationDetails else ""
                ),
                "applicationYear": (
                    applicationDetails.applicationYear if applicationDetails else ""
                ),
                "applicationTerm": (
                    applicationDetails.applicationTerm if applicationDetails else ""
                ),
                "institution": (
                    educationBackground.currentInstitution.name
                    if educationBackground
                    else ""
                ),
            }

            # 更新或创建用户基本信息
            if basicInformation:
                full_name = f"{basicInformation.name.firstName} {basicInformation.name.lastName}".strip()
                user_query = text(
                    """
                    INSERT INTO users (id, email, name, password, "createdAt", "updatedAt")
                    VALUES (:user_id, :email, :name, 'temp_password', NOW(), NOW())
                    ON CONFLICT (id) DO UPDATE SET
                        email = EXCLUDED.email,
                        name = EXCLUDED.name,
                        "updatedAt" = NOW()
                """
                )

                session.execute(
                    user_query,
                    {
                        "user_id": user_id,
                        "email": basicInformation.contactInformation.email,
                        "name": full_name,
                    },
                )

            # 更新或创建用户档案
            profile_query = text(
                """
                INSERT INTO user_profiles (
                    id, "userId", phone, nationality, "currentEducation",
                    gpa, major, experiences, goals, "createdAt", "updatedAt"
                )
                VALUES (
                    :profile_id, :user_id, :phone, :nationality, :currentEducation,
                    :gpa, :major, :experiences, :goals, NOW(), NOW()
                )
                ON CONFLICT ("userId") DO UPDATE SET
                    phone = EXCLUDED.phone,
                    nationality = EXCLUDED.nationality,
                    "currentEducation" = EXCLUDED."currentEducation",
                    gpa = EXCLUDED.gpa,
                    major = EXCLUDED.major,
                    experiences = EXCLUDED.experiences,
                    goals = EXCLUDED.goals,
                    "updatedAt" = NOW()
            """
            )

            session.execute(
                profile_query,
                {
                    "profile_id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "phone": (
                        basicInformation.contactInformation.phoneNumber.number
                        if basicInformation
                        else None
                    ),
                    "nationality": (
                        basicInformation.nationality if basicInformation else None
                    ),
                    "currentEducation": (
                        educationBackground.highestDegree
                        if educationBackground
                        else None
                    ),
                    "gpa": (
                        float(educationBackground.gpa.average)
                        if educationBackground and educationBackground.gpa.average
                        else None
                    ),
                    "major": educationBackground.major if educationBackground else None,
                    "experiences": json.dumps(experiences),
                    "goals": (
                        careerDevelopment.futureCareerPlan
                        if careerDevelopment
                        else None
                    ),
                },
            )

            session.commit()
            logger.info(f"Successfully created/updated user profile for: {user_id}")

            # 返回完整的学生档案
            return cls.find_by_user_id(user_id)

        except SQLAlchemyError as e:
            if "session" in locals():
                session.rollback()
            logger.error(f"Database error when creating/updating user {user_id}: {e}")
            return None
        except Exception as e:
            if "session" in locals():
                session.rollback()
            logger.error(f"Error creating/updating user {user_id}: {e}")
            return None
        finally:
            if "session" in locals():
                session.close()

    @classmethod
    def get_all_students(cls) -> List[StudentDocument]:
        """获取所有学生档案 - 匹配MongoDB版本功能"""
        try:
            session = postgres_connector.get_session()

            query = text(
                """
                SELECT
                    u.id, u.email, u.name,
                    up.*
                FROM users u
                LEFT JOIN user_profiles up ON u.id = up."userId"
                ORDER BY up."updatedAt" DESC
                """
            )

            results = session.execute(query).fetchall()
            students = []

            for result in results:
                if result.id:  # 确保有用户ID
                    student = cls.find_by_user_id(result.id)
                    if student:
                        students.append(student)

            logger.info(f"Retrieved {len(students)} student profiles")
            return students

        except SQLAlchemyError as e:
            logger.error(f"Database error when getting all students: {e}")
            return []
        except Exception as e:
            logger.error(f"Error getting all students: {e}")
            return []
        finally:
            if "session" in locals():
                session.close()

    def update_basic_info(self, **basic_info_data) -> Optional[StudentDocument]:
        """更新基础信息 - 匹配MongoDB版本功能"""
        try:
            # 更新本地对象
            for key, value in basic_info_data.items():
                if hasattr(self.basicInformation, key):
                    setattr(self.basicInformation, key, value)

            # 保存到数据库
            return self.__class__.create_or_update_student(
                user_id=self.user_id,
                basicInformation=self.basicInformation,
                applicationDetails=self.applicationDetails,
                educationBackground=self.educationBackground,
                careerDevelopment=self.careerDevelopment,
                studyAbroadPreparation=self.studyAbroadPreparation,
                personalityProfile=self.personalityProfile,
            )

        except Exception as e:
            logger.error(f"Error updating basic info for user {self.user_id}: {e}")
            return None

    @classmethod
    def create_session_profile(cls, user_id: str) -> StudentDocument:
        """为当前对话会话创建或加载用户档案 - 匹配MongoDB版本功能"""
        student_profile = cls.find_by_user_id(user_id)
        if not student_profile:
            # 如果API调用失败，创建一个空的档案作为fallback
            logger.warning(
                f"API call failed for user {user_id}, creating empty profile as fallback"
            )
            student_profile = cls.create_or_update_student(user_id=user_id)
        return student_profile

    def update_and_save(self, **updates) -> StudentDocument:
        """在一次操作中更新多个字段并保存到数据库 - 匹配MongoDB版本功能"""
        for field_name, field_value in updates.items():
            if hasattr(self, field_name):
                setattr(self, field_name, field_value)

        updated_profile = self.__class__.create_or_update_student(
            user_id=self.user_id,
            basicInformation=self.basicInformation,
            applicationDetails=self.applicationDetails,
            educationBackground=self.educationBackground,
            careerDevelopment=self.careerDevelopment,
            studyAbroadPreparation=self.studyAbroadPreparation,
            personalityProfile=self.personalityProfile,
        )
        return updated_profile or self

    @classmethod
    def bulk_find(cls, **filters) -> List[StudentDocument]:
        """批量查找学生档案 - 匹配MongoDB版本功能"""
        try:
            session = postgres_connector.get_session()
            query_str = """
                SELECT u.id, u.email, u.name, up.*
                FROM users u
                LEFT JOIN user_profiles up ON u.id = up."userId"
                WHERE 1=1
            """
            query_params = {}

            if "nationality" in filters:
                query_str += " AND up.nationality = :nationality"
                query_params["nationality"] = filters["nationality"]
            if "major" in filters:
                query_str += " AND up.major = :major"
                query_params["major"] = filters["major"]

            query_str += ' ORDER BY up."updatedAt" DESC'
            query = text(query_str)
            results = session.execute(query, query_params).fetchall()

            students = []
            for result in results:
                if result.id:
                    student = cls.find_by_user_id(result.id)
                    if student:
                        students.append(student)
            return students

        except Exception as e:
            logger.error(f"Error in bulk_find: {e}")
            return []
        finally:
            if "session" in locals():
                session.close()

    def save(self) -> StudentDocument:
        """保存当前档案到数据库 - 匹配MongoDB版本功能"""
        return (
            self.__class__.create_or_update_student(
                user_id=self.user_id,
                basicInformation=self.basicInformation,
                applicationDetails=self.applicationDetails,
                educationBackground=self.educationBackground,
                careerDevelopment=self.careerDevelopment,
                studyAbroadPreparation=self.studyAbroadPreparation,
                personalityProfile=self.personalityProfile,
            )
            or self
        )

    @classmethod
    def get_or_create(cls, **kwargs) -> StudentDocument:
        """获取或创建学生档案 - 匹配MongoDB版本功能"""
        user_id = kwargs.get("user_id")
        if not user_id:
            raise ValueError("user_id is required")
        student = cls.find_by_user_id(user_id)
        return (
            student
            if student
            else cls.create_or_update_student(user_id=user_id, **kwargs)
        )

    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式 - 匹配MongoDB版本功能"""
        return self.dict()

    @classmethod
    def find(cls, **filters) -> Optional[StudentDocument]:
        """根据过滤条件查找单个学生档案 - 匹配MongoDB版本功能"""
        if "user_id" in filters:
            return cls.find_by_user_id(filters["user_id"])
        results = cls.bulk_find(**filters)
        return results[0] if results else None
