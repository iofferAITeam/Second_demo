#!/usr/bin/env python3
"""
Test with longer wait time to see if we get the fallback or complete workflow
"""

import asyncio
import json
import websockets

async def test_with_long_wait():
    """Test with very long timeout to capture either success or fallback"""
    print("🎓 Testing School Recommendation with Extended Wait...")
    
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
            print("📤 Sent: Business master programs request")
            
            # Wait for up to 8 minutes to capture complete workflow or fallback
            messages = []
            final_result = None
            
            try:
                for i in range(50):  # Allow for many status updates
                    msg = await asyncio.wait_for(ws.recv(), timeout=480)  # 8 minutes total
                    data = json.loads(msg)
                    messages.append(data)
                    
                    msg_type = data.get("type")
                    status = data.get("data", {}).get("status", "N/A")
                    step = data.get("data", {}).get("details", {}).get("step", "N/A")
                    
                    print(f"📨 [{i+1}] {msg_type} | status={status} | step={step}")
                    
                    # Special attention to fallback and final steps
                    if step in ["fallback_mode", "fallback_ml", "evaluating_fit", "finalizing_results"]:
                        print(f"    🔥 IMPORTANT: {step} detected!")
                    
                    if msg_type == "result":
                        final_result = data
                        break
                    elif status == "error":
                        print(f"    ❌ Error: {data.get('data', {}).get('message', 'Unknown error')}")
                        break
                        
            except asyncio.TimeoutError:
                print(f"⏰ Final timeout after {len(messages)} messages (8 minutes)")
            
            if final_result:
                print("\n🎯 FINAL RESULT RECEIVED!")
                result_data = final_result.get("data", {})
                message = result_data.get("message", "")
                payload = result_data.get("payload")
                team_used = result_data.get("meta", {}).get("team_used", "Unknown")
                fallback_reason = result_data.get("meta", {}).get("fallback_reason")
                
                print(f"✅ Team Used: {team_used}")
                print(f"✅ Message Length: {len(message)} chars")
                print(f"✅ Has Payload: {'Yes' if payload else 'No'}")
                if fallback_reason:
                    print(f"🔄 Fallback Reason: {fallback_reason}")
                
                if payload and "schools" in payload:
                    schools = payload["schools"]
                    print(f"🎓 Number of Schools: {len(schools)}")
                    print("📋 Schools List:")
                    for i, school in enumerate(schools[:5]):  # Show first 5
                        school_name = school.get("name", school) if isinstance(school, dict) else school
                        print(f"  {i+1}. {school_name}")
                    if len(schools) > 5:
                        print(f"  ... and {len(schools) - 5} more")
                
                print(f"\n📄 Message Preview (first 200 chars):")
                print(message[:200] + ("..." if len(message) > 200 else ""))
                
                return True
            else:
                print("❌ No final result received after extended wait")
                return False
                
    except Exception as e:
        print(f"❌ ERROR: {type(e).__name__}: {e}")
        return False

async def main():
    success = await test_with_long_wait()
    if success:
        print("\n🎉 Extended test completed with result!")
    else:
        print("\n⚠️ Extended test completed without result.")

if __name__ == "__main__":
    asyncio.run(main())