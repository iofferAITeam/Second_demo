from autogen_agentchat.conditions import TextMentionTermination, MaxMessageTermination
from src.agents.info_extraction_agent import extract_student_information_agent, get_missing_information_agent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.agents import UserProxyAgent

def create_student_info_team():

    extract_student_information_agent_instance = extract_student_information_agent()
    missing_information_agent_instance = get_missing_information_agent()

    termination = TextMentionTermination("TERMINATE") | MaxMessageTermination(max_messages=10)

    team = RoundRobinGroupChat([
                  extract_student_information_agent_instance,
                  missing_information_agent_instance], termination_condition=termination)


    return team