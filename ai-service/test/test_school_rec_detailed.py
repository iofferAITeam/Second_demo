#!/usr/bin/env python3
"""
Detailed test of school recommendation to see the actual output
"""

import asyncio
import json
import websockets

async def test_detailed_school_rec():
    """Test school recommendation and show detailed output"""
    print("🎓 Testing Detailed School Recommendation...")
    
    try:
        async with websockets.connect("ws://127.0.0.1:8010/ws/hanyu_liu_003") as ws:
            # Skip welcome message
            welcome = await ws.recv()
            print(f"✅ Connected: {json.loads(welcome).get('message', 'N/A')}")
            
            # Send recommendation request
            request = {
                "type": "user_message",
                "data": {
                    "message": "Please recommend 10 Business master programs for me based on my profile."
                }
            }
            await ws.send(json.dumps(request))
            print("📤 Sent: Please recommend 10 Business master programs...")
            
            # Collect messages and show the full result
            messages = []
            final_result = None
            
            try:
                for i in range(15):
                    msg = await asyncio.wait_for(ws.recv(), timeout=45)
                    data = json.loads(msg)
                    messages.append(data)
                    
                    msg_type = data.get("type")
                    status = data.get("data", {}).get("status", "N/A")
                    step = data.get("data", {}).get("details", {}).get("step", "N/A")
                    
                    print(f"📨 [{i+1}] {msg_type} | status={status} | step={step}")
                    
                    if msg_type == "result":
                        final_result = data
                        break
                        
            except asyncio.TimeoutError:
                print(f"⏰ Timeout after {len(messages)} messages")
            
            if final_result:
                print("\n🎯 Final Result Analysis:")
                result_data = final_result.get("data", {})
                message = result_data.get("message", "")
                payload = result_data.get("payload")
                team_used = result_data.get("meta", {}).get("team_used", "Unknown")
                
                print(f"Team: {team_used}")
                print(f"Message Length: {len(message)} chars")
                print(f"Has Payload: {'Yes' if payload else 'No'}")
                
                if payload:
                    print(f"Payload Keys: {list(payload.keys())}")
                    if "schools" in payload:
                        schools = payload["schools"]
                        print(f"Number of Schools: {len(schools)}")
                        print("Schools:")
                        for i, school in enumerate(schools[:5]):  # Show first 5
                            print(f"  {i+1}. {school}")
                
                print("\n📝 Message Preview (first 500 chars):")
                print(message[:500])
                if len(message) > 500:
                    print("... (truncated)")
                
                return True
            else:
                print("❌ No final result received")
                return False
                
    except Exception as e:
        print(f"❌ ERROR: {type(e).__name__}: {e}")
        return False

async def main():
    success = await test_detailed_school_rec()
    if success:
        print("\n🎉 School recommendation test completed successfully!")
    else:
        print("\n⚠️ School recommendation test failed.")

if __name__ == "__main__":
    asyncio.run(main())