#!/usr/bin/env python3
"""
Debug the routing decision process
"""

import asyncio
import json
import websockets

async def test_routing_debug():
    """Test to see routing debug messages"""
    print("🔍 Testing Routing Debug...")
    
    try:
        async with websockets.connect("ws://127.0.0.1:8010/ws/hanyu_liu_003") as ws:
            # Skip welcome message
            welcome = await ws.recv()
            print(f"✅ Connected")
            
            # Send recommendation request
            request = {
                "type": "user_message",
                "data": {
                    "message": "Please recommend 10 Business master programs for me based on my profile."
                }
            }
            await ws.send(json.dumps(request))
            print("📤 Sent: Please recommend 10 Business master programs...")
            
            # Look for routing debug specifically
            for i in range(10):
                try:
                    msg = await asyncio.wait_for(ws.recv(), timeout=15)
                    data = json.loads(msg)
                    
                    msg_type = data.get("type")
                    status = data.get("data", {}).get("status", "N/A")
                    step = data.get("data", {}).get("details", {}).get("step", "N/A")
                    message = data.get("data", {}).get("message", "")
                    
                    print(f"📨 [{i+1}] {msg_type} | status={status} | step={step}")
                    
                    # Show routing debug details
                    if step == "routing_debug":
                        print(f"    🔍 Routing Decision: {message}")
                    elif step == "routing_override":
                        print(f"    🔄 Routing Override: {message}")
                    elif step == "routed_to_team":
                        team = data.get("data", {}).get("details", {}).get("team", "Unknown")
                        print(f"    🎯 Final Team: {team}")
                    elif msg_type == "result":
                        team_used = data.get("data", {}).get("meta", {}).get("team_used", "Unknown")
                        print(f"    ✅ Result from Team: {team_used}")
                        break
                        
                except asyncio.TimeoutError:
                    print(f"⏰ Timeout after message {i+1}")
                    break
                
    except Exception as e:
        print(f"❌ ERROR: {type(e).__name__}: {e}")

async def main():
    await test_routing_debug()

if __name__ == "__main__":
    asyncio.run(main())