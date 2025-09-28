#!/usr/bin/env python3
"""
Test to capture the exact moment of disconnect
"""

import asyncio
import json
import websockets

async def test_exact_disconnect():
    """Test to find exactly when and why the disconnect happens"""
    print("🔍 Testing Exact Disconnect Point...")
    
    try:
        async with websockets.connect("ws://127.0.0.1:8010/ws/hanyu_liu_003") as ws:
            # Get welcome message
            welcome = await ws.recv()
            welcome_data = json.loads(welcome)
            print(f"✅ Connected: {welcome_data.get('message', 'N/A')}")
            
            # Send the simplest possible request 
            request = {
                "type": "user_message", 
                "data": {
                    "message": "Hello"
                }
            }
            await ws.send(json.dumps(request))
            print("📤 Sent: Hello")
            
            # Listen for ALL messages until disconnection
            message_count = 0
            
            try:
                while True:
                    # Wait for next message with detailed timeout
                    msg = await asyncio.wait_for(ws.recv(), timeout=60)
                    message_count += 1
                    
                    try:
                        data = json.loads(msg)
                        msg_type = data.get("type", "unknown")
                        status = data.get("data", {}).get("status", "N/A")
                        step = data.get("data", {}).get("details", {}).get("step", "N/A")
                        
                        print(f"📨 [{message_count}] {msg_type} | status={status} | step={step}")
                        
                        # Show more details for certain steps
                        if step in ["tools_done", "finalizing_results"] or msg_type == "result":
                            print(f"    🔍 Full data keys: {list(data.keys())}")
                            if "data" in data:
                                print(f"    🔍 Data keys: {list(data['data'].keys())}")
                                if "message" in data["data"]:
                                    msg_len = len(str(data["data"]["message"]))
                                    print(f"    🔍 Message length: {msg_len}")
                        
                        if msg_type == "result":
                            print("🎯 FINAL RESULT RECEIVED!")
                            break
                        elif status == "error":
                            error_msg = data.get("data", {}).get("message", "Unknown error")
                            print(f"    ❌ Error: {error_msg}")
                            break
                            
                    except json.JSONDecodeError:
                        print(f"📨 [{message_count}] RAW (non-JSON): {msg[:100]}...")
                        
            except asyncio.TimeoutError:
                print(f"⏰ Timeout after {message_count} messages")
            except websockets.exceptions.ConnectionClosed as e:
                print(f"📱 Connection closed after {message_count} messages: {e}")
            except Exception as e:
                print(f"❌ Error after {message_count} messages: {type(e).__name__}: {e}")
                
    except Exception as e:
        print(f"❌ Connection ERROR: {type(e).__name__}: {e}")

async def main():
    await test_exact_disconnect()

if __name__ == "__main__":
    asyncio.run(main())