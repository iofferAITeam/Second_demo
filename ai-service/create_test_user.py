#!/usr/bin/env python3
"""
创建测试用户数据的脚本
用于测试个性化AI推荐功能
"""

from src.domain.students_pg import StudentDocument, BasicInformation, Name, ContactInformation, PhoneNumber
from src.domain.students_pg import ApplicationDetails, EducationBackground, CurrentInstitution, Gpa
from src.domain.students_pg import CareerDevelopment, PersonalityProfile, StudyAbroadPreparation
from src.domain.students_pg import InternationalDegree, LifestylePreferences
import sys
import os

# 添加项目根目录到路径
sys.path.append('/Users/ella/Desktop/Ioffer/code/college-recommendation/ai-service')

def create_test_user():
    """创建测试用户档案"""
    try:
        # 创建测试用户数据
        test_user = StudentDocument.create_or_update_student(
            user_id="test_user",
            basicInformation=BasicInformation(
                name=Name(firstName="Alice", lastName="Wang"),
                contactInformation=ContactInformation(
                    email="alice.wang@example.com",
                    phoneNumber=PhoneNumber(countryCode="+1", number="555-1234")
                ),
                nationality="Chinese"
            ),
            applicationDetails=ApplicationDetails(
                degreeType="Master's",
                intendedMajor="Computer Science",
                targetCountry="USA",
                applicationYear="2024",
                applicationTerm="Fall"
            ),
            educationBackground=EducationBackground(
                highestDegree="Bachelor's",
                currentInstitution=CurrentInstitution(
                    name="Beijing University of Technology",
                    type="University"
                ),
                major="Software Engineering",
                gpa=Gpa(average="3.8", lastYear="3.9")
            ),
            careerDevelopment=CareerDevelopment(
                careerPath="Software Development",
                futureCareerPlan="AI/Machine Learning Engineer",
                graduateStudyPlan="Pursue PhD in Computer Science",
                hasWorkExperience=True
            ),
            studyAbroadPreparation=StudyAbroadPreparation(
                internationalDegree=InternationalDegree(
                    desiredInstitution="Stanford University",
                    desiredProgram="MS Computer Science"
                ),
                lifestylePreferences=LifestylePreferences(
                    preferredCityType=["Large City", "Tech Hub"],
                    preferredEnvironment=["Urban", "Academic"],
                    preferredGeography=["West Coast"],
                    preferredLifestyle=["Active", "Diverse"]
                )
            ),
            personalityProfile=PersonalityProfile(
                mbtiType="INTJ",
                strengths="Problem-solving, Leadership, Technical Skills",
                interests="Machine Learning, Robotics, Open Source Development"
            )
        )

        print("✅ 成功创建测试用户档案!")
        print(f"用户ID: {test_user.user_id}")
        print(f"姓名: {test_user.basicInformation.name.firstName} {test_user.basicInformation.name.lastName}")
        print(f"意向专业: {test_user.applicationDetails.intendedMajor}")
        print(f"目标国家: {test_user.applicationDetails.targetCountry}")
        print(f"当前院校: {test_user.educationBackground.currentInstitution.name}")
        print(f"GPA: {test_user.educationBackground.gpa.average}")

        return test_user

    except Exception as e:
        print(f"❌ 创建测试用户失败: {e}")
        import traceback
        traceback.print_exc()
        return None

def create_additional_test_user():
    """创建第二个测试用户（不同背景）"""
    try:
        test_user2 = StudentDocument.create_or_update_student(
            user_id="test_user_2",
            basicInformation=BasicInformation(
                name=Name(firstName="John", lastName="Smith"),
                contactInformation=ContactInformation(email="john.smith@example.com"),
                nationality="American"
            ),
            applicationDetails=ApplicationDetails(
                degreeType="Bachelor's",
                intendedMajor="Business Administration",
                targetCountry="UK",
                applicationYear="2024",
                applicationTerm="Spring"
            ),
            educationBackground=EducationBackground(
                highestDegree="High School",
                currentInstitution=CurrentInstitution(
                    name="Lincoln High School",
                    type="High School"
                ),
                gpa=Gpa(average="3.5")
            ),
            careerDevelopment=CareerDevelopment(
                careerPath="Business",
                futureCareerPlan="Management Consultant",
                hasWorkExperience=False
            ),
            studyAbroadPreparation=StudyAbroadPreparation(
                internationalDegree=InternationalDegree(
                    desiredInstitution="Oxford University",
                    desiredProgram="BA Business Administration"
                ),
                lifestylePreferences=LifestylePreferences(
                    preferredCityType=["Medium City", "Historic"],
                    preferredEnvironment=["Traditional", "Academic"],
                    preferredLifestyle=["Quiet", "Cultural"]
                )
            ),
            personalityProfile=PersonalityProfile(
                mbtiType="ENFJ",
                interests="Economics, History, Debate"
            )
        )

        print("✅ 成功创建第二个测试用户档案!")
        print(f"用户ID: {test_user2.user_id}")
        print(f"姓名: {test_user2.basicInformation.name.firstName} {test_user2.basicInformation.name.lastName}")
        print(f"意向专业: {test_user2.applicationDetails.intendedMajor}")

        return test_user2

    except Exception as e:
        print(f"❌ 创建第二个测试用户失败: {e}")
        return None

if __name__ == "__main__":
    print("🔧 创建测试用户数据...")
    print("=" * 50)

    # 创建第一个测试用户
    user1 = create_test_user()
    print()

    # 创建第二个测试用户
    user2 = create_additional_test_user()
    print()

    if user1 and user2:
        print("🎉 所有测试用户创建完成!")
        print("现在可以使用以下用户ID进行测试:")
        print("- test_user (Alice Wang - CS研究生)")
        print("- test_user_2 (John Smith - BA本科生)")
    else:
        print("❌ 部分或全部测试用户创建失败")