import requests
import json
from datetime import datetime

class TestLogger:
    @staticmethod
    def log(message, level="INFO"):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")

    @staticmethod
    def error(message):
        TestLogger.log(message, "ERROR")

    @staticmethod
    def success(message):
        TestLogger.log(message, "SUCCESS")

class BaseAPITest:
    BASE_URL = 'http://localhost:8000/api'
    
    def __init__(self):
        self.access_token = None

    def handle_response(self, response, context=""):
        try:
            TestLogger.log(f"{context} - Status Code: {response.status_code}")
            if response.status_code in [200, 201, 204]:
                if response.status_code == 204:
                    TestLogger.success(f"{context} successful")
                    return True
                data = response.json()
                TestLogger.success(f"{context} successful")
                return data
            else:
                TestLogger.error(f"{context} failed: {response.text}")
                return None
        except json.JSONDecodeError:
            if response.status_code == 204:
                TestLogger.success(f"{context} successful")
                return True
            TestLogger.error(f"Failed to parse JSON response: {response.text}")
            return None
        except Exception as e:
            TestLogger.error(f"Unexpected error in {context}: {str(e)}")
            return None

    def get_headers(self, include_auth=True):
        headers = {'Content-Type': 'application/json'}
        if include_auth and self.access_token:
            headers['Authorization'] = f'Bearer {self.access_token}'
        return headers 