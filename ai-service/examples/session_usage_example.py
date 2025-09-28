"""
Example usage of the Session Manager (Option B)
This shows how to integrate the simple session manager into your chat flow and agents
"""

import os
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_agentchat.ui import Console
from autogen_agentchat.messages import HandoffMessage

# Import your session manager
from src.utils.session_manager import (
    init_session, 
    get_current_profile, 
    update_profile, 
    update_basic_info,
    clear_session,
    is_session_active,
    get_user_name,
    get_user_email
)

# Example: Updated main chat flow using session manager
async def main_with_session_manager():
    """Main chat flow using the simple session manager"""
    
    # Get user ID
    user_id = input("Enter your user ID: ").strip()
    
    # Initialize session - this creates/loads the user profile once
    profile = init_session(user_id)
    print(f"✅ Session started for: {get_user_name()}")
    print(f"📧 Email: {get_user_email()}")
    
    # Set up your agents (your existing code)
    client = OpenAIChatCompletionClient(
        model="gpt-4o",
        api_key=os.getenv("OPENAI_API_KEY"),
    )
    
    # Your existing team setup...
    # team, user_proxy = create_swarm_team(client)
    
    print("\n📋 Welcome to the Student Profile System.")
    print("💬 Type your message. End with 'TERMINATE'.")
    
    # Conversation loop
    while True:
        user_input = input("Enter your response: ").strip()
        if "TERMINATE" in user_input.upper():
            break
        
        # Process with your agents - they can now access the profile
        await process_with_agents(user_input)
        
        # Show updated profile info
        current_profile = get_current_profile()
        print(f"Current user: {get_user_name()}")
    
    # Clear session when done
    clear_session()
    print("Session ended.")

# Example: Agent functions using the session manager
def student_info_agent(user_input: str) -> str:
    """Example agent that extracts and updates student information"""
    
    # Get current profile (shared across all agents)
    profile = get_current_profile()
    if not profile:
        return "No active session found"
    
    # Extract information from user input (your existing logic)
    extracted_info = extract_student_info_from_text(user_input)
    
    # Update the profile with new information
    if "name" in extracted_info:
        name_data = extracted_info["name"]
        update_basic_info(name=name_data)
        
    if "email" in extracted_info:
        email_data = extracted_info["email"]
        update_basic_info(contactInformation={"email": email_data})
    
    # Update other fields
    if "major" in extracted_info:
        update_profile(
            applicationDetails={
                "intendedMajor": extracted_info["major"]
            }
        )
    
    return f"Updated profile for {get_user_name()}"

def recommendation_agent(user_input: str) -> str:
    """Example agent that provides recommendations based on profile"""
    
    # Get current profile
    profile = get_current_profile()
    if not profile:
        return "No active session found"
    
    # Use profile data for recommendations
    major = profile.applicationDetails.intendedMajor
    country = profile.applicationDetails.targetCountry
    gpa = profile.educationBackground.gpa.average
    
    # Generate recommendations based on current profile
    recommendation = f"""
    Based on your profile:
    - Major: {major}
    - Target Country: {country}
    - GPA: {gpa}
    
    I recommend these universities...
    """
    
    return recommendation

def score_extraction_agent(user_input: str) -> str:
    """Example agent that extracts and updates test scores"""
    
    profile = get_current_profile()
    if not profile:
        return "No active session found"
    
    # Extract scores from user input
    extracted_scores = extract_test_scores_from_text(user_input)
    
    # Update standardized test scores
    if extracted_scores:
        current_tests = profile.standardizedTests or []
        current_tests.append(extracted_scores)
        
        update_profile(standardizedTests=current_tests)
        
        return f"Added test scores for {get_user_name()}"
    
    return "No test scores found in input"

def missing_info_agent(user_input: str) -> str:
    """Example agent that identifies missing information"""
    
    profile = get_current_profile()
    if not profile:
        return "No active session found"
    
    missing_fields = []
    
    # Check for missing basic information
    if not profile.basicInformation.name.firstName:
        missing_fields.append("first name")
    
    if not profile.basicInformation.contactInformation.email:
        missing_fields.append("email address")
    
    if not profile.applicationDetails.intendedMajor:
        missing_fields.append("intended major")
    
    if not profile.applicationDetails.targetCountry:
        missing_fields.append("target country")
    
    if missing_fields:
        return f"Please provide: {', '.join(missing_fields)}"
    else:
        return "Your profile looks complete!"

# Example: How to integrate with your existing agent processing
async def process_with_agents(user_input: str):
    """Process user input with multiple agents that share the same profile"""
    
    # All agents access the same profile via session manager
    info_result = student_info_agent(user_input)
    print(f"Info Agent: {info_result}")
    
    score_result = score_extraction_agent(user_input)
    print(f"Score Agent: {score_result}")
    
    missing_result = missing_info_agent(user_input)
    print(f"Missing Info: {missing_result}")
    
    recommendation_result = recommendation_agent(user_input)
    print(f"Recommendations: {recommendation_result}")

# Utility functions (you'll need to implement these based on your existing code)
def extract_student_info_from_text(text: str) -> dict:
    """Extract student information from text - implement based on your existing logic"""
    # Your existing extraction logic here
    return {}

def extract_test_scores_from_text(text: str) -> dict:
    """Extract test scores from text - implement based on your existing logic"""
    # Your existing extraction logic here
    return {}

# Example: Quick session operations
def quick_example():
    """Quick example of session operations"""
    
    # Start session
    profile = init_session("user_123")
    
    # Update some information
    update_basic_info(
        name={"firstName": "John", "lastName": "Doe"},
        contactInformation={"email": "john.doe@email.com"}
    )
    
    update_profile(
        applicationDetails={
            "degreeType": "Bachelor's",
            "intendedMajor": "Computer Science",
            "targetCountry": "USA"
        }
    )
    
    # Get current info
    print(f"User: {get_user_name()}")
    print(f"Email: {get_user_email()}")
    print(f"Session active: {is_session_active()}")
    
    # Clear session
    clear_session()

if __name__ == "__main__":
    # Run the quick example
    quick_example()
    
    # Or run the full chat example
    # import asyncio
    # asyncio.run(main_with_session_manager()) 