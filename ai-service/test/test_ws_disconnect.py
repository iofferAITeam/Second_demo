#!/usr/bin/env python3
"""
Focused WebSocket disconnect test
"""

import asyncio
import json
import websockets

WS_URL = "ws://127.0.0.1:8010"
TEST_USER_ID = "hanyu_liu_003"

async def test_school_recommendation():
    """Test school recommendation with detailed logging"""
    print("🧪 Testing School Recommendation WebSocket Flow...")
    
    try:
        async with websockets.connect(f"{WS_URL}/ws/{TEST_USER_ID}") as ws:
            # Skip welcome message
            welcome = await ws.recv()
            print(f"✅ Connected. Welcome: {json.loads(welcome).get('message', 'N/A')}")
            
            # Send recommendation request
            request = {
                "type": "user_message",
                "data": {
                    "message": "Please recommend 10 Business master programs for me based on my profile."
                }
            }
            await ws.send(json.dumps(request))
            print("📤 Sent recommendation request")
            
            # Collect all messages with timeout
            messages = []
            result_received = False
            
            try:
                for i in range(25):  # Expect multiple status updates + result for 5-step process
                    msg = await asyncio.wait_for(ws.recv(), timeout=60)  # Much longer timeout per message for 5-minute workflow
                    data = json.loads(msg)
                    messages.append(data)
                    
                    msg_type = data.get("type")
                    status = data.get("data", {}).get("status", "N/A")
                    step = data.get("data", {}).get("details", {}).get("step", "N/A")
                    
                    print(f"📨 [{i+1}] {msg_type} | status={status} | step={step}")
                    
                    # Show payload if school recommendation result
                    if msg_type == "result" and data.get("data", {}).get("payload"):
                        schools = data["data"]["payload"].get("schools", [])
                        print(f"   🎓 Got {len(schools)} schools!")
                        result_received = True
                        break
                    elif msg_type == "result":
                        print(f"   ✅ Got result (no payload)")
                        result_received = True
                        break
                        
            except asyncio.TimeoutError:
                print(f"⏰ Timeout after receiving {len(messages)} messages")
            
            if result_received:
                print("✅ SUCCESS: Complete recommendation flow")
                return True
            else:
                print("❌ INCOMPLETE: No final result received")
                return False
                
    except Exception as e:
        print(f"❌ ERROR: {type(e).__name__}: {e}")
        return False

async def test_general_qa():
    """Test general QA with detailed logging"""
    print("\n🧪 Testing General QA WebSocket Flow...")
    
    try:
        async with websockets.connect(f"{WS_URL}/ws/{TEST_USER_ID}") as ws:
            # Skip welcome message
            welcome = await ws.recv()
            print(f"✅ Connected. Welcome: {json.loads(welcome).get('message', 'N/A')}")
            
            # Send general question
            request = {
                "type": "user_message",
                "data": {
                    "message": "What is the difference between MBA and MS programs?"
                }
            }
            await ws.send(json.dumps(request))
            print("📤 Sent general QA request")
            
            # Look for routing decision and result
            routing_seen = False
            result_received = False
            
            try:
                for i in range(12):  # Expect routing + result
                    msg = await asyncio.wait_for(ws.recv(), timeout=12)
                    data = json.loads(msg)
                    
                    msg_type = data.get("type")
                    status = data.get("data", {}).get("status", "N/A")
                    step = data.get("data", {}).get("details", {}).get("step", "N/A")
                    
                    print(f"📨 [{i+1}] {msg_type} | status={status} | step={step}")
                    
                    if step == "routing_debug":
                        routing_seen = True
                        print("   🔄 Routing decision detected")
                    
                    if msg_type == "result":
                        message = data.get("data", {}).get("message", "")
                        print(f"   💬 Result: {message[:50]}...")
                        result_received = True
                        break
                        
            except asyncio.TimeoutError:
                print(f"⏰ Timeout after {i+1} messages")
            
            if routing_seen and result_received:
                print("✅ SUCCESS: Complete QA flow")
                return True
            elif routing_seen:
                print("⚠️  PARTIAL: Routing worked but no result")
                return False
            else:
                print("❌ INCOMPLETE: No routing decision seen")
                return False
                
    except Exception as e:
        print(f"❌ ERROR: {type(e).__name__}: {e}")
        return False

async def main():
    print("🔌 WebSocket Disconnect Test Suite")
    print("=" * 50)
    
    # Test both scenarios
    school_rec_success = await test_school_recommendation()
    qa_success = await test_general_qa()
    
    print("\n📊 Results:")
    print(f"School Recommendation: {'✅ PASS' if school_rec_success else '❌ FAIL'}")
    print(f"General QA: {'✅ PASS' if qa_success else '❌ FAIL'}")
    
    if school_rec_success and qa_success:
        print("\n🎉 All disconnect issues resolved!")
    else:
        print("\n⚠️  Some issues remain - check logs above")

if __name__ == "__main__":
    asyncio.run(main())