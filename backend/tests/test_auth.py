import requests
import json
from test_utils import BaseAPITest, TestLogger
from datetime import datetime

class AuthTest(BaseAPITest):
    def test_register(self, email, password, user_type="student", **kwargs):
        url = f"{self.BASE_URL}/auth/register/"
        data = {
            'email': email,
            'username': kwargs.get('username', email.split('@')[0]),
            'password': password,
            'confirm_password': password,
            'user_type': user_type,
            'first_name': kwargs.get('first_name', 'Test'),
            'last_name': kwargs.get('last_name', 'User'),
            'phone': kwargs.get('phone', '1234567890')
        }
        
        try:
            response = requests.post(url, json=data, headers=self.get_headers(include_auth=False))
            result = self.handle_response(response, "User Registration")
            if result:
                TestLogger.log(f"Registration response: {json.dumps(result, indent=2)}")
            return result
        except Exception as e:
            TestLogger.error(f"Error in registration: {str(e)}")
            return None

    def test_login(self, email, password):
        url = f"{self.BASE_URL}/auth/login/"
        data = {
            'email': email,
            'password': password
        }
        
        try:
            response = requests.post(url, json=data, headers=self.get_headers(include_auth=False))
            result = self.handle_response(response, "User Login")
            if result and 'tokens' in result:
                self.access_token = result['tokens']['access']
                TestLogger.log(f"Login response: {json.dumps(result, indent=2)}")
            return result
        except Exception as e:
            TestLogger.error(f"Error in login: {str(e)}")
            return None

    def test_verify_token(self):
        url = f"{self.BASE_URL}/auth/verify-token/"
        try:
            response = requests.get(url, headers=self.get_headers())
            return self.handle_response(response, "Token Verification")
        except Exception as e:
            TestLogger.error(f"Error in token verification: {str(e)}")
            return None

    def test_refresh_token(self, refresh_token):
        url = f"{self.BASE_URL}/auth/token/refresh/"
        data = {'refresh': refresh_token}
        
        try:
            response = requests.post(url, json=data, headers=self.get_headers(include_auth=False))
            result = self.handle_response(response, "Token Refresh")
            if result and 'access' in result:
                self.access_token = result['access']
            return result
        except Exception as e:
            TestLogger.error(f"Error in token refresh: {str(e)}")
            return None

    def test_change_password(self, old_password, new_password):
        if not self.access_token:
            TestLogger.error("Authentication required for password change")
            return None

        url = f"{self.BASE_URL}/auth/change-password/"
        data = {
            'old_password': old_password,
            'new_password': new_password,
            'confirm_password': new_password
        }
        
        try:
            response = requests.post(url, json=data, headers=self.get_headers())
            return self.handle_response(response, "Password Change")
        except Exception as e:
            TestLogger.error(f"Error in password change: {str(e)}")
            return None

    def test_reset_password_request(self, email):
        url = f"{self.BASE_URL}/auth/password-reset/"
        data = {'email': email}
        
        try:
            response = requests.post(url, json=data, headers=self.get_headers(include_auth=False))
            return self.handle_response(response, "Password Reset Request")
        except Exception as e:
            TestLogger.error(f"Error in password reset request: {str(e)}")
            return None

def run_auth_tests():
    TestLogger.log("\n=== Running Authentication Tests ===")
    tester = AuthTest()
    
    # Generate unique identifiers
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    
    # Test registration - Create a teacher
    teacher_email = f"teacher{timestamp}@example.com"
    teacher_password = "TeacherPass123!"
    
    teacher_reg = tester.test_register(
        teacher_email,
        teacher_password,
        user_type="teacher",
        first_name="Test",
        last_name="Teacher",
        username=f"testteacher{timestamp}"
    )
    if teacher_reg:
        TestLogger.success("Teacher registration successful")
    
    # Test registration - Create a student
    student_email = f"student{timestamp}@example.com"
    student_password = "StudentPass123!"
    
    student_reg = tester.test_register(
        student_email,
        student_password,
        user_type="student",
        first_name="Test",
        last_name="Student",
        username=f"teststudent{timestamp}"
    )
    if student_reg:
        TestLogger.success("Student registration successful")
    
    # Test login with teacher
    login_result = tester.test_login(teacher_email, teacher_password)
    if login_result:
        TestLogger.success("Teacher login successful")
        
        # Test token verification
        if tester.test_verify_token():
            TestLogger.success("Token verification successful")
        
        # Test token refresh
        refresh_result = tester.test_refresh_token(login_result['tokens']['refresh'])
        if refresh_result:
            TestLogger.success("Token refresh successful")
        
        # Test password change
        new_password = "NewTeacherPass123!"
        if tester.test_change_password(teacher_password, new_password):
            TestLogger.success("Password change successful")
            
            # Verify new password works
            if tester.test_login(teacher_email, new_password):
                TestLogger.success("Login with new password successful")
    
    # Test password reset request
    if tester.test_reset_password_request(teacher_email):
        TestLogger.success("Password reset request successful")

if __name__ == '__main__':
    run_auth_tests() 