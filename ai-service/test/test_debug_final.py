#!/usr/bin/env python3
"""
Debug test to see exactly what happens after tools_done
"""

import asyncio
import json
import websockets

async def test_debug_final():
    """Test with extreme debugging to catch the exact moment"""
    print("🔍 Debug Final Result Test...")
    
    try:
        async with websockets.connect("ws://127.0.0.1:8010/ws/hanyu_liu_003") as ws:
            # Get welcome message
            welcome = await ws.recv()
            print(f"✅ Connected: {json.loads(welcome).get('message', 'N/A')}")
            
            # Send the simplest request 
            request = {
                "type": "user_message", 
                "data": {
                    "message": "What is GPA?"
                }
            }
            await ws.send(json.dumps(request))
            print("📤 Sent: What is GPA?")
            
            # Listen for ALL messages with extreme detail
            message_count = 0
            
            try:
                while True:
                    # Wait for next message
                    print(f"🔄 Waiting for message #{message_count + 1}...")
                    
                    try:
                        msg = await asyncio.wait_for(ws.recv(), timeout=60)
                        message_count += 1
                        
                        # Parse message
                        try:
                            data = json.loads(msg)
                            msg_type = data.get("type", "unknown")
                            status = data.get("data", {}).get("status", "N/A")
                            step = data.get("data", {}).get("details", {}).get("step", "N/A")
                            
                            print(f"📨 [{message_count}] {msg_type} | status={status} | step={step}")
                            
                            # Special handling for tools_done - this is where we expect the issue
                            if step == "tools_done":
                                print(f"    🚨 TOOLS_DONE REACHED! Expecting final result next...")
                                print(f"    📊 Message details: {data}")
                            
                            # Final result detection
                            if msg_type == "result":
                                print("🎯 SUCCESS! Final result received!")
                                result_data = data.get("data", {})
                                message = result_data.get("message", "")
                                team_used = result_data.get("meta", {}).get("team_used", "Unknown")
                                print(f"✅ Team Used: {team_used}")
                                print(f"✅ Response Length: {len(message)} chars")
                                print(f"📄 Response Preview: {message[:200]}...")
                                return True
                            elif status == "error":
                                error_msg = data.get("data", {}).get("message", "Unknown error")
                                print(f"    ❌ Error: {error_msg}")
                                return False
                                
                        except json.JSONDecodeError:
                            print(f"📨 [{message_count}] RAW (non-JSON): {msg[:100]}...")
                            
                    except asyncio.TimeoutError:
                        print(f"⏰ Timeout after {message_count} messages")
                        break
                        
            except websockets.exceptions.ConnectionClosed as e:
                print(f"📱 Connection closed after {message_count} messages: {e}")
            except Exception as e:
                print(f"❌ Error after {message_count} messages: {type(e).__name__}: {e}")
                
            print(f"\n📊 Total messages received: {message_count}")
            return False
                
    except Exception as e:
        print(f"❌ Connection ERROR: {type(e).__name__}: {e}")
        return False

async def main():
    success = await test_debug_final()
    if success:
        print("\n🎊 Debug test confirmed success!")
    else:
        print("\n⚠️ Debug test shows issue after tools_done.")

if __name__ == "__main__":
    asyncio.run(main())