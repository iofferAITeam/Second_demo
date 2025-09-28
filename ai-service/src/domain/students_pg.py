from __future__ import annotations

from typing import Any, Dict, List, Optional
import json
import uuid

from loguru import logger
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from src.infrastructure.db.postgres import postgres_connector

# 保持原有的 Pydantic 模型结构用于数据验证和类型安全
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

class EducationBackground(BaseModel):
    highestDegree: str = ""
    currentInstitution: CurrentInstitution = CurrentInstitution()
    major: str = ""
    gpa: Gpa = Gpa()

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

class PersonalityProfile(BaseModel):
    mbtiType: str = ""
    strengths: str = ""
    interests: str = ""

class StudentDocument(BaseModel):
    user_id: str
    basicInformation: BasicInformation = BasicInformation()
    applicationDetails: ApplicationDetails = ApplicationDetails()
    educationBackground: EducationBackground = EducationBackground()
    careerDevelopment: CareerDevelopment = CareerDevelopment()
    studyAbroadPreparation: StudyAbroadPreparation = StudyAbroadPreparation()
    personalityProfile: PersonalityProfile = PersonalityProfile()

    @classmethod
    def find_by_user_id(cls, user_id: str) -> Optional[StudentDocument]:
        """根据用户 ID 查找用户档案"""
        try:
            session = postgres_connector.get_session()

            # 查询用户基本信息和档案
            query = text("""
                SELECT
                    u.id, u.email, u.name,
                    up.phone, up.wechat, up."birthDate", up."currentEducation",
                    up.gpa, up.major, up."graduationDate", up.toefl, up.ielts,
                    up.gre, up.gmat, up.experiences, up.goals, up.nationality
                FROM users u
                LEFT JOIN user_profiles up ON u.id = up."userId"
                WHERE u.id = :user_id
            """)

            result = session.execute(query, {"user_id": user_id}).fetchone()

            if not result:
                logger.info(f"No user profile found for user_id: {user_id}")
                return None

            # 将数据库记录转换为 StudentDocument
            # 解析 experiences JSON 字段
            experiences = {}
            if result.experiences:
                try:
                    experiences = json.loads(result.experiences) if isinstance(result.experiences, str) else result.experiences
                except (json.JSONDecodeError, TypeError):
                    experiences = {}

            # 从 experiences 中提取结构化数据
            career_dev = experiences.get('career', {})
            study_abroad = experiences.get('studyAbroad', {})
            personality = experiences.get('personality', {})

            # 构建学生档案
            student_profile = StudentDocument(
                user_id=user_id,
                basicInformation=BasicInformation(
                    name=Name(
                        firstName=result.name.split(' ')[0] if result.name else "",
                        lastName=' '.join(result.name.split(' ')[1:]) if result.name and len(result.name.split(' ')) > 1 else ""
                    ),
                    contactInformation=ContactInformation(
                        email=result.email or "",
                        phoneNumber=PhoneNumber(
                            countryCode="+1",  # 默认值
                            number=result.phone or ""
                        )
                    ),
                    nationality=result.nationality or ""
                ),
                applicationDetails=ApplicationDetails(
                    degreeType=experiences.get('degreeType', ''),
                    intendedMajor=result.major or "",
                    targetCountry=experiences.get('targetCountry', ''),
                    applicationYear=experiences.get('applicationYear', ''),
                    applicationTerm=experiences.get('applicationTerm', '')
                ),
                educationBackground=EducationBackground(
                    highestDegree=result.currentEducation or "",
                    currentInstitution=CurrentInstitution(
                        name=experiences.get('institution', ''),
                        type="University"  # 默认值
                    ),
                    major=result.major or "",
                    gpa=Gpa(
                        average=str(result.gpa or ""),
                        lastYear=""  # PostgreSQL 中没有这个字段
                    )
                ),
                careerDevelopment=CareerDevelopment(
                    careerPath=career_dev.get('careerPath', ''),
                    futureCareerPlan=career_dev.get('futureCareerPlan', ''),
                    graduateStudyPlan=career_dev.get('graduateStudyPlan', ''),
                    hasWorkExperience=career_dev.get('hasWorkExperience', False)
                ),
                studyAbroadPreparation=StudyAbroadPreparation(
                    internationalDegree=InternationalDegree(
                        desiredInstitution=study_abroad.get('desiredInstitution', ''),
                        desiredProgram=study_abroad.get('desiredProgram', '')
                    ),
                    lifestylePreferences=LifestylePreferences(
                        preferredCityType=study_abroad.get('preferredCityType', []),
                        preferredEnvironment=study_abroad.get('preferredEnvironment', []),
                        preferredGeography=study_abroad.get('preferredGeography', []),
                        preferredLifestyle=study_abroad.get('preferredLifestyle', [])
                    )
                ),
                personalityProfile=PersonalityProfile(
                    mbtiType=personality.get('mbtiType', ''),
                    strengths=personality.get('strengths', ''),
                    interests=personality.get('interests', '')
                )
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
            if 'session' in locals():
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
                'career': careerDevelopment.dict() if careerDevelopment else {},
                'studyAbroad': studyAbroadPreparation.dict() if studyAbroadPreparation else {},
                'personality': personalityProfile.dict() if personalityProfile else {},
                'degreeType': applicationDetails.degreeType if applicationDetails else '',
                'targetCountry': applicationDetails.targetCountry if applicationDetails else '',
                'applicationYear': applicationDetails.applicationYear if applicationDetails else '',
                'applicationTerm': applicationDetails.applicationTerm if applicationDetails else '',
                'institution': educationBackground.currentInstitution.name if educationBackground else ''
            }

            # 更新或创建用户基本信息
            if basicInformation:
                full_name = f"{basicInformation.name.firstName} {basicInformation.name.lastName}".strip()
                user_query = text("""
                    INSERT INTO users (id, email, name, password, "createdAt", "updatedAt")
                    VALUES (:user_id, :email, :name, 'temp_password', NOW(), NOW())
                    ON CONFLICT (id) DO UPDATE SET
                        email = EXCLUDED.email,
                        name = EXCLUDED.name,
                        "updatedAt" = NOW()
                """)

                session.execute(user_query, {
                    'user_id': user_id,
                    'email': basicInformation.contactInformation.email,
                    'name': full_name
                })

            # 更新或创建用户档案
            profile_query = text("""
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
            """)

            session.execute(profile_query, {
                'profile_id': str(uuid.uuid4()),
                'user_id': user_id,
                'phone': basicInformation.contactInformation.phoneNumber.number if basicInformation else None,
                'nationality': basicInformation.nationality if basicInformation else None,
                'currentEducation': educationBackground.highestDegree if educationBackground else None,
                'gpa': float(educationBackground.gpa.average) if educationBackground and educationBackground.gpa.average else None,
                'major': educationBackground.major if educationBackground else None,
                'experiences': json.dumps(experiences),
                'goals': careerDevelopment.futureCareerPlan if careerDevelopment else None
            })

            session.commit()
            logger.info(f"Successfully created/updated user profile for: {user_id}")

            # 返回完整的学生档案
            return cls.find_by_user_id(user_id)

        except SQLAlchemyError as e:
            if 'session' in locals():
                session.rollback()
            logger.error(f"Database error when creating/updating user {user_id}: {e}")
            return None
        except Exception as e:
            if 'session' in locals():
                session.rollback()
            logger.error(f"Error creating/updating user {user_id}: {e}")
            return None
        finally:
            if 'session' in locals():
                session.close()