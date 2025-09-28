
# Define the JSON template separately
SCORE_TEMPLATE = '''{
    "Name": null,
    "Current School": null,
    "GPA": null,
    "Major": null,
    "Minor": null,
    "Courses_taken_and_scores": [
      {
        "Course_name": null,
        "Course_score": null
      }
    ],
    "Test_Scores": {
      "SAT": {
        "Overall": null,
      "Math": null,
      "Reading": null,
      "Writing": null
    },
    "ACT": {
      "Overall": null,
      "English": null,
      "Math": null,
      "Reading": null,
      "Science": null
    },
    "TOEFL": {
      "Overall": null,
      "Reading": null,
      "Listening": null,
      "Speaking": null,
      "Writing": null
    },
    "IELTS": {
      "Overall": null,
      "Listening": null,
      "Reading": null,
      "Writing": null,
      "Speaking": null
    },
    "GRE": {
      "Overall": null,
      "Verbal": null,
      "Quantitative": null,
      "Writing": null
    },
    "GMAT": {
      "Overall": null,
      "Quant": null,
      "Verbal": null,
      "AWA": null,
      "IR": null
    }
  }
}'''

SCORE_EXTRACT_PROMPT = f"""
    You are an expert academic data analyst specializing in standardized test score extraction. Your task is to carefully extract ALL test scores from the provided text.

    INSTRUCTIONS:
    1. Thoroughly scan the ENTIRE text for any mention of standardized test scores.
    2. Look for both explicit mentions (e.g., "TOEFL: 105") and implicit references (e.g., "scored 165 on the GRE Quantitative section").
    3. For each score found, determine which specific test and section it belongs to.
    4. If scores are mentioned multiple times with different values, report the most recent or highest score.
    5. If a score range is given, report the average (e.g., "GRE 315-320" would be recorded as 317.5).
    6. Extract the name of the student from the text.
    7. Extract the current school of the student from the text.
    8. Extract the GPA of the student from the text.
    9. Extract the major of the student from the text.
    10. Extract the minor of the student from the text.
    11. Return ONLY the exact JSON structure below with your findings, adding no additional text.

    OUTPUT FORMAT (JSON):
    {SCORE_TEMPLATE}

    Replace "null" with the actual score when found. If a score is not mentioned, leave it as null.
    Do not make assumptions about missing scores or calculate totals unless explicitly stated in the text.
"""

PROGRAM_INTEREST_JSON_TEMPLATE = ''' 
    {
      "primary_major_interests": [
        {
          "field": "Major name",
          "evidence": ["Specific quote or detail from document", "Another piece of evidence"],
          "confidence": "High/Medium/Low",
          "related_specializations": ["Specialization 1", "Specialization 2"]
        }
      ],
      "secondary_interests": [
        {
          "field": "Secondary major/minor interest",
          "evidence": ["Supporting evidence"],
          "confidence": "High/Medium/Low"
        }
      ],
      "interdisciplinary_connections": "Analysis of how the student's interests cross traditional disciplinary boundaries",
      "summary": "1-2 sentence clear conclusion about the student's academic focus and trajectory"
    }'''


PROGRAM_INTEREST_EXTRACT_PROMPT = f"""
    You are an expert academic advisor specializing in identifying student academic interests and career aspirations. Your task is to thoroughly analyze all available student information to determine their target major(s) with supporting evidence.

    INSTRUCTIONS:
    1. Carefully examine ALL provided documents (personal statements, resumes, transcripts, recommendation letters, etc.)
    2. Pay particular attention to:
       - Explicit statements about intended majors or programs
       - Past coursework and academic achievements in specific subjects
       - Research experiences and topics
       - Internships, work experience, and project focus areas
       - Stated career goals and aspirations
       - Technical skills and tools mentioned (programming languages, lab techniques, etc.)
       - Extracurricular activities with academic relevance

    3. Identify both primary field(s) of interest AND any interdisciplinary connections
    4. For each potential major interest, provide specific evidence from the documents
    5. Assess confidence level for each identified major interest based on evidence strength
    6. Consider both broader areas (e.g., "Computer Science") and specific specializations (e.g., "Machine Learning")

    OUTPUT FORMAT (JSON):
    {PROGRAM_INTEREST_JSON_TEMPLATE}

    Be thorough in your analysis but avoid overinterpretation where evidence is limited. If the student mentions considering multiple majors, include all with appropriate confidence levels.
    """

STUDENT_INIT_INFO_JSON_TEMPLATE = '''
{
  "basicInformation": {  // 基础信息
    "name": {  // 你的姓名
      "firstName": "",  // 名
      "lastName": ""    // 姓
    },
    "contactInformation": {  // 你的联系方式
      "phoneNumber": {  // 电话号码
        "countryCode": "+86",  // 国家代码
        "number": ""    // 电话号码
      },
      "email": ""      // 邮箱
    },
    "nationality": ""  // 你的国籍
  },
  "applicationDetails": {  // 申请意向
    "degreeType": "",  // 想要读取的学位类型: "associate", "bachelor", "master", "PhD"
    "intendedMajor": "",  // 意向学术领域专业方向
    "targetCountry": "", // 意向留学国家："usa", "uk", "canada", "hong kong", "other"
    "applicationYear": "",  // 意向入学年份: "2025", "2026", "2027"
    "applicationTerm": ""   // 意向入学时间: "fall", "winter", "spring", "summer"
  },
  "educationBackground": {  // 高等教育经历
    "highestDegree": "",  // 请选择你最高等教育经历: "associate", "bachelor", "master", "PhD"
    "currentInstitution": {  // 请选择目前就读高等教育院校/毕业院校
      "name": "",  // 院校名称
      "type": ""   // 院校类型: "overseas"(海外院校), "dual"(双一流), "211" (同类型211), "985" (同类型985), "normal" (普通大学)
    },
    "major": "",  // 主修专业
    "gpa": {
      "average": "",  // 平均成绩/GPA: 比如3.7/4.0或90/100
      "lastYear": ""  // 最后两年GPA: 比如3.7/4.0或90/100
    }, 
    "minor": {
      "hasMinor": false, // 是否有二专业/辅修: "有", "没有"
      "name": "", // 二专业/辅修名
      "gpa":"", // 二专业/辅修名 GPA
      "motivation": "" // 为何辅修/或选择第二专业？
    },
    "onlineOrOtherCourses": {  // 如果选择上过其他学校/网络上过课程
      "hasTaken": false,  // 是否在其他学校/网络上过课程: "上过", "没上过"
      "courseDetails": ""  // 请注明项目名称，课程名称和成绩
    },
    "coursesTaken": [  // 已修课程 (可添加多门) 包括 现在就读学校的课程 和 其他学校的课程
      {
        "courseName": "",  // 课程名称
        "courseCode": "",  // 课程编号
        "institution": "",  // 所属院校
        "term": "",  // 学期 (例: "2023秋季", "2024春季")
        "credits": "",  // 学分
        "grade": "",  // 成绩 (例: "A", "B+", "90", "85")
        "courseType": "",  // 课程类型 (例: "核心课程", "选修课程", "专业课", "通识课")
        "courseDescription": "",  // 课程描述
      }
    ]
  },
  "additionalEducationBackground": [
    {
      "degree": "",  // 请选教育经历: "associate", "bachelor", "master", "PhD"
      "institution": {  // 高等教育院校/毕业院校
        "name": "",  // 院校名称
        "type": ""   // 院校类型: "overseas"(海外院校), "dual"(双一流), "211" (同类型211), "985" (同类型985), "normal" (普通大学)
      },
      "major": "",  // 主修专业
      "gpa": {
        "average": "",  // 平均成绩/GPA: 比如3.7/4.0或90/100
        "lastYear": ""  // 最后两年GPA: 比如3.7/4.0或90/100
      }, 
      "minor": {
        "hasMinor": false, // 是否有二专业/辅修: "有", "没有"
        "name": "", // 二专业/辅修名
        "gpa":"", // 二专业/辅修名 GPA
        "motivation": "" // 为何辅修/或选择第二专业？
      },
      "onlineOrOtherCourses": {  // 如果选择上过其他学校/网络上过课程
        "hasTaken": false,  // 是否在其他学校/网络上过课程: "上过", "没上过"
        "courseDetails": ""  // 请注明项目名称，课程名称和成绩
      },
      "coursesTaken": [  // 已修课程 (可添加多门) 包括 现在就读学校的课程 和 其他学校的课程
        {
          "courseName": "",  // 课程名称
          "courseCode": "",  // 课程编号
          "institution": "",  // 所属院校
          "term": "",  // 学期 (例: "2023秋季", "2024春季")
          "credits": "",  // 学分
          "grade": "",  // 成绩 (例: "A", "B+", "90", "85")
          "courseType": "",  // 课程类型 (例: "核心课程", "选修课程", "专业课", "通识课")
          "courseDescription": "",  // 课程描述
        }
      ]
    }
  ],
  "languageProficiencyExemption": "",
  "languageProficiency": [  // 语言能力及成绩 (可添加多种语言)
    {
      "test": {  // 语言考试信息
        "type": "",  // 考试类型: 英语可选择"托福", "雅思", "PTE", "多邻国", "其他"
        "testDate": "",  // 考试日期
        "scores": {  // 考试成绩
          "total": "",  // 总分
          "reading": "",  // 阅读
          "listening": "",  // 听力
          "speaking": "",  // 口语
          "writing": ""  // 写作
        }
      }
    }
  ],
  "standardizedTests": [  // 标准化考试成绩 (可能有多个)
    {
      "type": "",  // 考试类型: "GRE", "GMAT", "LSAT", "MCAT", "GRE Subject", "其他"
      "testDate": "",  // 考试日期
      "scores": {
        // 不同考试有不同的分数部分，根据考试类型动态变化
        // 例如 GRE:
        "verbal": "",  // 文字推理
        "quantitative": "",  // 数学推理
        "analytical": ""  // 分析性写作
      }
    }
  ],
  "careerDevelopment": {  // 发展与职业规划
    "careerPath": "",  // 请选择意向授课类型: "course based master“ 授课硕士, "thesis based master“ 研究型硕士, 
    "futureCareerPlan": "",  // 未来专业发展/职业目标 (选填)
    "graduateStudyPlan": "",  // 研究生规划和目标 (选填)
    "hasWorkExperience": false  // 是否打算以后在国外工作: "是", "否"
  },
  "practicalExperience": [  // 综合实践经历 (可添加多项)
    {
      "type": "",  // 实践类型: "实习", "工作", "竞赛", "科研", "社团活动", "志愿/公益活动", "其他"
      "organization": "",  // 组织/公司名称
      "role": "",  // 职位/角色
      "period": {  // 时间段
        "startDate": "",  // 开始日期
        "endDate": ""    // 结束日期
      },
      "location": "",  // 地点
      "description": "",  // 实践内容描述
    }
  ],
  "financialAid": {  // 奖学金申请
    "applyingForScholarship": false,  // 是否申请奖学金
    "scholarshipType": "",  // 奖学金类型
    "financialNeed": "",  // 经济需求说明
    "otherScholarships": "",  // 其他已获得的奖学金
    "financialStatement": ""  // 个人财务状况说明
  },
  "recommendations": [  // 推荐信
    {
      "recommenderName": "",  // 推荐人姓名
      "recommenderTitle": "",  // 推荐人职位
      "recommenderInstitution": "",  // 推荐人所在机构
      "recommenderEmail": "",  // 推荐人邮箱
      "recommenderPhone": "",  // 推荐人电话
      "relationshipToApplicant": "",  // 与申请人关系
      "recommendationStatus": "",  // 推荐信状态
      "recommendationDetails":"", 
    }
  ],
  "personalStatements": {  // 个人陈述和文书
    "personalStatement": "",  // 个人陈述
    "statementOfPurpose": "",  // 目的陈述
    "researchProposal": "",  // 研究计划
    "diversityStatement": "",  // 多样性陈述
    "additionalInformation": ""  // 补充信息
  },
  "studyAbroadPreparation": {  // 留学/生活偏好
    "internationalDegree": {  // 留学偏好
      "desiredInstitution": "",  // 希望目标院校排名范围 (例：前100)
      "desiredProgram": "",  // 希望目标专业排名范围 (例：前50)
      "campusPreferences": [  // 希望考虑的校园资源/条件
        ""  // 例: "学术/研究资源", "公共学习空间", "运动/休闲设施", "投资", "无障碍设施", "中央/研究设施", "绿化环境", "食宿生活资源", "宿舍/住宿条件", "其他"
      ]
    },
    "livingExpenses": {  // 留学预算范围 (学费+生活费)
      "budget": "",  // 金额 (人民币/元)
      "hasFamilySupport": false  // 是否有特殊教育费用需求: "有", "没有"
    },
    "additionalNeeds": "",  // 其他对学校/专业的期待 (选填)
    "lifestylePreferences": {  // 生活偏好
      "preferredCityType": [  // 意向留学城市 (选填/多选)
        ""  // 例: "热门城市", "低费", "相对新兴", "靠于产业", "机遇", "有音乐"
      ],
      "preferredEnvironment": [  // 意向留学生活环境 (选填)
        ""  // 例: "大城市", "中小城市", "城镇郊区", "地铁", "乡村", "其他"
      ],
      "preferredGeography": [  // 意向自然环境/气候条件 (多选/选填)
        ""  // 例: "平原", "山区", "湖区", "东边", "湿润", "干燥"
      ],
      "preferredLifestyle": [  // 意向生活节奏/文化环境 (多选/选填)
        ""  // 例: "忙节奏", "平缓", "包容", "先锋", "激进", "安宁"
      ],
      "otherLifestylePreferences": ""  // 其他对留学生活的偏好 (选填)
    }
  },
  "personalityProfile": {  // 个人兴趣/偏好
    "mbtiType": "",  // 你的MBTI (选填)
    "strengths": "",  // 你的优势好习惯
    "interests": ""  // 你喜爱加入，或希望参加的课外活动/社团 (选填)
  },
  "additionalInformation": {  // 其他补充
    "consentConfirmations": [  // 信息确认
      {
        "statement": "",  // 确认声明内容
        "agreed": false   // 是否同意: "同意", "不同意"
      }
    ],
    "otherSupplements": ""  // 其他补充 (选填)
  }
}


'''

# Define the prompt template as a function instead of a direct f-string
def get_student_info_extract_prompt(student_info_json_template, text):
    return f"""
    INSTRUCTIONS:
    You are an expert academic data analyst tasked with extracting student information from application materials.
    Your goal is to identify and extract ALL relevant student details from the provided text.
    
    Follow these guidelines:
    1. Extract EVERY piece of information that fits into the JSON structure
    
    OUTPUT FORMAT (JSON):
    {student_info_json_template}
    
    Extract the student information from the following text, if there is additional information, please add it to the json:
    {text}
    """
