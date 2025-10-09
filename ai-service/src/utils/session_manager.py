"""
Simple Session Manager for User Profile Management
Global variable approach for storing user profile across agents
"""

from typing import Optional
from loguru import logger
from src.domain.students_pg import StudentDocument

# Simple session store using global variable
current_session = {"user_profile": None, "user_id": None}


def init_session(user_id: str) -> StudentDocument:
    """
    Initialize a session with user profile.

    Args:
        user_id: The user ID for the session

    Returns:
        StudentDocument instance for the session
    """
    logger.info(f"Initializing session for user: {user_id}")

    current_session["user_id"] = user_id
    current_session["user_profile"] = StudentDocument.create_session_profile(user_id)

    logger.info(f"Session initialized successfully for user: {user_id}")
    return current_session["user_profile"]


def get_current_profile() -> Optional[StudentDocument]:
    """
    Get the current session's student profile.

    Returns:
        StudentDocument instance or None if no session active
    """
    return current_session["user_profile"]


def get_current_user_id() -> Optional[str]:
    """
    Get the current session's user ID.

    Returns:
        User ID string or None if no session active
    """
    return current_session["user_id"]


def update_profile(**updates) -> bool:
    """
    Update the current profile with new data and save to database.

    Args:
        **updates: Dictionary of field updates

    Returns:
        True if successful, False otherwise
    """
    profile = get_current_profile()
    if not profile:
        logger.error("No active session found")
        return False

    try:
        profile.update_and_save(**updates)
        logger.info("Profile updated successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to update profile: {e}")
        return False


def update_basic_info(**basic_info_updates) -> bool:
    """
    Update basic information fields and save to database.

    Args:
        **basic_info_updates: Dictionary of basic info field updates

    Returns:
        True if successful, False otherwise
    """
    profile = get_current_profile()
    if not profile:
        logger.error("No active session found")
        return False

    try:
        # Update basic information fields
        for key, value in basic_info_updates.items():
            if hasattr(profile.basicInformation, key):
                setattr(profile.basicInformation, key, value)

        # Save to database
        from src.infrastructure.db.mongo import connection
        from src.settings import settings

        _database = connection.get_database(settings.DATABASE_NAME)
        collection = _database[profile.get_collection_name()]
        collection.replace_one({"user_id": profile.user_id}, profile.to_mongo())

        logger.info("Basic information updated successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to update basic information: {e}")
        return False


def clear_session() -> None:
    """Clear the current session."""
    logger.info("Clearing session")
    current_session["user_profile"] = None
    current_session["user_id"] = None


def is_session_active() -> bool:
    """
    Check if there's an active session.

    Returns:
        True if session is active, False otherwise
    """
    return current_session["user_profile"] is not None


# Convenience functions for common operations
def get_user_name() -> str:
    """Get the current user's full name."""
    profile = get_current_profile()
    if profile and profile.basicInformation.name:
        first_name = profile.basicInformation.name.firstName
        last_name = profile.basicInformation.name.lastName
        return f"{first_name} {last_name}".strip()
    return "Unknown User"


def get_user_email() -> str:
    """Get the current user's email."""
    profile = get_current_profile()
    if profile and profile.basicInformation.contactInformation:
        return profile.basicInformation.contactInformation.email
    return ""


def get_application_details() -> dict:
    """Get the current user's application details as a dictionary."""
    profile = get_current_profile()
    if profile and profile.applicationDetails:
        return profile.applicationDetails.model_dump()
    return {}
