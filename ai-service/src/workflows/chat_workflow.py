import xgboost
from src.agents.orchestrating_agent import get_orchestrating_agent
from src.teams.student_info_team import create_student_info_team
from src.teams.school_rec_teams import create_school_rec_team
from src.teams.hybrid_qa_team import create_hybrid_qa_team
from src.utils.session_manager import init_session

from autogen_agentchat.agents import UserProxyAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.conditions import TextMentionTermination
from autogen_agentchat.ui import Console
from autogen_agentchat.messages import HandoffMessage
import asyncio


class ChatbotWorkflow:
    def __init__(self):
        self.teams = {}
        self.routing_agent = None
        self.user_proxy = None
        self._setup_agents_and_teams()

    def _setup_agents_and_teams(self):
        
        # routing agent to decide which team to route the task to
        self.routing_agent = get_orchestrating_agent()
        
        # user proxy to interact with the user
        self.user_proxy = UserProxyAgent("user_proxy", input_func=input)
        
        # teams
        self._create_teams()

    def _create_teams(self):
        self.teams["STUDENT_INFO"] = create_student_info_team()
        
        self.teams["SCHOOL_RECOMMENDATION"] = create_school_rec_team()
        
        self.teams["GENERAL_QA"] = create_hybrid_qa_team()
        

    def _is_goodbye_message(self, message: str) -> bool:
        """Check if user wants to end conversation"""
        goodbye_phrases = [
            "thank you", "thanks", "goodbye", "bye", "see you", 
            "that's all", "no more questions", "i'm done", "exit", "quit"
        ]
        return any(phrase in message.lower() for phrase in goodbye_phrases)
    
    def _should_end_conversation(self, agent_response: str) -> bool:
        """Check if agent thinks conversation should end"""
        end_indicators = [
            "is there anything else", "any other questions", "anything more", 
            "further assistance", "else i can help", "other concerns"
        ]
        return any(indicator in agent_response.lower() for indicator in end_indicators)
    
    def _extract_keywords(self, text: str) -> set:
        """Extract key topics/keywords from text"""
        import re
        # Remove common words and extract meaningful terms
        common_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'what', 'how', 'when', 'where', 'why'}
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        return set(word for word in words if word not in common_words)
    
    def _detect_manual_control(self, message: str) -> str:
        """Detect manual user control commands"""
        message_lower = message.lower().strip()
        
        # Manual routing commands
        if any(phrase in message_lower for phrase in ["new topic", "change topic", "different question", "something else"]):
            return "NEW_TOPIC"
        elif any(phrase in message_lower for phrase in ["continue", "same topic", "more about this", "keep going"]):
            return "CONTINUE_TOPIC"
        elif any(phrase in message_lower for phrase in ["now i want to ask about", "let me ask about", "switch to"]):
            return "NEW_TOPIC"
        else:
            return "AUTO_DETECT"
    
    def _is_topic_change(self, current_message: str, conversation_history: list, last_interaction_time: float = None) -> bool:
        """Detect if current message represents a topic change"""
        if not conversation_history:
            return True  # First message is always new topic
        
        current_lower = current_message.lower()
        last_entry = conversation_history[-1]
        
        # 1. Explicit topic change indicators
        topic_change_phrases = [
            "now i want to ask about", "let me ask about", "what about", 
            "can you tell me about", "i also want to know", "another question",
            "different topic", "change of topic", "moving on to", "next question"
        ]
        
        if any(phrase in current_lower for phrase in topic_change_phrases):
            # Check if it's truly different or just elaboration
            if any(word in current_lower for word in ["also", "more", "further", "additional", "elaborate"]):
                return False  # Elaboration, not topic change
            return True
        
        # 2. Keyword similarity check
        current_keywords = self._extract_keywords(current_message)
        previous_keywords = self._extract_keywords(last_entry['user_question'])
        
        # Calculate overlap
        if previous_keywords:
            overlap = len(current_keywords.intersection(previous_keywords)) / len(previous_keywords.union(current_keywords))
            if overlap > 0.3:  # 30% keyword overlap suggests same topic
                return False
        
        # 3. Time gap check (if provided)
        import time
        if last_interaction_time and (time.time() - last_interaction_time) > 300:  # 5 minutes
            return True
        
        # 4. Team-specific topic indicators
        # University/education keywords
        education_keywords = {'university', 'college', 'stanford', 'mit', 'harvard', 'admission', 'requirements', 'gpa', 'degree', 'program', 'major', 'course'}
        # Financial keywords  
        finance_keywords = {'loan', 'scholarship', 'financial', 'aid', 'money', 'cost', 'tuition', 'funding'}
        
        current_has_education = bool(current_keywords.intersection(education_keywords))
        previous_has_education = bool(self._extract_keywords(last_entry['user_question']).intersection(education_keywords))
        
        current_has_finance = bool(current_keywords.intersection(finance_keywords))
        previous_has_finance = bool(self._extract_keywords(last_entry['user_question']).intersection(finance_keywords))
        
        # If switching between major topic categories
        if (current_has_education != previous_has_education) or (current_has_finance != previous_has_finance):
            return True
        
        # Default: assume continuation if no clear change detected
        return False

    async def run(self, user_id: str): 
        # Initialize session
        profile = init_session(user_id)

        # Track conversation state
        interaction_count = 0
        successful_interactions = 0  # Track only successful interactions
        max_interactions = 10
        conversation_history = []
        current_active_team = None  # Track which team is currently active
        last_interaction_time = None
        
        # Initial greeting
        current_message = f"Hello, my name is {profile.basicInformation.name.firstName} {profile.basicInformation.name.lastName}"
        
        print(f"\n🤖 Starting smart hub-and-spoke conversation workflow (max {max_interactions} interactions)")
        print("💡 Pro tip: Say 'new topic' to switch teams, or 'continue' to stay with current team")
        
        # MAIN INTELLIGENT CONVERSATION LOOP
        while interaction_count < max_interactions:
            interaction_count += 1
            print(f"\n--- Attempt {interaction_count}/{max_interactions} (Successful: {successful_interactions}) ---")
            
            try:
                import time
                current_time = time.time()
                
                # 1. CHECK MANUAL CONTROL COMMANDS
                manual_control = self._detect_manual_control(current_message)
                print(f"🎮 Control mode: {manual_control}")
                
                team_response = None
                team_used = None
                should_route_to_orchestrator = True
                
                # 2. DETERMINE ROUTING STRATEGY
                
                # Teams that don't support direct communication (complex multi-agent swarms)
                complex_teams = ["STUDENT_INFO"]  # Add teams that have internal handoff issues
                
                if manual_control == "CONTINUE_TOPIC" and current_active_team:
                    if current_active_team in complex_teams:
                        print(f"🔄 {current_active_team} is a complex team, routing through orchestrator")
                        should_route_to_orchestrator = True
                    else:
                        # User explicitly wants to continue with current team
                        print(f"🔗 Continuing with {current_active_team} team (manual control)")
                        should_route_to_orchestrator = False
                    
                elif manual_control == "NEW_TOPIC":
                    # User explicitly wants new topic
                    print("🎯 Routing to orchestrator (manual new topic)")
                    current_active_team = None
                    should_route_to_orchestrator = True
                    
                elif manual_control == "AUTO_DETECT":
                    # Use smart detection
                    if current_active_team and not self._is_topic_change(current_message, conversation_history, last_interaction_time):
                        if current_active_team in complex_teams:
                            print(f"🧠 Auto-detected: Continue topic but {current_active_team} needs orchestrator")
                            should_route_to_orchestrator = True
                        else:
                            print(f"🧠 Auto-detected: Continue with {current_active_team} (same topic)")
                            should_route_to_orchestrator = False
                    else:
                        print("🧠 Auto-detected: Topic change, routing to orchestrator")
                        current_active_team = None
                        should_route_to_orchestrator = True
                
                # 3. HANDLE TEAM INTERACTION
                if not should_route_to_orchestrator and current_active_team:
                    # Continue with current team directly
                    print(f"📞 Direct communication with {current_active_team}")
                    task_result = await Console(self.teams[current_active_team].run_stream(task=current_message))
                    team_response = task_result.messages[-1].content
                    team_used = current_active_team
                    
                    # Clean up team response (remove TERMINATE)
                    if "TERMINATE" in team_response:
                        team_response = team_response.replace("TERMINATE", "").strip()
                    
                    print(f"✅ {current_active_team} response: {team_response[:100]}..." if len(team_response) > 100 else f"✅ {current_active_team} response: {team_response}")
                    
                else:
                    # Route through orchestrating agent
                    routing_team = RoundRobinGroupChat([self.routing_agent, self.user_proxy],
                        termination_condition=TextMentionTermination("TRANSFER_TO_")
                    )
                    
                    # Add conversation context for orchestrating agent
                    if conversation_history:
                        context_message = f"Previous conversation context: {conversation_history[-1] if conversation_history else 'First interaction'}\n\nUser: {current_message}"
                    else:
                        context_message = current_message
                    
                    routing_result = await Console(routing_team.run_stream(task=context_message))
                    routing_message = routing_result.messages[-1]
                    user_input = routing_result.messages[-2]
                    
                    print(f"🎯 Routing decision: {routing_message.content}")
                    
                    # Handle team routing
                    if "TRANSFER_TO_GENERAL_QA" in routing_message.content:
                        print("📚 Routing to General QA team...")
                        task_result = await Console(self.teams["GENERAL_QA"].run_stream(task=user_input))
                        team_response = task_result.messages[-1].content
                        team_used = "GENERAL_QA"
                        current_active_team = "GENERAL_QA"
                        
                    elif "TRANSFER_TO_SCHOOL_RECOMMENDATION" in routing_message.content:
                        print("🏫 Routing to School Recommendation team...")
                        task_result = await Console(self.teams["SCHOOL_RECOMMENDATION"].run_stream(task=user_input))
                        team_response = task_result.messages[-1].content
                        team_used = "SCHOOL_RECOMMENDATION"
                        current_active_team = "SCHOOL_RECOMMENDATION"
                        
                    elif "TRANSFER_TO_STUDENT_INFO" in routing_message.content:
                        print("👤 Routing to Student Info team...")
                        task_result = await Console(self.teams["STUDENT_INFO"].run_stream(task=user_input))
                        team_response = task_result.messages[-1].content
                        team_used = "STUDENT_INFO"
                        current_active_team = "STUDENT_INFO"
                    
                    # If no specific team routing, orchestrating agent handles it
                    if team_response is None:
                        team_response = routing_message.content
                        team_used = "ORCHESTRATOR"
                        current_active_team = None
                    
                    # Clean up team response (remove TERMINATE)
                    if "TERMINATE" in team_response:
                        team_response = team_response.replace("TERMINATE", "").strip()
                    
                    print(f"✅ Team response: {team_response[:100]}..." if len(team_response) > 100 else f"✅ Team response: {team_response}")
                
                # Store conversation history
                conversation_history.append({
                    'user_question': current_message,
                    'team_response': team_response,
                    'team_used': team_used,
                    'timestamp': current_time
                })
                
                # Update last interaction time and successful count
                last_interaction_time = current_time
                successful_interactions += 1
                
                # Show current active team status
                if current_active_team:
                    print(f"🎯 Active team: {current_active_team} (follow-up questions will continue here)")
                else:
                    print("🎯 No active team (next question will be routed)")
                
                # 4. GET NEXT USER INPUT
                print("\n" + "="*50)
                print("💡 Commands: 'new topic', 'continue', or just ask your question")
                next_user_input = input("User: ").strip()
                
                # 5. CHECK TERMINATION CONDITIONS
                
                # Check if user wants to end conversation
                if self._is_goodbye_message(next_user_input):
                    print("👋 User indicated they want to end the conversation.")
                    print("🤖 Thank you for using our service! Have a great day!")
                    break
                
                # Check if agent suggested ending conversation
                if self._should_end_conversation(team_response) and len(next_user_input) < 10:
                    print("🤖 Conversation appears to be complete.")
                    print("🤖 Thank you for using our service! Feel free to return if you have more questions!")
                    break
                
                # Set up next iteration
                current_message = next_user_input
                
            except Exception as e:
                print(f"❌ Error in conversation loop: {e}")
                
                # Check if this is a handoff/participant error that will keep repeating
                if "handoff target" in str(e).lower() or "participant" in str(e).lower():
                    print("🔄 Detected handoff error - forcing return to orchestrator")
                    current_active_team = None  # Reset active team to force orchestrator routing
                    current_message = "I encountered a routing error. Let me help you with a fresh start."
                else:
                    print("🔄 Attempting to continue...")
                    current_message = "I encountered an error. Can you please repeat your question?"
                continue
        
        # End of conversation
        if interaction_count >= max_interactions:
            print(f"\n⏰ Reached maximum interaction limit ({max_interactions})")
            print("🤖 Thank you for using our service! For additional help, please start a new conversation.")
        
        print(f"\n📊 Conversation completed:")
        print(f"   • Total attempts: {interaction_count}")
        print(f"   • Successful interactions: {successful_interactions}")
        print(f"   • Success rate: {(successful_interactions/interaction_count*100):.1f}%")

if __name__ == "__main__":
    workflow = ChatbotWorkflow()
    asyncio.run(workflow.run("hanyu_liu_003"))



