import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

class AgoraRTMTester:
    def __init__(self):
        self.teacher_token = None
        self.student_token = None
        self.teacher_credentials = {
            "email": "testteacher2@example.com",
            "password": "testpass123"
        }
        self.student_credentials = {
            "email": "teststudent2@example.com",
            "password": "testpass123"
        }

    def print_test_header(self, test_name):
        print("\n" + "="*50)
        print(f"Testing: {test_name}")
        print("="*50)

    def print_response(self, response):
        print("\nResponse Status:", response.status_code)
        print("Response Body:", json.dumps(response.json(), indent=2))

    def test_authentication(self):
        """Test 1: Authentication for both teacher and student"""
        self.print_test_header("Authentication")

        # Test 1.1: Teacher Login
        print("\n1.1 Testing Teacher Login:")
        response = requests.post(
            f"{BASE_URL}/api/auth/login/",
            json=self.teacher_credentials
        )
        self.print_response(response)
        assert response.status_code == 200, "Teacher login failed"
        self.teacher_token = response.json()["tokens"]["access"]

        # Test 1.2: Student Login
        print("\n1.2 Testing Student Login:")
        response = requests.post(
            f"{BASE_URL}/api/auth/login/",
            json=self.student_credentials
        )
        self.print_response(response)
        assert response.status_code == 200, "Student login failed"
        self.student_token = response.json()["tokens"]["access"]

    def test_rtm_token_generation(self):
        """Test 2: RTM Token Generation"""
        self.print_test_header("RTM Token Generation")

        # Test 2.1: Teacher RTM Token
        print("\n2.1 Testing Teacher RTM Token Generation:")
        response = requests.post(
            f"{BASE_URL}/api/video-rooms/token/",
            headers={"Authorization": f"Bearer {self.teacher_token}"},
            json={"room_id": 1, "token_type": "rtm"}
        )
        self.print_response(response)
        assert response.status_code == 200, "Teacher RTM token generation failed"
        assert "token" in response.json(), "Token not in response"
        assert "channel_name" in response.json(), "Channel name not in response"
        assert "uid" in response.json(), "UID not in response"
        assert "expires_at" in response.json(), "Expiration time not in response"

        # Test 2.2: Student RTM Token
        print("\n2.2 Testing Student RTM Token Generation:")
        response = requests.post(
            f"{BASE_URL}/api/video-rooms/token/",
            headers={"Authorization": f"Bearer {self.student_token}"},
            json={"room_id": 1, "token_type": "rtm"}
        )
        self.print_response(response)
        assert response.status_code == 200, "Student RTM token generation failed"

    def test_access_control(self):
        """Test 3: Access Control"""
        self.print_test_header("Access Control")

        # Test 3.1: Invalid Room ID
        print("\n3.1 Testing Invalid Room ID:")
        response = requests.post(
            f"{BASE_URL}/api/video-rooms/token/",
            headers={"Authorization": f"Bearer {self.student_token}"},
            json={"room_id": 999, "token_type": "rtm"}
        )
        self.print_response(response)
        assert response.status_code == 404, "Invalid room ID test failed"

        # Test 3.2: Invalid Token
        print("\n3.2 Testing Invalid Token:")
        response = requests.post(
            f"{BASE_URL}/api/video-rooms/token/",
            headers={"Authorization": "Bearer invalid_token"},
            json={"room_id": 1, "token_type": "rtm"}
        )
        self.print_response(response)
        assert response.status_code == 401, "Invalid token test failed"

    def test_rtc_token_generation(self):
        """Test 4: RTC Token Generation"""
        self.print_test_header("RTC Token Generation")

        # Test 4.1: Teacher RTC Token
        print("\n4.1 Testing Teacher RTC Token Generation:")
        response = requests.post(
            f"{BASE_URL}/api/video-rooms/token/",
            headers={"Authorization": f"Bearer {self.teacher_token}"},
            json={"room_id": 1, "token_type": "rtc"}
        )
        self.print_response(response)
        assert response.status_code == 200, "Teacher RTC token generation failed"

    def verify_token_format(self, token):
        """Verify token format and structure"""
        assert token.startswith("006c0d5169e3b6a"), "Invalid token format"

    def run_all_tests(self):
        """Run all tests in sequence"""
        try:
            self.test_authentication()
            self.test_rtm_token_generation()
            self.test_access_control()
            self.test_rtc_token_generation()
            print("\nAll tests completed successfully! ✅")
        except AssertionError as e:
            print(f"\nTest failed: {str(e)} ❌")
        except Exception as e:
            print(f"\nUnexpected error: {str(e)} ❌")

if __name__ == "__main__":
    print("Starting Agora RTM Integration Tests...")
    tester = AgoraRTMTester()
    tester.run_all_tests() 