from __future__ import annotations

from typing import Any, Dict, List, Optional
import json
import uuid
from datetime import datetime

from loguru import logger
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from src.infrastructure.db.postgres import postgres_connector


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
        """根据用户 ID 查找用户档案 - 完整版本匹配PostgreSQL所有字段"""
        try:
            session = postgres_connector.get_session()

            # 查询用户基本信息和档案
            query = text(
                """
                SELECT
                    u.id, u.email, u.name,
                    up.*
                FROM users u
                LEFT JOIN user_profiles up ON u.id = up."userId"
                WHERE u.id = :user_id
            """
            )

            result = session.execute(query, {"user_id": user_id}).fetchone()

            if not result:
                logger.info(f"No user profile found for user_id: {user_id}")
                return None

            # 解析JSON字段
            def safe_json_parse(data, default=None):
                if default is None:
                    default = {}
                if not data:
                    return default
                try:
                    return json.loads(data) if isinstance(data, str) else data
                except (json.JSONDecodeError, TypeError):
                    return default

            experiences = safe_json_parse(result.experiences)
            language_tests_data = safe_json_parse(result.languageTestsData, [])
            standardized_tests_data = safe_json_parse(result.standardizedTestsData, [])
            work_experiences = safe_json_parse(result.workExperiences, [])
            internship_experiences = safe_json_parse(result.internshipExperiences, [])
            research_projects = safe_json_parse(result.researchProjects, [])
            awards = safe_json_parse(result.awards, [])
            recommendation_letters = safe_json_parse(result.recommendationLetters, [])
            programming_skills = safe_json_parse(result.programmingSkills, [])
            language_skills = safe_json_parse(result.languageSkills, [])

            # 构建完整的学生档案
            student_profile = StudentDocument(
                user_id=user_id,
                basicInformation=BasicInformation(
                    name=Name(
                        firstName=result.name.split(" ")[0] if result.name else "",
                        lastName=(
                            " ".join(result.name.split(" ")[1:])
                            if result.name and len(result.name.split(" ")) > 1
                            else ""
                        ),
                    ),
                    contactInformation=ContactInformation(
                        email=result.email or "",
                        phoneNumber=PhoneNumber(
                            countryCode="+1", number=result.phone or ""
                        ),
                        wechat=getattr(result, "wechat", "") or "",
                        birthDate=getattr(result, "birthDate", "") or "",
                    ),
                    nationality=result.nationality or "",
                    visaRequired=getattr(result, "visaRequired", False) or False,
                ),
                applicationDetails=ApplicationDetails(
                    degreeType=getattr(result, "targetDegreeType", "") or "",
                    intendedMajor=getattr(result, "intendedMajor", "") or "",
                    targetCountry="",  # 从数组中提取
                    applicationYear=getattr(result, "applicationYear", "") or "",
                    applicationTerm=getattr(result, "applicationTerm", "") or "",
                    targetDegreeType=getattr(result, "targetDegreeType", "") or "",
                    targetMajors=safe_json_parse(
                        getattr(result, "targetMajors", "[]"), []
                    ),
                    targetCountries=safe_json_parse(
                        getattr(result, "targetCountries", "[]"), []
                    ),
                    intendedDegree=getattr(result, "intendedDegree", "") or "",
                    intendedIntakeTerm=getattr(result, "intendedIntakeTerm", "") or "",
                    intendedCountries=safe_json_parse(
                        getattr(result, "intendedCountries", "[]"), []
                    ),
                    intendedBudgets=getattr(result, "intendedBudgets", "") or "",
                    scholarshipRequirements=getattr(
                        result, "scholarshipRequirements", ""
                    )
                    or "",
                    otherPreference=getattr(result, "otherPreference", "") or "",
                    budgetRange=getattr(result, "budgetRange", "") or "",
                    scholarshipNeeds=getattr(result, "scholarshipNeeds", False)
                    or False,
                ),
                educationBackground=EducationBackground(
                    highestDegree=result.currentEducation or "",
                    currentInstitution=CurrentInstitution(
                        name=getattr(result, "undergraduateUniversity", "") or "",
                        type=getattr(result, "universityType", "") or "University",
                    ),
                    major=result.major or "",
                    gpa=Gpa(
                        average=str(result.gpa or ""),
                        lastYear=str(getattr(result, "lastTwoYearsGpa", "") or ""),
                    ),
                    lastTwoYearsGpa=str(getattr(result, "lastTwoYearsGpa", "") or ""),
                    graduationDate=getattr(result, "graduationDate", "") or "",
                    undergraduateUniversity=getattr(
                        result, "undergraduateUniversity", ""
                    )
                    or "",
                    universityRank=getattr(result, "universityRank", "") or "",
                    universityType=getattr(result, "universityType", "") or "",
                    highSchoolName=getattr(result, "highSchoolName", "") or "",
                    graduationYear=getattr(result, "graduationYear", "") or "",
                    majorSubjects=getattr(result, "majorSubjects", "") or "",
                    majorSubjectsData=safe_json_parse(
                        getattr(result, "majorSubjectsData", "[]"), []
                    ),
                ),
                careerDevelopment=CareerDevelopment(
                    careerPath=getattr(result, "careerGoals", "") or "",
                    futureCareerPlan=getattr(result, "careerGoals", "") or "",
                    graduateStudyPlan=getattr(result, "goals", "") or "",
                    hasWorkExperience=getattr(result, "totalWorkMonths", 0) > 0,
                ),
                studyAbroadPreparation=StudyAbroadPreparation(
                    internationalDegree=InternationalDegree(
                        desiredInstitution="",
                        desiredProgram="",
                    ),
                    lifestylePreferences=LifestylePreferences(
                        preferredCityType=safe_json_parse(
                            getattr(result, "preferredCityType", "[]"), []
                        ),
                        preferredEnvironment=[],
                        preferredGeography=[],
                        preferredLifestyle=[],
                    ),
                ),
                personalityProfile=PersonalityProfile(
                    mbtiType=getattr(result, "mbti", "") or "",
                    strengths=getattr(result, "personalStrengths", "") or "",
                    interests=getattr(result, "researchInterests", "") or "",
                    hobbies=getattr(result, "hobbies", "") or "",
                    personalStrengths=getattr(result, "personalStrengths", "") or "",
                    extracurricular=getattr(result, "extracurricular", "") or "",
                ),
                # 新增字段
                researchExperience=getattr(result, "researchExperience", "") or "",
                publications=getattr(result, "publications", "") or "",
                languageTestsData=[
                    LanguageTestDetails(**test) for test in language_tests_data
                ],
                standardizedTestsData=[
                    StandardizedTestDetails(**test) for test in standardized_tests_data
                ],
                workExperiences=[WorkExperience(**exp) for exp in work_experiences],
                internshipExperiences=[
                    InternshipExperience(**exp) for exp in internship_experiences
                ],
                researchProjects=[
                    ResearchProject(**proj) for proj in research_projects
                ],
                extracurricularActivities=safe_json_parse(
                    getattr(result, "extracurricularActivities", "[]"), []
                ),
                awards=[Award(**award) for award in awards],
                recommendationLetters=[
                    RecommendationLetter(**rec) for rec in recommendation_letters
                ],
                programmingSkills=[
                    ProgrammingSkill(**skill) for skill in programming_skills
                ],
                languageSkills=[LanguageSkill(**skill) for skill in language_skills],
                # 统计字段
                hasResearchExperience=getattr(result, "hasResearchExperience", False)
                or False,
                publicationCount=getattr(result, "publicationCount", 0) or 0,
                totalWorkMonths=getattr(result, "totalWorkMonths", 0) or 0,
                leadershipScore=getattr(result, "leadershipScore", 0) or 0,
                # 标签字段
                gpaTag=getattr(result, "gpaTag", "") or "",
                paperTag=getattr(result, "paperTag", "") or "",
                toeflTag=getattr(result, "toeflTag", "") or "",
                greTag=getattr(result, "greTag", "") or "",
                researchTag=getattr(result, "researchTag", "") or "",
                collegeTypeTag=getattr(result, "collegeTypeTag", "") or "",
                recommendationTag=getattr(result, "recommendationTag", "") or "",
                networkingTag=getattr(result, "networkingTag", "") or "",
                # 同步状态
                lastSyncAt=(
                    str(getattr(result, "lastSyncAt", ""))
                    if getattr(result, "lastSyncAt")
                    else None
                ),
                syncStatus=getattr(result, "syncStatus", "pending") or "pending",
                syncErrors=getattr(result, "syncErrors", "") or None,
                # 时间戳
                createdAt=(
                    str(getattr(result, "createdAt", ""))
                    if getattr(result, "createdAt")
                    else None
                ),
                updatedAt=(
                    str(getattr(result, "updatedAt", ""))
                    if getattr(result, "updatedAt")
                    else None
                ),
            )

            logger.info(f"Successfully found user profile for: {user_id}")
            return student_profile

        except SQLAlchemyError as e:
            logger.error(f"Database error when finding user {user_id}: {e}")
            return None
        except Exception as e:
            logger.error(f"Error finding user {user_id}: {e}")
            return None
        finally:
            if "session" in locals():
                session.close()

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
