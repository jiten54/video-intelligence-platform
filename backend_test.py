#!/usr/bin/env python3
"""
Comprehensive backend API testing for YouTube AI Wrapper
Tests all endpoints: analyze, search, chat, transcript
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any

class YouTubeAITester:
    def __init__(self, base_url="https://video-ai-tools-4.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.session_id = f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Test YouTube video with available transcript
        self.test_video_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        self.test_video_id = "dQw4w9WgXcQ"

    def log_test(self, name: str, passed: bool, details: str = ""):
        """Log test results"""
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED {details}")
        else:
            print(f"❌ {name}: FAILED {details}")

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/", timeout=10)
            passed = response.status_code == 200
            
            if passed:
                data = response.json()
                details = f"- Status: {response.status_code}, Message: {data.get('message', '')}"
            else:
                details = f"- Status: {response.status_code}"
                
            self.log_test("API Root", passed, details)
            return passed
        except Exception as e:
            self.log_test("API Root", False, f"- Error: {str(e)}")
            return False

    def test_youtube_search(self):
        """Test YouTube search functionality"""
        try:
            payload = {"query": "python tutorial", "limit": 5}
            response = requests.post(
                f"{self.base_url}/api/youtube/search",
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=15
            )
            
            passed = response.status_code == 200
            
            if passed:
                data = response.json()
                videos = data.get('videos', [])
                details = f"- Found {len(videos)} videos"
                
                # Validate response structure
                if videos and isinstance(videos[0], dict):
                    required_fields = ['video_id', 'title', 'thumbnail', 'channel']
                    has_required_fields = all(field in videos[0] for field in required_fields)
                    details += f", Valid structure: {has_required_fields}"
            else:
                details = f"- Status: {response.status_code}, Error: {response.text[:100]}"
                
            self.log_test("YouTube Search", passed, details)
            return passed, response.json() if passed else {}
            
        except Exception as e:
            self.log_test("YouTube Search", False, f"- Error: {str(e)}")
            return False, {}

    def test_video_analyze(self):
        """Test video analysis endpoint"""
        try:
            payload = {"video_url": self.test_video_url}
            response = requests.post(
                f"{self.base_url}/api/youtube/analyze",
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=60  # AI processing can take time
            )
            
            passed = response.status_code == 200
            
            if passed:
                data = response.json()
                required_fields = ['video_id', 'title', 'summary', 'key_points', 'transcript']
                has_all_fields = all(field in data for field in required_fields)
                
                details = f"- All fields present: {has_all_fields}"
                if data.get('summary'):
                    details += f", Summary length: {len(data['summary'])} chars"
                if data.get('key_points'):
                    details += f", Key points: {len(data['key_points'])}"
                    
                passed = passed and has_all_fields
            else:
                details = f"- Status: {response.status_code}, Error: {response.text[:200]}"
                
            self.log_test("Video Analysis", passed, details)
            return passed, response.json() if passed else {}
            
        except Exception as e:
            self.log_test("Video Analysis", False, f"- Error: {str(e)}")
            return False, {}

    def test_transcript_only(self):
        """Test transcript-only endpoint"""
        try:
            payload = {"video_id": self.test_video_id}
            response = requests.post(
                f"{self.base_url}/api/youtube/transcript",
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            passed = response.status_code == 200
            
            if passed:
                data = response.json()
                transcript = data.get('transcript', '')
                details = f"- Transcript length: {len(transcript)} chars"
                passed = passed and len(transcript) > 0
            else:
                details = f"- Status: {response.status_code}, Error: {response.text[:100]}"
                
            self.log_test("Transcript Only", passed, details)
            return passed
            
        except Exception as e:
            self.log_test("Transcript Only", False, f"- Error: {str(e)}")
            return False

    def test_chat_functionality(self, video_data: Dict[Any, Any]):
        """Test chat endpoint with video context"""
        if not video_data.get('video_id'):
            self.log_test("Chat Functionality", False, "- No video data available")
            return False
            
        try:
            payload = {
                "video_id": video_data['video_id'],
                "message": "What is this video about?",
                "session_id": self.session_id
            }
            
            response = requests.post(
                f"{self.base_url}/api/chat/message",
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=45  # AI responses can take time
            )
            
            passed = response.status_code == 200
            
            if passed:
                data = response.json()
                ai_response = data.get('response', '')
                session_returned = data.get('session_id', '')
                
                details = f"- Response length: {len(ai_response)} chars"
                details += f", Session ID match: {session_returned == self.session_id}"
                
                passed = passed and len(ai_response) > 10 and session_returned == self.session_id
            else:
                details = f"- Status: {response.status_code}, Error: {response.text[:150]}"
                
            self.log_test("Chat Functionality", passed, details)
            return passed
            
        except Exception as e:
            self.log_test("Chat Functionality", False, f"- Error: {str(e)}")
            return False

    def test_error_handling(self):
        """Test error handling with invalid requests"""
        tests = [
            {
                "name": "Invalid Video URL",
                "endpoint": "/api/youtube/analyze",
                "payload": {"video_url": "invalid-url"},
                "expected_status": [400, 500]
            },
            {
                "name": "Chat Without Video",
                "endpoint": "/api/chat/message",
                "payload": {"video_id": "invalid_id", "message": "test", "session_id": "test"},
                "expected_status": [404, 500]
            },
            {
                "name": "Empty Search Query",
                "endpoint": "/api/youtube/search",
                "payload": {"query": "", "limit": 5},
                "expected_status": [400, 422]
            }
        ]
        
        passed_count = 0
        for test in tests:
            try:
                response = requests.post(
                    f"{self.base_url}{test['endpoint']}",
                    json=test['payload'],
                    headers={'Content-Type': 'application/json'},
                    timeout=10
                )
                
                passed = response.status_code in test['expected_status']
                if passed:
                    passed_count += 1
                    
                details = f"- Status: {response.status_code} (expected: {test['expected_status']})"
                self.log_test(test['name'], passed, details)
                
            except Exception as e:
                self.log_test(test['name'], False, f"- Error: {str(e)}")
        
        return passed_count == len(tests)

    def run_all_tests(self):
        """Execute all test suites"""
        print(f"🚀 Starting YouTube AI Wrapper API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print(f"🎬 Test Video: {self.test_video_url}")
        print("-" * 60)
        
        # Basic connectivity
        if not self.test_api_root():
            print("❌ API root failed - stopping tests")
            return False
        
        # Search functionality
        search_passed, search_data = self.test_youtube_search()
        
        # Video analysis (core feature)
        analyze_passed, video_data = self.test_video_analyze()
        
        # Transcript endpoint
        transcript_passed = self.test_transcript_only()
        
        # Chat functionality (depends on analysis)
        chat_passed = False
        if analyze_passed and video_data:
            chat_passed = self.test_chat_functionality(video_data)
        
        # Error handling
        error_handling_passed = self.test_error_handling()
        
        # Summary
        print("-" * 60)
        print(f"📊 Tests Summary: {self.tests_passed}/{self.tests_run} passed")
        print(f"✅ API Root: {'PASS' if self.tests_passed > 0 else 'FAIL'}")
        print(f"🔍 Search: {'PASS' if search_passed else 'FAIL'}")
        print(f"📹 Analysis: {'PASS' if analyze_passed else 'FAIL'}")
        print(f"📝 Transcript: {'PASS' if transcript_passed else 'FAIL'}")
        print(f"💬 Chat: {'PASS' if chat_passed else 'FAIL'}")
        print(f"🛠️  Error Handling: {'PASS' if error_handling_passed else 'FAIL'}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        return success_rate >= 80  # At least 80% success rate

def main():
    tester = YouTubeAITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())