"""
Fixed script to create Hanyu Liu's student profile with proper type handling
"""

from src.domain.students import (
    StudentDocument, 
    BasicInformation, 
    Name, 
    ContactInformation, 
    PhoneNumber,
    ApplicationDetails,
    EducationBackground,
    CurrentInstitution,
    Gpa,
    Minor,
    OnlineOrOtherCourses,
    LanguageProficiencyItem,
    Test,
    Scores,
    CareerDevelopment,
    PracticalExperienceItem,
    Period,
    References,
    FinancialAid,
    Recommendation,
    PersonalStatements,
    StudyAbroadPreparation,
    InternationalDegree,
    LivingExpenses,
    LifestylePreferences,
    PersonalityProfile,
    AdditionalInformation,
    ConsentConfirmation
)

def create_hanyu_profile_properly():
    """Create Hanyu Liu's profile with proper Pydantic model instantiation"""
    
    user_id = "hanyu_liu_003"
    print(f"Creating comprehensive student profile for Hanyu Liu (ID: {user_id})...")
    
    try:
        # Create the student profile with properly instantiated Pydantic models
        hanyu_profile = StudentDocument(
            user_id=user_id,
            basicInformation=BasicInformation(
                name=Name(
                    firstName="Hanyu",
                    lastName="Liu"
                ),
                contactInformation=ContactInformation(
                    phoneNumber=PhoneNumber(
                        countryCode="+86",
                        number="158-7235-5355"
                    ),
                    email="emmaHanyuLiu@163.com"
                ),
                nationality="China"
            ),
            applicationDetails=ApplicationDetails(
                degreeType="master",
                intendedMajor="Business",
                targetCountry="United States",
                applicationYear="2025",
                applicationTerm="fall"
            ),
            educationBackground=EducationBackground(
                highestDegree="bachelor",
                currentInstitution=CurrentInstitution(
                    name="Mount Holyoke College",
                    type="overseas"
                ),
                major="Mathematics",
                gpa=Gpa(
                    average="3.8/4.0",
                    lastYear="3.41"
                ),
                minor=Minor(
                    hasMinor=None,
                    name="",
                    gpa="",
                    motivation=""
                ),
                onlineOrOtherCourses=OnlineOrOtherCourses(
                    hasTaken=True,
                    courseDetails="Columbia University as exchange student in Spring 2018"
                ),
                coursesTaken=[
                    {
                        "courseName": "Calculus I",
                        "courseCode": "MATH-101",
                        "institution": "Mount Holyoke College",
                        "term": "Fall Semester 2015",
                        "credits": "4.0",
                        "grade": "A",
                        "courseType": "Mathematics Core",
                        "courseDescription": ""
                    },
                    {
                        "courseName": "Introductory Economics",
                        "courseCode": "ECON-110",
                        "institution": "Mount Holyoke College",
                        "term": "Fall Semester 2015",
                        "credits": "4.0",
                        "grade": "A-",
                        "courseType": "Economics",
                        "courseDescription": ""
                    },
                    {
                        "courseName": "Intro Ideas/Applic Statistics",
                        "courseCode": "STAT-140",
                        "institution": "Mount Holyoke College",
                        "term": "Fall Semester 2015",
                        "credits": "4.0",
                        "grade": "A",
                        "courseType": "Statistics",
                        "courseDescription": ""
                    },
                    {
                        "courseName": "Calculus II",
                        "courseCode": "MATH-102",
                        "institution": "Mount Holyoke College",
                        "term": "Spring Semester 2016",
                        "credits": "4.0",
                        "grade": "B+",
                        "courseType": "Mathematics Core",
                        "courseDescription": ""
                    },
                    {
                        "courseName": "Symbolic Logic",
                        "courseCode": "PHIL-225",
                        "institution": "Mount Holyoke College",
                        "term": "Spring Semester 2016",
                        "credits": "4.0",
                        "grade": "A",
                        "courseType": "Philosophy",
                        "courseDescription": ""
                    },
                    {
                        "courseName": "Calculus III",
                        "courseCode": "MATH-203",
                        "institution": "Mount Holyoke College",
                        "term": "Fall Semester 2016",
                        "credits": "4.0",
                        "grade": "A",
                        "courseType": "Mathematics Core",
                        "courseDescription": ""
                    },
                    {
                        "courseName": "Discrete Mathematics",
                        "courseCode": "MATH-232",
                        "institution": "Mount Holyoke College",
                        "term": "Fall Semester 2016",
                        "credits": "4.0",
                        "grade": "A",
                        "courseType": "Mathematics",
                        "courseDescription": ""
                    },
                    {
                        "courseName": "Linear Algebra",
                        "courseCode": "MATH-211",
                        "institution": "Mount Holyoke College",
                        "term": "Spring Semester 2017",
                        "credits": "4.0",
                        "grade": "B+",
                        "courseType": "Mathematics",
                        "courseDescription": ""
                    },
                    {
                        "courseName": "Differential Equations",
                        "courseCode": "MATH-333",
                        "institution": "Mount Holyoke College",
                        "term": "Spring Semester 2017",
                        "credits": "4.0",
                        "grade": "A",
                        "courseType": "Mathematics",
                        "courseDescription": ""
                    },
                    {
                        "courseName": "Game Theory",
                        "courseCode": "ECON-251",
                        "institution": "Mount Holyoke College",
                        "term": "Fall Semester 2017",
                        "credits": "4.0",
                        "grade": "CR",
                        "courseType": "Economics",
                        "courseDescription": ""
                    },
                    {
                        "courseName": "Abstract Algebra",
                        "courseCode": "MATH-311",
                        "institution": "Mount Holyoke College",
                        "term": "Fall Semester 2017",
                        "credits": "4.0",
                        "grade": "A-",
                        "courseType": "Mathematics",
                        "courseDescription": ""
                    },
                    {
                        "courseName": "Probability",
                        "courseCode": "MATH-342",
                        "institution": "Mount Holyoke College",
                        "term": "Fall Semester 2017",
                        "credits": "4.0",
                        "grade": "A",
                        "courseType": "Mathematics",
                        "courseDescription": ""
                    },
                    {
                        "courseName": "Real Analysis",
                        "courseCode": "MATH-301",
                        "institution": "Mount Holyoke College",
                        "term": "Fall Semester 2018",
                        "credits": "4.0",
                        "grade": "A",
                        "courseType": "Mathematics",
                        "courseDescription": ""
                    },
                    {
                        "courseName": "Stochastic Processes",
                        "courseCode": "MATH-339SP",
                        "institution": "Mount Holyoke College",
                        "term": "Spring Semester 2019",
                        "credits": "4.0",
                        "grade": "B+",
                        "courseType": "Mathematics",
                        "courseDescription": ""
                    },
                    {
                        "courseName": "INTRO-COMPUT SCI/PROG IN JAVA",
                        "courseCode": "COMS W 1004",
                        "institution": "Columbia University",
                        "term": "Spring 2018",
                        "credits": "3.00",
                        "grade": "C+",
                        "courseType": "Computer Science",
                        "courseDescription": ""
                    },
                    {
                        "courseName": "MATH METHODS FOR ECONOMICS",
                        "courseCode": "ECON BC 1007",
                        "institution": "Columbia University",
                        "term": "Spring 2018",
                        "credits": "4.00",
                        "grade": "B",
                        "courseType": "Economics",
                        "courseDescription": ""
                    },
                    {
                        "courseName": "ANALYSIS AND OPTIMIZATION",
                        "courseCode": "MATH UN 2500",
                        "institution": "Columbia University",
                        "term": "Spring 2018",
                        "credits": "3.00",
                        "grade": "B+",
                        "courseType": "Mathematics",
                        "courseDescription": ""
                    },
                    {
                        "courseName": "NUMBER THEORY AND CRYPTOGRAPHY",
                        "courseCode": "MATH UN 3020",
                        "institution": "Columbia University",
                        "term": "Spring 2018",
                        "credits": "3.00",
                        "grade": "C+",
                        "courseType": "Mathematics",
                        "courseDescription": ""
                    }
                ]
            ),
            languageProficiency=[
                LanguageProficiencyItem(
                    test=Test(
                        type="雅思",
                        testDate="19/NOV/2023",
                        scores=Scores(
                            total="7.5",
                            reading="7.5",
                            listening="8.5",
                            speaking="7.0",
                            writing="6.5"
                        )
                    )
                )
            ],
            careerDevelopment=CareerDevelopment(
                careerPath="",
                futureCareerPlan="",
                graduateStudyPlan="",
                hasWorkExperience=True
            ),
            practicalExperience=[
                PracticalExperienceItem(
                    type="other",
                    organization="GRUNDFOS Pumps",
                    role="Channel Development Consultant for the China Academy & CEO Assistant",
                    period=Period(
                        startDate="August 2021",
                        endDate="Present"
                    ),
                    location="Shanghai, China",
                    description="Successfully created a training platform for authorized dealers and agents; Managed content and structure of training; Developed data management system; Supervised data migration; Assisted president with daily work.",
                    achievements="",
                    references=References(
                        name="",
                        position="",
                        contact=""
                    )
                ),
                PracticalExperienceItem(
                    type="other",
                    organization="GRUNDFOS Pumps",
                    role="Global Management Trainee",
                    period=Period(
                        startDate="August 2019",
                        endDate="August 2021"
                    ),
                    location="Shanghai, China",
                    description="Completed Shopfloor Physical Flow Optimization project with 15% elevation of internal flow efficiency; Provided supplier coordination; Accelerated revenue growth of key accounts from under 10% to 30%; Organized annual dealer reviews; Assisted in major marketing events.",
                    achievements="",
                    references=References(
                        name="",
                        position="",
                        contact=""
                    )
                ),
                PracticalExperienceItem(
                    type="other",
                    organization="ShangCeng Advertising Media Co., Ltd",
                    role="Editorial Intern",
                    period=Period(
                        startDate="May 2017",
                        endDate="July 2017"
                    ),
                    location="Wuhan, China",
                    description="Designed and created content for the company's social media posts; Conducted data analysis on post views and subscribers' portraits.",
                    achievements="",
                    references=References(
                        name="",
                        position="",
                        contact=""
                    )
                ),
                PracticalExperienceItem(
                    type="other",
                    organization="Mount Holyoke College",
                    role="Teaching Assistant",
                    period=Period(
                        startDate="January 2016",
                        endDate="December 2017"
                    ),
                    location="Massachusetts, US",
                    description="Led course review and provided instructions for Chinese courses; Assisted Professor with grading for exams and assignments; Hosted office hours and provided academic support.",
                    achievements="",
                    references=References(
                        name="",
                        position="",
                        contact=""
                    )
                )
            ],
            financialAid=FinancialAid(
                applyingForScholarship=False,
                scholarshipType="",
                financialNeed="",
                otherScholarships="Magna Cum Laude (Honored Graduate for GPA 3.8+ & Top 10%)",
                financialStatement=""
            ),
            recommendations=[
                Recommendation(
                    recommenderName="Shiling Song",
                    recommenderTitle="Operation Director",
                    recommenderInstitution="GRUNDFOS Pumps",
                    recommenderEmail="ssong@grundfos.com",
                    recommenderPhone="",
                    relationshipToApplicant="Professional mentor",
                    recommendationStatus="Completed",
                    recommendationDetails="Highlights Emma's analytical talents, problem-solving skills, innovative strategies, interpersonal and leadership skills, and collaboration capacity. Mentions specific achievements in supply chain optimization and use of DMAIC methodology with LEAN production principles."
                )
            ],
            personalStatements=PersonalStatements(
                personalStatement="",
                statementOfPurpose="",
                researchProposal="",
                diversityStatement="",
                additionalInformation=""
            ),
            studyAbroadPreparation=StudyAbroadPreparation(
                internationalDegree=InternationalDegree(
                    desiredInstitution="",
                    desiredProgram="",
                    campusPreferences=[]
                ),
                livingExpenses=LivingExpenses(
                    budget="",
                    hasFamilySupport=False
                ),
                additionalNeeds="",
                lifestylePreferences=LifestylePreferences(
                    preferredCityType=[],
                    preferredEnvironment=[],
                    preferredGeography=[],
                    preferredLifestyle=[],
                    otherLifestylePreferences=""
                )
            ),
            personalityProfile=PersonalityProfile(
                mbtiType="",
                strengths="Dedicated and self-motivated; Excellent leadership with strong communication skills; Multilingual; Experienced in data analysis and market research",
                interests="Social media content creator with vlog shooting; Freediving (Certified SSI mermaid instructor); Music: flute (Level 10, China Conservatory of Music), piano skills (basic)"
            ),
            additionalInformation=AdditionalInformation(
                consentConfirmations=[
                    ConsentConfirmation(
                        statement="联天留学/爱趣选大本上位，信息文本位信息文本位信息文本位信息文本位信息文本位信息文本位信息文本位信息文本位信息文本位信息文本位，",
                        agreed=False
                    ),
                    ConsentConfirmation(
                        statement="联天留学/爱趣选大本上位，信息文本位信息文本位信息文本位，",
                        agreed=False
                    ),
                    ConsentConfirmation(
                        statement="联天留学/爱趣选大本上位，信息文本位信息文本位信息文本位信息文本位信息文，文本位信息文本位信息文本位信息文本位信息文本位信息文本位信息文本位信息文本位信息文本位信息文本位，",
                        agreed=False
                    )
                ],
                otherSupplements="Languages: Chinese (Native), English (Fluent), Japanese and Cantonese (Elementary)"
            )
        )
        
        # Save to database
        saved_profile = hanyu_profile.save()
        
        if saved_profile:
            print("✅ Successfully created Hanyu Liu's comprehensive student profile!")
            
            print("\n" + "="*60)
            print("📋 PROFILE SUMMARY")
            print("="*60)
            print(f"👤 Name: {saved_profile.basicInformation.name.firstName} {saved_profile.basicInformation.name.lastName}")
            print(f"📧 Email: {saved_profile.basicInformation.contactInformation.email}")
            print(f"📱 Phone: {saved_profile.basicInformation.contactInformation.phoneNumber.countryCode} {saved_profile.basicInformation.contactInformation.phoneNumber.number}")
            print(f"🌍 Nationality: {saved_profile.basicInformation.nationality}")
            print()
            print(f"🎓 Application Details:")
            print(f"   • Degree Type: {saved_profile.applicationDetails.degreeType}")
            print(f"   • Intended Major: {saved_profile.applicationDetails.intendedMajor}")
            print(f"   • Target Country: {saved_profile.applicationDetails.targetCountry}")
            print(f"   • Application Year: {saved_profile.applicationDetails.applicationYear}")
            print(f"   • Application Term: {saved_profile.applicationDetails.applicationTerm}")
            print()
            print(f"📚 Education:")
            print(f"   • Current Institution: {saved_profile.educationBackground.currentInstitution.name}")
            print(f"   • Major: {saved_profile.educationBackground.major}")
            print(f"   • GPA: {saved_profile.educationBackground.gpa.average}")
            print(f"   • Courses Completed: {len(saved_profile.educationBackground.coursesTaken)} courses")
            print()
            print(f"🗣️ Language Proficiency:")
            if saved_profile.languageProficiency:
                test = saved_profile.languageProficiency[0].test
                print(f"   • Test: {test.type}")
                print(f"   • Date: {test.testDate}")
                print(f"   • Overall Score: {test.scores.total}")
                print(f"   • Reading: {test.scores.reading}, Listening: {test.scores.listening}")
                print(f"   • Speaking: {test.scores.speaking}, Writing: {test.scores.writing}")
            print()
            print(f"💼 Work Experience: {len(saved_profile.practicalExperience)} positions")
            for i, exp in enumerate(saved_profile.practicalExperience, 1):
                print(f"   {i}. {exp.role} at {exp.organization}")
                print(f"      📍 {exp.location} ({exp.period.startDate} - {exp.period.endDate})")
            print()
            print(f"🏆 Awards: {saved_profile.financialAid.otherScholarships}")
            print(f"💪 Strengths: {saved_profile.personalityProfile.strengths}")
            print(f"🎯 Interests: {saved_profile.personalityProfile.interests}")
            print()
            print(f"🆔 User ID: {saved_profile.user_id}")
            print(f"🗄️ Database ID: {saved_profile.id}")
            
            return saved_profile
        else:
            print("❌ Failed to save profile to database")
            return None
            
    except Exception as e:
        print(f"❌ Error creating profile: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    profile = create_hanyu_profile_properly()
    if profile:
        print("\n🎉 Hanyu Liu's profile has been successfully created and saved to the database!")
    else:
        print("\n❌ Failed to create Hanyu Liu's profile") 