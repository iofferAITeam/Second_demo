#!/usr/bin/env python3
"""
Test for successful completion detection
"""

import asyncio
import json
import websockets

async def test_simple_success():
    """Test with a very simple message that should complete quickly"""
    print("🚀 Testing Simple Success...")
    
    try:
        async with websockets.connect("ws://127.0.0.1:8010/ws/hanyu_liu_003") as ws:
            # Get welcome message
            welcome = await ws.recv()
            print(f"✅ Connected: {json.loads(welcome).get('message', 'N/A')}")
            
            # Send a very simple request that should route to GENERAL_QA and complete
            request = {
                "type": "user_message", 
                "data": {
                    "message": "What is GPA?"
                }
            }
            await ws.send(json.dumps(request))
            print("📤 Sent: What is GPA?")
            
            # Listen for all messages with longer timeout
            messages = []
            final_result = None
            
            try:
                for i in range(20):
                    msg = await asyncio.wait_for(ws.recv(), timeout=30)
                    data = json.loads(msg)
                    messages.append(data)
                    
                    msg_type = data.get("type")
                    status = data.get("data", {}).get("status", "N/A")
                    step = data.get("data", {}).get("details", {}).get("step", "N/A")
                    
                    print(f"📨 [{i+1}] {msg_type} | status={status} | step={step}")
                    
                    if msg_type == "result":
                        final_result = data
                        print("🎯 SUCCESS! Final result received!")
                        break
                    elif status == "error":
                        error_msg = data.get("data", {}).get("message", "Unknown error")
                        print(f"    ❌ Error: {error_msg}")
                        break
                        
            except asyncio.TimeoutError:
                print(f"⏰ Timeout after {len(messages)} messages")
            except Exception as e:
                print(f"❌ Exception: {type(e).__name__}: {e}")
            
            if final_result:
                print("\n🎉 SUCCESS CONFIRMED!")
                result_data = final_result.get("data", {})
                message = result_data.get("message", "")
                team_used = result_data.get("meta", {}).get("team_used", "Unknown")
                print(f"✅ Team Used: {team_used}")
                print(f"✅ Response Length: {len(message)} chars")
                print(f"📄 Response Preview: {message[:200]}...")
                return True
            else:
                print(f"\n❌ No final result after {len(messages)} messages")
                return False
                
    except Exception as e:
        print(f"❌ Connection ERROR: {type(e).__name__}: {e}")
        return False

async def main():
    success = await test_simple_success()
    if success:
        print("\n🎊 Simple test PASSED! WebSocket flow is working!")
    else:
        print("\n⚠️ Simple test failed.")

if __name__ == "__main__":
    asyncio.run(main())