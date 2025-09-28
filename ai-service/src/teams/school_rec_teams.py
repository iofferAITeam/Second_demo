from autogen_agentchat.teams import Swarm
from autogen_agentchat.conditions import HandoffTermination, TextMentionTermination, MaxMessageTermination


from src.agents.school_rec_agents import (
get_graduate_school_research_agent,
get_undergraduate_school_research_agent,
get_final_recommendation_agent,
get_program_recommendation_agent,
get_final_school_analysis_agent,
get_summary_agent)
from autogen_agentchat.agents import AssistantAgent
from src.model_client.gemini_client import get_gemini_model_client
from src.settings import settings

def create_school_rec_team():
    summary_agent = get_summary_agent()
    graduate_school_research_agent = get_graduate_school_research_agent()
    undergraduate_school_research_agent = get_undergraduate_school_research_agent()
    final_recommendation_agent = get_final_recommendation_agent()
    program_recommendation_agent = get_program_recommendation_agent()
    final_school_analysis_agent = get_final_school_analysis_agent()

    # Use multiple termination conditions for safety
    termination = TextMentionTermination("TERMINATE") | MaxMessageTermination(max_messages=50)

    team = Swarm([summary_agent,
                  graduate_school_research_agent,
                  undergraduate_school_research_agent,
                  final_recommendation_agent,
                  program_recommendation_agent,
                  final_school_analysis_agent],
                  termination_condition=termination)

    return team

def create_simple_school_rec_agent():
    """Create a simple single agent for school recommendations without complex handoffs"""
    model_client = get_gemini_model_client()

    simple_agent = AssistantAgent(
        "school_recommendation_agent",
        model_client=model_client,
        system_message="""You are an expert university admissions consultant specializing in graduate school recommendations.

When a user asks for university recommendations, provide personalized advice based on their academic profile including:
- GPA and test scores (TOEFL, GRE, etc.)
- Academic major/field of study
- Target degree level (Master's, PhD, etc.)
- Academic background and experience

Provide comprehensive recommendations organized by:
1. **Reach Schools** (highly competitive, worth applying)
2. **Target Schools** (good match for their profile)
3. **Safety Schools** (likely acceptance)

Include specific university names, program details, and admission requirements.
Always end your response with "TERMINATE" to indicate completion.

Example format:
Based on your profile (GPA 3.8, TOEFL 110, Computer Science), here are my recommendations:

**REACH SCHOOLS:**
- Carnegie Mellon University (CMU) - Top CS program...
- Stanford University - Silicon Valley location...

**TARGET SCHOOLS:**
- University of Illinois Urbana-Champaign - Strong CS reputation...
- Georgia Tech - Excellent engineering programs...

**SAFETY SCHOOLS:**
- University of Southern California - Good CS program...

TERMINATE"""
    )

    return simple_agent