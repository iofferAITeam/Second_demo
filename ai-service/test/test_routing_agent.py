#!/usr/bin/env python3
"""
Test the routing agent directly to find the issue
"""

import asyncio
from src.agents.orchestrating_agent import get_orchestrating_agent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.conditions import TextMentionTermination
from autogen_agentchat.ui import Console

async def test_routing_simple():
    """Test routing with simple messages"""
    print("🧪 Testing routing agent with simple messages")
    
    routing_agent = get_orchestrating_agent()
    
    # Test messages
    test_messages = [
        "recommend msba program for me",
        "Please recommend 10 Business master programs for me based on my profile.",
        "What is the difference between MBA and MS programs?",
        "I want to upload my profile"
    ]
    
    for i, message in enumerate(test_messages):
        print(f"\n📝 Test {i+1}: '{message}'")
        
        try:
            # Create routing team WITHOUT UserProxyAgent
            routing_team = RoundRobinGroupChat(
                [routing_agent],
                termination_condition=TextMentionTermination("TRANSFER_TO_"),
                max_turns=3  # Limit turns to prevent infinite loops
            )
            
            # Test with timeout
            start_time = asyncio.get_event_loop().time()
            result = await asyncio.wait_for(
                Console(routing_team.run_stream(task=message)), 
                timeout=10
            )
            end_time = asyncio.get_event_loop().time()
            
            if result.messages:
                routing_msg = result.messages[-1]
                content = getattr(routing_msg, 'content', str(routing_msg))
                print(f"✅ SUCCESS ({end_time - start_time:.2f}s): {content[:100]}...")
            else:
                print("❌ FAIL: No messages returned")
                
        except asyncio.TimeoutError:
            print("❌ TIMEOUT: Routing agent took >10 seconds")
        except Exception as e:
            print(f"❌ ERROR: {type(e).__name__}: {e}")

async def test_routing_with_proxy():
    """Test routing with UserProxyAgent to see if that's the issue"""
    print("\n🧪 Testing routing agent WITH UserProxyAgent")
    
    from autogen_agentchat.agents import UserProxyAgent
    
    routing_agent = get_orchestrating_agent()
    user_proxy = UserProxyAgent("user_proxy", input_func=lambda: "")
    
    try:
        routing_team = RoundRobinGroupChat(
            [routing_agent, user_proxy],
            termination_condition=TextMentionTermination("TRANSFER_TO_"),
            max_turns=3
        )
        
        result = await asyncio.wait_for(
            Console(routing_team.run_stream(task="recommend msba program for me")), 
            timeout=10
        )
        
        if result.messages:
            routing_msg = result.messages[-1]
            content = getattr(routing_msg, 'content', str(routing_msg))
            print(f"✅ WITH PROXY SUCCESS: {content[:100]}...")
        else:
            print("❌ WITH PROXY FAIL: No messages")
            
    except asyncio.TimeoutError:
        print("❌ WITH PROXY TIMEOUT")
    except Exception as e:
        print(f"❌ WITH PROXY ERROR: {type(e).__name__}: {e}")

async def main():
    print("🔍 Routing Agent Diagnosis")
    print("=" * 50)
    
    await test_routing_simple()
    await test_routing_with_proxy()
    
    print("\n✅ Diagnosis complete!")

if __name__ == "__main__":
    asyncio.run(main())