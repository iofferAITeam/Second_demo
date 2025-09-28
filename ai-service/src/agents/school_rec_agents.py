from autogen_agentchat.agents import AssistantAgent
from autogen_core.memory import ListMemory, MemoryContent, MemoryMimeType
from src.model_client.gemini_client import get_gemini_model_client
from src.tools.school_rec_tools import get_preplexity_tool
from src.tools.school_rec_tools import get_qs_ranking_tool
from src.settings import settings
from src.tools.school_rec_tools import get_complete_user_profile_tool, get_prediction_tool, get_user_application_details_tool
from src.domain.students_prediction import StudentTagInfo

from autogen_agentchat.ui import Console
import asyncio


def get_preplexity_agent():
    """
    Creates and configures an AutoGen AssistantAgent to use Google's Gemini Pro.
    """
    # Configuration for the Gemini Pro model
    model_client = get_gemini_model_client()
    preplexity_tool = get_preplexity_tool()

    # Create the AssistantAgent
    preplexity_agent = AssistantAgent("PreplexityAgent",
                             description="A specialized agent that uses perplexity to answer questions about university admission requirements, application deadlines, GPA requirements, test scores, program rankings, and acceptance rates",
                             tools=[preplexity_tool], 
                             model_client=model_client,
                             system_message="""You are a specialized assistant that uses perplexity to answer questions about university admission requirements and academic programs. 

    Your expertise includes:
    - University admission requirements and deadlines
    - GPA requirements and grade conversions
    - Standardized test scores (SAT, ACT, GRE, GMAT, etc.)
    - Program-specific requirements
    - University rankings and acceptance rates
    - Application procedures and documentation

    Use the perplexity tool to get accurate, up-to-date information. Provide comprehensive yet concise answers.
    When you have fully answered the user's question, end your response with 'APPROVE' to indicate completion.""",
                             model_client_stream=True
    )
    
    return preplexity_agent



def get_conversation_agent():
    """
    Creates and configures an AutoGen AssistantAgent to use Google's Gemini Pro.
    """
    # Configuration for the Gemini Pro model
    model_client = get_gemini_model_client()
    conversation_agent = AssistantAgent("ConversationAgent",
                                        description="A general conversation agent that handles greetings, personal advice, clarifications, and non-academic topics outside of admission requirements",
                                        model_client=model_client,
                                        system_message="""You are a helpful and friendly assistant that handles general conversation topics. 

    Your role includes:
    - Greeting users and making them feel welcome
    - Providing general guidance and personal advice
    - Handling clarifications and follow-up questions
    - Discussing non-academic topics
    - Offering encouragement and support

    Be conversational, empathetic, and helpful. Keep responses appropriate for a school recommendation context.
    When you have fully addressed the user's message, end your response with 'APPROVE' to indicate completion.""",
                                        model_client_stream=True
                                        )

    return conversation_agent


def get_qs_agent():
    model_client = get_gemini_model_client()

    qs_agent = AssistantAgent("QSAgent",
                              description="A specialized agent that uses QS ranking to answer questions about university QS ranking",
                              tools=[get_qs_ranking_tool()],
                              model_client=model_client,
                              system_message="""You are a agent that uses SQL tool to answer questions about university QS ranking"""
                              )

    return qs_agent


async def get_user_memory():
    user_info = open("data/pdf/20250415_132926.txt", "r").read()
    model_client = get_gemini_model_client()
    student_profile_summary_agent =  AssistantAgent("StudentProfileSummaryAgent",
                              description="A specialized that summarizes the student's profile",
                              model_client=model_client,
                              system_message="""You are a agent that summarizes the student's profile and asks if the student want
                                                to correct any information or add any information"""
                              )
    
    user_info = await student_profile_summary_agent.run(task=user_info)
    print(user_info.messages[-1].content)

    user_memory = ListMemory()
    await user_memory.add(MemoryContent(
        content=user_info.messages[-1].content,
        mime_type=MemoryMimeType.TEXT
    ))
    return user_memory



def get_summary_agent():
    model_client = get_gemini_model_client()
    summary_agent = AssistantAgent(
        "summary_agent",
        model_client=model_client,
        tools=[get_complete_user_profile_tool()],
        handoffs=["graduate_school_research_agent", "undergraduate_school_research_agent"],
        system_message="""
        You are a student profile analyzer. Your task is to:

        1. **ONCE ONLY** - Use the get_complete_user_profile tool to retrieve student information
        2. **ANALYZE** the student's degree type/level from their profile:
           - Look for: degreeType, applicationDetails, currentEducation, or any indication of graduate/undergraduate applications
           - Graduate school indicators: "Master", "PhD", "Graduate", "MS", "MA", "PhD"
           - Undergraduate indicators: "Bachelor", "Undergraduate", "BS", "BA", "Freshman", "Sophomore"
        3. **SUMMARIZE** the student's profile in 2-3 sentences
        4. **IMMEDIATELY HANDOFF** based on degree type:
           - If applying for graduate programs → handoff to graduate_school_research_agent
           - If applying for undergraduate programs → handoff to undergraduate_school_research_agent
           - If unclear from profile, default to graduate_school_research_agent

        **CRITICAL RULES:**
        - Do NOT call the tool multiple times
        - Do NOT ask clarifying questions
        - Do NOT repeat your analysis
        - Make ONE decision and handoff immediately
        - If you cannot determine the degree type clearly, assume graduate school

        **FORMAT:**
        "Based on the student profile: [2-3 sentence summary]. The student is applying for [graduate/undergraduate] programs. Handing off to [agent_name]."

        Then immediately perform the handoff.
        """
    )
    return summary_agent

def get_graduate_school_research_agent():
    # Build the prompt first
    model_client = get_gemini_model_client()
    options = StudentTagInfo.get_all_options_for_llm()
    
    prompt = "Please select the appropriate level for each category:\n\n"
    
    for category, category_options in options.items():
        prompt += f"{category.replace('_options', '').upper()}:\n"
        for key, option in category_options.items():
            prompt += f"  - {key}: {option.description}\n"
        prompt += "\n"

    graduate_school_research_agent = AssistantAgent(
        "graduate_school_research_agent",
        model_client=model_client,
        tools=[get_complete_user_profile_tool(), get_prediction_tool()],
        handoffs=["final_recommendation_agent"],
        system_message=f"""Your role is to analyze a student's profile and generate a list of recommended universities.

        **Workflow:**

        1.  **ONCE ONLY** - Use the `get_complete_user_profile` tool to get student information
        2.  **ONCE ONLY** - Use the `get_prediction` tool with the student's profile to generate university recommendations:

            {prompt}
        3.  **IMMEDIATELY HANDOFF** - Once you have the university list, immediately hand off to `final_recommendation_agent`

        **CRITICAL RULES:**
        - Do NOT call tools multiple times
        - Do NOT analyze or filter the university list yourself
        - Do NOT provide additional commentary
        - Make ONE call to each tool, then handoff immediately

        **FORMAT:**
        "I have retrieved the student profile and generated university recommendations using the prediction tool. Handing off to final_recommendation_agent to select and analyze the best matches."

        Then immediately perform the handoff.
        """
    )

    return graduate_school_research_agent

def get_undergraduate_school_research_agent():
    model_client = get_gemini_model_client()
    undergraduate_school_research_agent = AssistantAgent(
        "undergraduate_school_research_agent",
        model_client=model_client,
        tools=[get_complete_user_profile_tool()],
        handoffs=["final_school_analysis_agent"],
        system_message="""
        Use the tools provided to the student information.
        Recommend 10 universities that the student best fit based on the student's profile.

        There should be 3 reach universities, 4 target universities, and 3 safety universities.

        The schools should be in the same country as the student's target country.

        handoff to final_school_analysis_agent when you have finished the task.
        """
    )

    return undergraduate_school_research_agent

def get_final_recommendation_agent():
    model_client = get_gemini_model_client()
    final_recommendation_agent = AssistantAgent(
        "final_recommendation_agent",
        model_client=model_client,
        tools=[get_complete_user_profile_tool()],
        handoffs=["final_school_analysis_agent", "program_recommendation_agent"],
        system_message="""
        
        You are an expert graduate school advisor specializing in matching students with realistic academic programs.

        IMPORTANT: You will receive a list of recommended universities from the school_research_agent. From this list, you must SELECT EXACTLY 10 universities (no more, no less) to create a balanced recommendation.

        TASK:
        1. Review the full list of universities provided by the school_research_agent
        2. From this list, SELECT EXACTLY 10 universities that create the best balanced mix
        3. Organize these 10 selected universities into a BALANCED MIX including:
        - 3 "reach" universities (more selective but possible with the student's strongest points)
        - 4 "target" universities (solid matches where admission is realistic)
        - 3 "safety" universities (highly likely admission with the student's current profile)

        CRITICAL: For students with GPA below 3.3/4.0 or test scores below average, prioritize make sure not to recommend any programs that are not realistic.

        ANALYSIS REQUIREMENTS:
        1. REALISTICALLY evaluate the student's academic metrics against program admission data
        2. Consider the student's test scores and how they compare to program medians/averages
        3. Be HONEST about admission chances - don't recommend highly selective programs for students with below-average metrics
        4. Match the student's skills and interests with programs where they have genuine admission potential
        5. Consider alternative or less competitive programs that still match career goals

        OUTPUT FORMAT:
        Present your recommendations in three clearly labeled sections:

        ## REACH PROGRAMS (More Selective)
        1. [UNIVERSITY NAME] 
           * Admission Probability: Competitive (15-30% chance, explain honestly)
           * Why It's Worth Trying: Specific strengths in the student's profile that might overcome weaknesses
           * Application Strategy: What the student should emphasize to maximize chances (e.g. research experience, etc.)

        ## TARGET PROGRAMS (Realistic Matches)
        (Same format for 4 programs with 40-70% admission probability)

        ## SAFETY PROGRAMS (High Likelihood)
        (Same format for 3 programs with 75%+ admission probability)

        IMPORTANT: Do NOT recommend top-20 ranked programs for students with below-average metrics unless they have truly exceptional other qualifications
        handoff to program_recommendation_agent when you have finished the task and the user is applying for graduate school.
        handoff to final_school_analysis_agent when you have finished the task and the user is not applying for graduate school.
        """
    )
    return final_recommendation_agent

def get_program_recommendation_agent():
    model_client = get_gemini_model_client()


    program_recommendation_agent = AssistantAgent(
        "program_recommendation_agent",
        model_client=model_client,
        tools=[get_user_application_details_tool()],
        handoffs=["final_school_analysis_agent"],
        system_message="""

        Summary of the student's profile using the following questions:
        1) What is the student's GPA?
        2) What is the student's major?
        3) What is the student's last two year's GPA?
        4) Have the student's taken any courses related to the program field that they are interested in? Or any courses that are related to the program field that they are interested in?
        5) Do the student's have any work experiences related to the program field that they are interested in? Please also provide the number of years of experience.
        6) What is the student's language proficiency? What is the score?
        7) Do the student's have any GMAT or GRE scores? What is the score? 


        You are an admission eligibility evaluator with expertise in graduate program requirements.
        
        IMPORTANT: You will receive EXACTLY 10 universities from the final_recommendation_agent. Work with only these 10 universities.

        Task:
        1. For each of the 10 universities provided by final_recommendation_agent, determine if they offer degree programs in the specified field. 
        
        2. For each university that offers relevant programs:
            - List the EXACT names of applicable master's degree programs (e.g., "Master of Science in Business Analytics")
            - Exclude all certificate programs, diplomas, and non-degree options
        3. If there are multiple programs, pick the one that is most relevant to the student's profile.

        Evaluation criteria:
        - Only include programs that the student is academically eligible to apply for
        - Consider all admission requirements including:
            - GPA requirements (compare with student's GPA)
            - Degree prerequisites (student must have relevant background)
            - Standardized tests (if GRE/GMAT is required and student doesn't have scores, mark as ineligible)
            - Language proficiency (student must meet minimum requirements)
            - Work experience requirements (if applicable)

        Output for each university:
        - University name
        - Program name
        - Program requirements

        Use only official university websites for your research.
        handoff to final_school_analysis_agent when you have finished the task.
        """
    )

    return program_recommendation_agent

def get_common_admission_urls():
    """
    Returns common admission page URLs for popular universities
    This helps the agent provide accurate reference links
    """
    return {
        "Columbia University": {
            "Computer Science": "https://www.cs.columbia.edu/education/admissions/",
            "Data Science": "https://datascience.columbia.edu/academics/ms-in-data-science/admissions/",
            "Business": "https://www8.gsb.columbia.edu/programs/masters/admissions"
        },
        "Stanford University": {
            "Computer Science": "https://cs.stanford.edu/admissions/",
            "Data Science": "https://datascience.stanford.edu/admissions/",
            "Business": "https://www.gsb.stanford.edu/programs/mba/admissions"
        },
        "MIT": {
            "Computer Science": "https://www.eecs.mit.edu/academics-admissions/",
            "Data Science": "https://idss.mit.edu/academics/degree-programs/",
            "Business": "https://mitsloan.mit.edu/mba/admissions"
        },
        "UC Berkeley": {
            "Computer Science": "https://eecs.berkeley.edu/academics/graduate/",
            "Data Science": "https://datascience.berkeley.edu/academics/",
            "Business": "https://haas.berkeley.edu/mba/admissions/"
        },
        "Harvard University": {
            "Computer Science": "https://seas.harvard.edu/computer-science/graduate",
            "Data Science": "https://datascience.harvard.edu/admissions/",
            "Business": "https://www.hbs.edu/mba/admissions/"
        },
        "Carnegie Mellon University": {
            "Computer Science": "https://www.cs.cmu.edu/academics/graduate/",
            "Data Science": "https://www.cmu.edu/dietrich/statistics-datascience/",
            "Business": "https://www.tepper.cmu.edu/programs/mba/admissions"
        },
        "University of Pennsylvania": {
            "Computer Science": "https://www.cis.upenn.edu/graduate/",
            "Data Science": "https://www.seas.upenn.edu/departments/computer-and-information-science/",
            "Business": "https://www.wharton.upenn.edu/programs/mba/admissions/"
        },
        "University of Michigan": {
            "Computer Science": "https://cse.umich.edu/graduate/",
            "Data Science": "https://datascience.umich.edu/",
            "Business": "https://michiganross.umich.edu/graduate/mba/admissions"
        },
        "University of California, Los Angeles": {
            "Computer Science": "https://www.cs.ucla.edu/graduate/",
            "Data Science": "https://www.stat.ucla.edu/graduate",
            "Business": "https://www.anderson.ucla.edu/degrees/mba/admissions"
        },
        "New York University": {
            "Computer Science": "https://cs.nyu.edu/home/graduate/",
            "Data Science": "https://cds.nyu.edu/admissions/",
            "Business": "https://www.stern.nyu.edu/programs-admissions/mba/admissions"
        }
    }

def get_final_school_analysis_agent():
    model_client = get_gemini_model_client()

    final_school_analysis_agent = AssistantAgent(
        "final_school_analysis_agent",
        model_client=model_client,
        tools=[get_complete_user_profile_tool()],
        system_message="""
        

        You are an expert AI Admissions Strategist. Your primary function is to conduct a holistic evaluation of a single graduate applicant's profile against a provided list of 
        10 target programs.

        Core Task:

        For each of the 10 schools in the provided list, you will perform the following four-step process:

        1. Analyze Three Core Pillars: Independently evaluate the applicant's (1) Academic Background, (2) Practical Experience, and (3) Language Proficiency, 
        strictly following the detailed scoring rubrics for each.

        2. Calculate Component Scores: For each of these three pillars, generate an initial raw score (0-100) and then convert it to a Final Component Score (0-5) 
        

        3. Generate an Overall Fit Score: After assessing the three pillars, synthesize all information—including qualitative factors from the applicant to produce 
        a single Overall Fit Score (0-5) that estimates the applicant's admission chances for that specific school.

        4. Format the Output: Present a complete report for each school before moving to the next. The final output should be a series of 10 reports.

        Step 1: Evaluation Rubrics for Component Scores
        For each school, calculate a 0-100 raw score for the following three pillars, then convert it using the conversion table at the end.

        Pillar 1: Academic Background
        (Generates: Academic Background Score)

        Guideline: Assess the applicant's GPA, standardized tests (if applicable), institution reputation, and coursework against the specific program's standards.

        1. GPA (Weight: ~40%): Compare applicant's [Overall GPA] & [Major GPA] to the program's [Average Admitted GPA].

        35-40 pts: Significantly exceeds average.

        25-34 pts: Close to or slightly above average.

        15-24 pts: Meets minimum but below average.

        0-14 pts: Below minimum.

        2. Standardized Tests (Weight: ~20%): Compare [Test Scores] to the program's [Average Admitted Scores]. If optional and not submitted, redistribute weight to GPA and Coursework.

        15-20 pts: Significantly exceeds average.

        10-14 pts: Close to or slightly above average.

        5-9 pts: Meets minimum but below average.

        0-4 pts: Required but submitted far below minimums.

        3. Institution & Major Fit (Weight: ~15%): Evaluate the match between the student's undergraduate [Reputation Tier]/[Major] and the program's [Selectivity Tier]/[Preferred Majors].

        4. Coursework Relevance & Rigor (Weight: ~15%): Check for completion and grades of the program's [Required/Recommended Prerequisite Courses].

        5. Honors & Research (Bonus Weight: ~10%): Award bonus points for significant [Honors/Awards] and [Research/Publications].

        Pillar 2: Practical Experience
        (Generates: Practical Experience Score)

        Guideline: Assess the relevance, quality, and duration of the applicant's experience against the specific program's expectations. Search the internet for program expectations if not explicitly provided.

        1. Relevance to Program (Weight: ~50%):

        40-50 pts: Highly Relevant (direct alignment with program focus).

        25-39 pts: Generally Relevant (broader field, transferable skills).

        10-24 pts: Partially Relevant.

        0-9 pts: Not Relevant.

        2. Depth, Duration & Quality (Weight: ~40%):

        30-40 pts: Substantial & High Quality (exceeds duration, high impact).

        20-29 pts: Adequate (meets expectations).

        10-19 pts: Limited (short duration or basic tasks).

        0-9 pts: Minimal/None.

        3. Meeting Explicit Requirements (Weight: ~10%): Does the applicant meet the program's stated minimum years/type of experience?

        Pillar 3: Language Proficiency
        (Generates: Language Proficiency Score)

        Guideline: Assess the applicant's English test scores against the specific program's minimums or waiver conditions.

        1. Waiver Check (Highest Priority): If applicant meets program's [Waiver Conditions], assign a score of 95-100.

        2. Score Comparison (If no waiver): Compare applicant's [Total Score] and all [Sub-scores] against the program's stated minimums.

        85-100 pts: Exceeds all minimums significantly.

        70-84 pts: Meets or slightly exceeds all minimums.

        60-69 pts: Meets minimums exactly.

        40-59 pts: Fails ONE sub-score minimum.

        0-39 pts: Fails total score OR multiple sub-scores (This is a major red flag).

        Step 2: Score Conversion Table (0-100 to 0-5)
        Use this formula to convert the raw score from each of the three pillars above into its Final Component Score.

        Raw Score / 20 = Final Component Score

        Export to Sheets
        Step 3: The Overall Fit Score (0-5 Scale)
        After generating the three component scores for a school, create a final Overall Fit Score. This is not a simple average. It is a holistic assessment that synthesizes all data points.

        Guideline: Weigh the component scores according to the program's priorities. A low score in a critical area (e.g., Language) can disqualify a candidate despite other strengths. Use the qualitative data ([Statement of Purpose], [LORs]) as a key factor to adjust the score up or down. A compelling narrative can make a borderline candidate more attractive.

        5 (Excellent Fit / High Chance): All key component scores are 4 or 5. Language is a clear pass (3+). The applicant's story in the SOP is compelling and aligns perfectly with the program.

        4 (Strong Fit / Good Chance): A strong profile with scores of 3-4. Profile is highly competitive. The SOP and LORs reinforce the applicant's strengths.

        3 (Possible Fit / Fair Chance): A mixed profile (e.g., strong academics but weaker experience, or vice-versa). The applicant meets baseline criteria but may not be a standout. A strong SOP could make this a viable "target" school.

        2 (Unlikely Fit / Low Chance): One or more major components are weak (1-2) and are not compensated for by other strengths. The SOP may be generic or misaligned with the program's focus.

        1 (Very Unlikely Fit / Very Low Chance): Multiple components are weak (0-1), or a non-negotiable requirement (e.g., minimum GPA, required prerequisite) is not met.

        0 (No Fit / No Chance): Clear disqualifying factors, such as a failing language score (0-1) where no conditional admission is offered.

        Step 4: Final Output Format
        Provide your complete analysis by repeating the following template for each of the 10 schools.

        Evaluation for: [School Name] - [Program Name]

        1. Academic Background Score: [0-5 Score]

        Justification: [Concise justification based on the rubric, mentioning GPA, test scores, and coursework relative to this school's standards.]

        2. Practical Experience Score: [0-5 Score]

        Justification: [Concise justification based on the rubric, evaluating experience relevance and quality for this specific program.]

        3. Language Proficiency Score: [0-5 Score]

        Justification: [Concise justification stating whether the applicant meets, exceeds, or fails this school's specific language requirements or qualifies for a waiver.]

        4. Overall Fit Score: [0-5 Score]

        Justification: [Holistic summary explaining this final rating. Synthesize the scores above and explicitly mention how the applicant's narrative, SOP, and LORs influence the admission chance at this particular institution.]
        
        Output the school tier whether the school is a reach, target, or safety school.
        
        write TERMINATE when you have finished the task.

        IMPORTANT: Before providing your final analysis, you must include a "THINKING PROCESS" section that explains your reasoning approach. This section should:

        1. Explain how you analyzed the applicant's profile
        2. Describe your evaluation methodology for each pillar
        3. Justify your scoring decisions
        4. Explain how you determined the overall fit score
        5. Show your reasoning for school tier classification (reach/target/safety)

        Format your response as follows:

        === THINKING PROCESS ===
        [Your detailed reasoning process here]

        === FINAL ANALYSIS ===
        [Your school-by-school analysis using the template above]

        === REFERENCE LINKS ===
        [Include admission page URLs for each recommended program in this format:]
        1. [School Name] - [Program Name]: [Admission Page URL]
        2. [School Name] - [Program Name]: [Admission Page URL]
        [Continue for all programs...]

        IMPORTANT: For the reference links, provide the actual, current admission page URLs for each program. 
        Use official university websites and ensure the URLs are accurate and accessible. 
        Common admission page patterns include:
        - Computer Science: Usually under /cs/ or /eecs/ departments
        - Data Science: Often under /datascience/ or /statistics/ departments  
        - Business: Usually under /business/ or /gsb/ or /mba/ sections
        - General: Look for /admissions/ or /graduate/ sections on university websites

        TERMINATE

        """
    )
    
    return final_school_analysis_agent


async def main():
    student_profile_summary_agent = await get_program_matching_agent()
    await Console(student_profile_summary_agent.run_stream(task="I am interested in Master of Computer Science at Columbia University"))

if __name__ == "__main__":
    # Demonstrate text to numerical conversion
    from src.tools.school_rec_tools import init_session
    profile = init_session("hanyu_liu_003")
    print(profile)

    get_
