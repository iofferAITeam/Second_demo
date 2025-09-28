#!/usr/bin/env python3
"""
Basic WebSocket connectivity test
"""

import asyncio
import json
import websockets

async def test_basic_connection():
    """Test basic WebSocket connection and simple message"""
    print("🔗 Testing Basic WebSocket Connection...")
    
    try:
        async with websockets.connect("ws://127.0.0.1:8010/ws/hanyu_liu_003") as ws:
            # Get welcome message
            welcome = await ws.recv()
            welcome_data = json.loads(welcome)
            print(f"✅ Connected: {welcome_data.get('message', 'N/A')}")
            
            # Send a simple general QA request (should be faster than school rec)
            request = {
                "type": "user_message", 
                "data": {
                    "message": "What is machine learning?"
                }
            }
            await ws.send(json.dumps(request))
            print("📤 Sent: What is machine learning?")
            
            # Wait for response with shorter timeout
            messages = []
            final_result = None
            
            try:
                for i in range(10):  # Expect fewer messages for simple QA
                    msg = await asyncio.wait_for(ws.recv(), timeout=30)  # 30 seconds per message
                    data = json.loads(msg)
                    messages.append(data)
                    
                    msg_type = data.get("type")
                    status = data.get("data", {}).get("status", "N/A")
                    step = data.get("data", {}).get("details", {}).get("step", "N/A")
                    
                    print(f"📨 [{i+1}] {msg_type} | status={status} | step={step}")
                    
                    if msg_type == "result":
                        final_result = data
                        break
                    elif status == "error":
                        error_msg = data.get("data", {}).get("message", "Unknown error")
                        print(f"    ❌ Error: {error_msg}")
                        break
                        
            except asyncio.TimeoutError:
                print(f"⏰ Timeout after {len(messages)} messages")
            
            if final_result:
                print("\n🎯 SUCCESS: Basic WebSocket test passed!")
                message = final_result.get("data", {}).get("message", "")
                team_used = final_result.get("data", {}).get("meta", {}).get("team_used", "Unknown")
                print(f"✅ Team Used: {team_used}")
                print(f"✅ Message Length: {len(message)} chars")
                print(f"📄 Message Preview: {message[:150]}...")
                return True
            else:
                print("❌ No final result received")
                return False
                
    except Exception as e:
        print(f"❌ ERROR: {type(e).__name__}: {e}")
        return False

async def main():
    success = await test_basic_connection()
    if success:
        print("\n🎉 Basic WebSocket connectivity confirmed!")
    else:
        print("\n⚠️ Basic WebSocket test failed.")

if __name__ == "__main__":
    asyncio.run(main())