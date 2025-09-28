STUDENT_INFO_TEMPLATE_JSON = '''{
  "user_id": "",
  "scoreInformation": {
    "Name": "",
    "Current School": "",
    "GPA": "",
    "Major": "",
    "Minor": "",
    "Courses_taken_and_scores": [
      {
        "Course_name": "",
        "Course_score": ""
      }
    ],
    "Test_Scores": {
      "SAT": { "Overall": "", "Math": "", "Reading": "", "Writing": "" },
      "ACT": { "Overall": "", "English": "", "Math": "", "Reading": "", "Science": "" },
      "TOEFL": { "Overall": "", "Reading": "", "Listening": "", "Speaking": "", "Writing": "" },
      "IELTS": { "Overall": "", "Listening": "", "Reading": "", "Writing": "", "Speaking": "" },
      "GRE": { "Overall": "", "Verbal": "", "Quantitative": "", "Writing": "" },
      "GMAT": { "Overall": "", "Quant": "", "Verbal": "", "AWA": "", "IR": "" }
    }
  },
  "programInterest": {
    "primary_major_interests": [
      {
        "field": "",
        "evidence": [],
        "confidence": "",
        "related_specializations": []
      }
    ],
    "secondary_interests": [
      {
        "field": "",
        "evidence": [],
        "confidence": ""
      }
    ],
    "interdisciplinary_connections": "",
    "summary": ""
  },
  "studentInfo": {
    "basicInformation": {
      "name": { "firstName": "", "lastName": "" },
      "contactInformation": {
        "phoneNumber": { "countryCode": "+86", "number": "" },
        "email": ""
      },
      "nationality": ""
    },
    "applicationDetails": {
      "degreeType": "",
      "intendedMajor": "",
      "targetCountry": "",
      "applicationYear": "",
      "applicationTerm": ""
    },
    "educationBackground": {
      "highestDegree": "",
      "currentInstitution": { "name": "", "type": "" },
      "major": "",
      "gpa": { "average": "", "lastYear": "" },
      "minor": {
        "hasMinor": "",
        "name": "",
        "gpa": "",
        "motivation": ""
      }
    },
    "careerDevelopment": {
      "careerPath": "",
      "futureCareerPlan": "",
      "graduateStudyPlan": "",
      "hasWorkExperience": ""
    },
    "practicalExperience": [
      {
        "type": "",
        "organization": "",
        "role": "",
        "period": { "startDate": "", "endDate": "" },
        "location": "",
        "description": ""
      }
    ],
    "financialAid": {
      "applyingForScholarship": "",
      "scholarshipType": "",
      "financialNeed": "",
      "otherScholarships": "",
      "financialStatement": ""
    },
    "recommendations": [
      {
        "recommenderName": "",
        "recommenderTitle": "",
        "recommenderInstitution": "",
        "recommenderEmail": "",
        "recommenderPhone": "",
        "relationshipToApplicant": "",
        "recommendationStatus": "",
        "recommendationDetails": ""
      }
    ],
    "personalStatements": {
      "personalStatement": "",
      "statementOfPurpose": "",
      "researchProposal": "",
      "diversityStatement": "",
      "additionalInformation": ""
    },
    "additionalNeeds": "",
    "lifestylePreferences": {
      "preferredCityType": [""],
      "preferredEnvironment": [""],
      "preferredGeography": [""],
      "preferredLifestyle": [""],
      "otherLifestylePreferences": ""
    }
  }
}'''


COMBINED_EXTRACTION_PROMPT = f"""
You are a helpful assistant.
You are an expert academic data analyst tasked with extracting structured student application information from unstructured documents such as resumes, statements, transcripts, or recommendation letters.

INSTRUCTIONS:
1. Carefully scan the ENTIRE provided text.
2. Extract the following information:
   - Score information (GPA, course scores, standardized tests like TOEFL, GRE, etc.)
   - Program and academic interests with confidence, evidence, and specialization
   - Comprehensive student profile: basic info, education background, career plans, practical experience, financial aid, recommendation, lifestyle preferences

GUIDELINES:
- Be accurate and conservative. Do not guess or fabricate.
- Extract all possible values. If a field is not mentioned, keep it empty but preserve structure.
- Extract numerical scores where applicable. If score ranges are given, average them.
- Do not output anything but the JSON.
- Use double quotes for all field values.

OUTPUT FORMAT (JSON):
Return valid JSON following this structure:
{STUDENT_INFO_TEMPLATE_JSON}
"""

STUDENT_INFO_SCHEMA = {
    "title": "Student Profile Schema",
    "type": "object",
    "properties": {
        "user_id": {"type": "string"},
        "scoreInformation": {
            "type": "object",
            "properties": {
                "Name": {"type": "string"},
                "Current School": {"type": "string"},
                "GPA": {"type": "string"},
                "Major": {"type": "string"},
                "Minor": {"type": "string"},
                "Courses_taken_and_scores": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "Course_name": {"type": "string"},
                            "Course_score": {"type": "string"}
                        }
                    }
                },
                "Test_Scores": {
                    "type": "object",
                    "properties": {
                        "SAT": {
                            "type": "object",
                            "properties": {
                                "Overall": {"type": "string"},
                                "Math": {"type": "string"},
                                "Reading": {"type": "string"},
                                "Writing": {"type": "string"}
                            }
                        },
                        "ACT": {
                            "type": "object",
                            "properties": {
                                "Overall": {"type": "string"},
                                "English": {"type": "string"},
                                "Math": {"type": "string"},
                                "Reading": {"type": "string"},
                                "Science": {"type": "string"}
                            }
                        },
                        "TOEFL": {
                            "type": "object",
                            "properties": {
                                "Overall": {"type": "string"},
                                "Reading": {"type": "string"},
                                "Listening": {"type": "string"},
                                "Speaking": {"type": "string"},
                                "Writing": {"type": "string"}
                            }
                        },
                        "IELTS": {
                            "type": "object",
                            "properties": {
                                "Overall": {"type": "string"},
                                "Listening": {"type": "string"},
                                "Reading": {"type": "string"},
                                "Writing": {"type": "string"},
                                "Speaking": {"type": "string"}
                            }
                        },
                        "GRE": {
                            "type": "object",
                            "properties": {
                                "Overall": {"type": "string"},
                                "Verbal": {"type": "string"},
                                "Quantitative": {"type": "string"},
                                "Writing": {"type": "string"}
                            }
                        },
                        "GMAT": {
                            "type": "object",
                            "properties": {
                                "Overall": {"type": "string"},
                                "Quant": {"type": "string"},
                                "Verbal": {"type": "string"},
                                "AWA": {"type": "string"},
                                "IR": {"type": "string"}
                            }
                        }
                    }
                }
            }
        },
        "programInterest": {
            "type": "object",
            "properties": {
                "primary_major_interests": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "field": {"type": "string"},
                            "evidence": {
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "confidence": {"type": "string"},
                            "related_specializations": {
                                "type": "array",
                                "items": {"type": "string"}
                            }
                        }
                    }
                },
                "secondary_interests": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "field": {"type": "string"},
                            "evidence": {
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "confidence": {"type": "string"}
                        }
                    }
                },
                "interdisciplinary_connections": {"type": "string"},
                "summary": {"type": "string"}
            }
        },
        "studentInfo": {
            "type": "object",
            "properties": {
                "basicInformation": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "object",
                            "properties": {
                                "firstName": {"type": "string"},
                                "lastName": {"type": "string"}
                            }
                        },
                        "contactInformation": {
                            "type": "object",
                            "properties": {
                                "phoneNumber": {
                                    "type": "object",
                                    "properties": {
                                        "countryCode": {"type": "string"},
                                        "number": {"type": "string"}
                                    }
                                },
                                "email": {"type": "string"}
                            }
                        },
                        "nationality": {"type": "string"}
                    }
                },
                "applicationDetails": {
                    "type": "object",
                    "properties": {
                        "degreeType": {"type": "string"},
                        "intendedMajor": {"type": "string"},
                        "targetCountry": {"type": "string"},
                        "applicationYear": {"type": "string"},
                        "applicationTerm": {"type": "string"}
                    }
                },
                "educationBackground": {
                    "type": "object",
                    "properties": {
                        "highestDegree": {"type": "string"},
                        "currentInstitution": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string"},
                                "type": {"type": "string"}
                            }
                        },
                        "major": {"type": "string"},
                        "gpa": {
                            "type": "object",
                            "properties": {
                                "average": {"type": "string"},
                                "lastYear": {"type": "string"}
                            }
                        },
                        "minor": {
                            "type": "object",
                            "properties": {
                                "hasMinor": {"type": "string"},
                                "name": {"type": "string"},
                                "gpa": {"type": "string"},
                                "motivation": {"type": "string"}
                            }
                        }
                    }
                },
                "careerDevelopment": {
                    "type": "object",
                    "properties": {
                        "careerPath": {"type": "string"},
                        "futureCareerPlan": {"type": "string"},
                        "graduateStudyPlan": {"type": "string"},
                        "hasWorkExperience": {"type": "string"}
                    }
                },
                "practicalExperience": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "type": {"type": "string"},
                            "organization": {"type": "string"},
                            "role": {"type": "string"},
                            "period": {
                                "type": "object",
                                "properties": {
                                    "startDate": {"type": "string"},
                                    "endDate": {"type": "string"}
                                }
                            },
                            "location": {"type": "string"},
                            "description": {"type": "string"}
                        }
                    }
                },
                "financialAid": {
                    "type": "object",
                    "properties": {
                        "applyingForScholarship": {"type": "string"},
                        "scholarshipType": {"type": "string"},
                        "financialNeed": {"type": "string"},
                        "otherScholarships": {"type": "string"},
                        "financialStatement": {"type": "string"}
                    }
                },
                "recommendations": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "recommenderName": {"type": "string"},
                            "recommenderTitle": {"type": "string"},
                            "recommenderInstitution": {"type": "string"},
                            "recommenderEmail": {"type": "string"},
                            "recommenderPhone": {"type": "string"},
                            "relationshipToApplicant": {"type": "string"},
                            "recommendationStatus": {"type": "string"},
                            "recommendationDetails": {"type": "string"}
                        }
                    }
                },
                "personalStatements": {
                    "type": "object",
                    "properties": {
                        "personalStatement": {"type": "string"},
                        "statementOfPurpose": {"type": "string"},
                        "researchProposal": {"type": "string"},
                        "diversityStatement": {"type": "string"},
                        "additionalInformation": {"type": "string"}
                    }
                },
                "additionalNeeds": {"type": "string"},
                "lifestylePreferences": {
                    "type": "object",
                    "properties": {
                        "preferredCityType": {
                            "type": "array",
                            "items": {"type": "string"}
                        },
                        "preferredEnvironment": {
                            "type": "array",
                            "items": {"type": "string"}
                        },
                        "preferredGeography": {
                            "type": "array",
                            "items": {"type": "string"}
                        },
                        "preferredLifestyle": {
                            "type": "array",
                            "items": {"type": "string"}
                        },
                        "otherLifestylePreferences": {"type": "string"}
                    }
                }
            }
        }
    },
    "required": ["scoreInformation", "programInterest", "studentInfo"]
}

text_prompt = """
You are a helpful assistant.
Your job is to extract structured student application data from unstructured text such as resumes, personal statements, or chat input.

Instructions:
1. Carefully analyze the input text.
2. Extract the following information categories:
   - Score information (GPA, course scores, test scores like GRE/TOEFL/etc.)
   - Program and academic interests (primary/secondary fields, confidence, evidence, specializations)
   - Student profile (basic info, education background, experience, financials, preferences)

Guidelines:
- Do NOT fabricate or guess any information not explicitly stated.
- Leave fields blank (as empty strings or empty arrays) if data is missing.
- Ensure numerical values are extracted wherever applicable.
- Be conservative and precise — your goal is accurate information mapping.
- Do NOT include explanations or commentary — only extract the data.

You must respond in **valid JSON** format that matches the provided schema.
"""
