#!/usr/bin/env python3
"""
Comprehensive API Test Suite for iOffer AI Chat API
Tests HTTP endpoints, WebSocket functionality, and error handling.
"""

import asyncio
import json
import time
from typing import Dict, List, Any
import aiohttp
import websockets
import requests

# Configuration
BASE_URL = "http://127.0.0.1:8010"
WS_URL = "ws://127.0.0.1:8010"
TEST_USER_ID = "hanyu_liu_003"

class APITester:
    def __init__(self):
        self.results: List[Dict[str, Any]] = []
        self.total_tests = 0
        self.passed_tests = 0
        
    def log_result(self, test_name: str, passed: bool, details: str = "", response_time: float = 0):
        """Log test result"""
        self.total_tests += 1
        if passed:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
            
        print(f"{status} {test_name} ({response_time:.2f}s)")
        if details:
            print(f"    {details}")
            
        self.results.append({
            "test": test_name,
            "passed": passed,
            "details": details,
            "response_time": response_time
        })

    def test_http_health(self):
        """Test health endpoint"""
        try:
            start_time = time.time()
            response = requests.get(f"{BASE_URL}/health", timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_result("HTTP Health Check", True, f"Status: {data.get('status')}", response_time)
                else:
                    self.log_result("HTTP Health Check", False, f"Unexpected status: {data}", response_time)
            else:
                self.log_result("HTTP Health Check", False, f"Status code: {response.status_code}", response_time)
        except Exception as e:
            self.log_result("HTTP Health Check", False, f"Exception: {e}")

    def test_http_profile_exists(self):
        """Test profile endpoint for existing user"""
        try:
            start_time = time.time()
            response = requests.get(f"{BASE_URL}/profile/{TEST_USER_ID}", timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get("exists"):
                    self.log_result("HTTP Profile (Existing User)", True, f"User exists with summary", response_time)
                else:
                    self.log_result("HTTP Profile (Existing User)", False, "User should exist but doesn't", response_time)
            else:
                self.log_result("HTTP Profile (Existing User)", False, f"Status code: {response.status_code}", response_time)
        except Exception as e:
            self.log_result("HTTP Profile (Existing User)", False, f"Exception: {e}")

    def test_http_profile_not_exists(self):
        """Test profile endpoint for non-existing user"""
        try:
            start_time = time.time()
            response = requests.get(f"{BASE_URL}/profile/nonexistent_user_123", timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if not data.get("exists"):
                    self.log_result("HTTP Profile (Non-existing User)", True, "Correctly returns exists=false", response_time)
                else:
                    self.log_result("HTTP Profile (Non-existing User)", False, "Should not exist but does", response_time)
            else:
                self.log_result("HTTP Profile (Non-existing User)", False, f"Status code: {response.status_code}", response_time)
        except Exception as e:
            self.log_result("HTTP Profile (Non-existing User)", False, f"Exception: {e}")

    def test_http_school_rec_debug(self):
        """Test school recommendation endpoint with debug mode"""
        try:
            start_time = time.time()
            response = requests.get(f"{BASE_URL}/test/schoolrec", params={
                "user_id": TEST_USER_ID,
                "field": "Business",
                "debug": "true"
            }, timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get("ok") and isinstance(data.get("schools"), list):
                    self.log_result("HTTP School Rec (Debug)", True, f"Got {len(data['schools'])} schools", response_time)
                else:
                    self.log_result("HTTP School Rec (Debug)", False, f"Unexpected response: {data}", response_time)
            else:
                self.log_result("HTTP School Rec (Debug)", False, f"Status code: {response.status_code}", response_time)
        except Exception as e:
            self.log_result("HTTP School Rec (Debug)", False, f"Exception: {e}")

    def test_http_school_rec_real(self):
        """Test school recommendation endpoint with real ML prediction"""
        try:
            start_time = time.time()
            response = requests.get(f"{BASE_URL}/test/schoolrec", params={
                "user_id": TEST_USER_ID,
                "field": "Business"
            }, timeout=30)  # Longer timeout for ML prediction
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get("ok") and isinstance(data.get("schools"), list) and len(data["schools"]) > 0:
                    self.log_result("HTTP School Rec (Real ML)", True, f"Got {len(data['schools'])} schools", response_time)
                else:
                    self.log_result("HTTP School Rec (Real ML)", False, f"No schools or error: {data}", response_time)
            else:
                self.log_result("HTTP School Rec (Real ML)", False, f"Status code: {response.status_code}", response_time)
        except Exception as e:
            self.log_result("HTTP School Rec (Real ML)", False, f"Exception: {e}")

    def test_http_endpoints_invalid(self):
        """Test invalid endpoints return 404"""
        try:
            start_time = time.time()
            response = requests.get(f"{BASE_URL}/nonexistent", timeout=5)
            response_time = time.time() - start_time
            
            if response.status_code == 404:
                self.log_result("HTTP Invalid Endpoint", True, "Correctly returns 404", response_time)
            else:
                self.log_result("HTTP Invalid Endpoint", False, f"Expected 404, got {response.status_code}", response_time)
        except Exception as e:
            self.log_result("HTTP Invalid Endpoint", False, f"Exception: {e}")

    async def test_ws_connection(self):
        """Test WebSocket connection establishment"""
        try:
            start_time = time.time()
            async with websockets.connect(f"{WS_URL}/ws/{TEST_USER_ID}") as ws:
                # Should receive welcome message
                welcome_msg = await asyncio.wait_for(ws.recv(), timeout=5)
                response_time = time.time() - start_time
                
                try:
                    data = json.loads(welcome_msg)
                    if data.get("type") == "system" and "Welcome" in data.get("message", ""):
                        self.log_result("WebSocket Connection", True, f"Got welcome message", response_time)
                    else:
                        self.log_result("WebSocket Connection", False, f"Unexpected welcome: {data}", response_time)
                except json.JSONDecodeError:
                    self.log_result("WebSocket Connection", False, f"Invalid JSON: {welcome_msg}", response_time)
                    
        except Exception as e:
            self.log_result("WebSocket Connection", False, f"Exception: {e}")

    async def test_ws_school_recommendation(self):
        """Test WebSocket school recommendation flow"""
        try:
            start_time = time.time()
            async with websockets.connect(f"{WS_URL}/ws/{TEST_USER_ID}") as ws:
                # Skip welcome message
                await ws.recv()
                
                # Send recommendation request
                request = {
                    "type": "user_message",
                    "data": {
                        "message": "Please recommend 10 Business master programs for me based on my profile."
                    }
                }
                await ws.send(json.dumps(request))
                
                # Collect responses
                messages = []
                result_received = False
                
                try:
                    while len(messages) < 10:  # Limit to prevent infinite loop
                        msg = await asyncio.wait_for(ws.recv(), timeout=15)
                        data = json.loads(msg)
                        messages.append(data)
                        
                        print(f"    WS Message: {data.get('type')} - {data.get('data', {}).get('status', 'N/A')}")
                        
                        if data.get("type") == "result":
                            result_received = True
                            response_time = time.time() - start_time
                            
                            result_data = data.get("data", {})
                            if result_data.get("status") == "success":
                                payload = result_data.get("payload", {})
                                schools = payload.get("schools", []) if payload else []
                                if schools:
                                    self.log_result("WebSocket School Recommendation", True, 
                                                  f"Got {len(schools)} schools in {response_time:.1f}s", response_time)
                                else:
                                    self.log_result("WebSocket School Recommendation", False, 
                                                  "No schools in payload", response_time)
                            else:
                                self.log_result("WebSocket School Recommendation", False, 
                                              f"Result status: {result_data.get('status')}", response_time)
                            break
                            
                except asyncio.TimeoutError:
                    response_time = time.time() - start_time
                    if result_received:
                        pass  # Already logged above
                    else:
                        self.log_result("WebSocket School Recommendation", False, 
                                      f"Timeout after {response_time:.1f}s, got {len(messages)} messages", response_time)
                        
        except Exception as e:
            self.log_result("WebSocket School Recommendation", False, f"Exception: {e}")

    async def test_ws_invalid_message(self):
        """Test WebSocket with invalid message format"""
        try:
            start_time = time.time()
            async with websockets.connect(f"{WS_URL}/ws/{TEST_USER_ID}") as ws:
                # Skip welcome message
                await ws.recv()
                
                # Send invalid message
                await ws.send(json.dumps({"invalid": "format"}))
                
                # Should get error response
                response = await asyncio.wait_for(ws.recv(), timeout=5)
                response_time = time.time() - start_time
                
                data = json.loads(response)
                if (data.get("type") == "status" and 
                    data.get("data", {}).get("status") == "error"):
                    self.log_result("WebSocket Invalid Message", True, "Got error status", response_time)
                else:
                    self.log_result("WebSocket Invalid Message", False, f"Unexpected response: {data}", response_time)
                    
        except Exception as e:
            self.log_result("WebSocket Invalid Message", False, f"Exception: {e}")

    async def test_ws_general_qa(self):
        """Test WebSocket general QA routing"""
        try:
            start_time = time.time()
            async with websockets.connect(f"{WS_URL}/ws/{TEST_USER_ID}") as ws:
                # Skip welcome message
                await ws.recv()
                
                # Send general question (no recommendation keywords)
                request = {
                    "type": "user_message",
                    "data": {
                        "message": "What is the difference between MBA and MS programs?"
                    }
                }
                await ws.send(json.dumps(request))
                
                # Wait for routing decision
                routing_decision_seen = False
                result_received = False
                messages = []
                
                try:
                    while len(messages) < 8:
                        msg = await asyncio.wait_for(ws.recv(), timeout=10)
                        data = json.loads(msg)
                        messages.append(data)
                        
                        print(f"    WS Message: {data.get('type')} - {data.get('data', {}).get('step', 'N/A')}")
                        
                        if (data.get("type") == "status" and 
                            data.get("data", {}).get("step") == "routing_debug"):
                            routing_decision_seen = True
                            
                        if data.get("type") == "result":
                            result_received = True
                            response_time = time.time() - start_time
                            break
                            
                except asyncio.TimeoutError:
                    response_time = time.time() - start_time
                    
                if result_received:
                    self.log_result("WebSocket General QA", True, f"Got response in {response_time:.1f}s", response_time)
                elif routing_decision_seen:
                    self.log_result("WebSocket General QA", False, f"Routing worked but no final result", response_time)
                else:
                    self.log_result("WebSocket General QA", False, f"No routing decision seen", response_time)
                    
        except Exception as e:
            self.log_result("WebSocket General QA", False, f"Exception: {e}")

    def test_load_static_files(self):
        """Test static file serving"""
        endpoints = [
            "/ws-test",
            "/ws-school-rec-test"
        ]
        
        for endpoint in endpoints:
            try:
                start_time = time.time()
                response = requests.get(f"{BASE_URL}{endpoint}", timeout=5)
                response_time = time.time() - start_time
                
                if response.status_code == 200 and "html" in response.headers.get("content-type", "").lower():
                    self.log_result(f"Static File {endpoint}", True, "HTML served correctly", response_time)
                else:
                    self.log_result(f"Static File {endpoint}", False, 
                                  f"Status: {response.status_code}, Content-Type: {response.headers.get('content-type')}", 
                                  response_time)
            except Exception as e:
                self.log_result(f"Static File {endpoint}", False, f"Exception: {e}")

    async def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting Comprehensive API Test Suite")
        print("=" * 60)
        
        # HTTP Tests
        print("\n📡 HTTP Endpoint Tests")
        print("-" * 30)
        self.test_http_health()
        self.test_http_profile_exists()
        self.test_http_profile_not_exists()
        self.test_http_school_rec_debug()
        self.test_http_school_rec_real()
        self.test_http_endpoints_invalid()
        self.test_load_static_files()
        
        # WebSocket Tests
        print("\n🔌 WebSocket Tests")
        print("-" * 20)
        await self.test_ws_connection()
        await self.test_ws_school_recommendation()
        await self.test_ws_invalid_message()
        await self.test_ws_general_qa()
        
        # Summary
        print("\n📊 Test Summary")
        print("=" * 60)
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests}")
        print(f"Failed: {self.total_tests - self.passed_tests}")
        print(f"Success Rate: {(self.passed_tests/self.total_tests)*100:.1f}%")
        
        if self.passed_tests == self.total_tests:
            print("\n🎉 All tests passed! API is working correctly.")
        else:
            print(f"\n⚠️  {self.total_tests - self.passed_tests} tests failed. Check details above.")
            
        # Detailed results
        print(f"\n📝 Detailed Results:")
        for result in self.results:
            status = "✅" if result["passed"] else "❌"
            print(f"{status} {result['test']}: {result['details']}")

def main():
    """Main test runner"""
    tester = APITester()
    asyncio.run(tester.run_all_tests())

if __name__ == "__main__":
    main()