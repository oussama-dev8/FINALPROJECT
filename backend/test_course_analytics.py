import requests
import json
from datetime import datetime
from test_api import TestLogger, APITester

class CourseAnalyticsTester(APITester):
    def get_course_analytics(self, course_id):
        if not self.teacher_token:
            TestLogger.error("Teacher token required for analytics")
            return None

        url = f"{self.BASE_URL}/courses/courses/{course_id}/analytics/"
        headers = {'Authorization': f'Bearer {self.teacher_token}'}
        
        try:
            response = requests.get(url, headers=headers)
            return self.handle_response(response, "Course Analytics")
        except Exception as e:
            TestLogger.error(f"Error getting course analytics: {str(e)}")
            return None

    def get_course_visibility(self, course_id):
        """Test course visibility for different user types"""
        results = {
            'public': None,
            'student': None,
            'teacher': None
        }
        
        url = f"{self.BASE_URL}/courses/courses/{course_id}/"
        
        # Test public access
        try:
            response = requests.get(url)
            results['public'] = self.handle_response(response, "Public Course Access")
        except Exception as e:
            TestLogger.error(f"Error testing public access: {str(e)}")

        # Test student access
        if self.student_token:
            try:
                headers = {'Authorization': f'Bearer {self.student_token}'}
                response = requests.get(url, headers=headers)
                results['student'] = self.handle_response(response, "Student Course Access")
            except Exception as e:
                TestLogger.error(f"Error testing student access: {str(e)}")

        # Test teacher access
        if self.teacher_token:
            try:
                headers = {'Authorization': f'Bearer {self.teacher_token}'}
                response = requests.get(url, headers=headers)
                results['teacher'] = self.handle_response(response, "Teacher Course Access")
            except Exception as e:
                TestLogger.error(f"Error testing teacher access: {str(e)}")

        return results

    def test_course_progress(self, course_id):
        if not self.student_token:
            TestLogger.error("Student token required for progress tracking")
            return None

        url = f"{self.BASE_URL}/courses/courses/{course_id}/progress/"
        headers = {'Authorization': f'Bearer {self.student_token}'}
        
        try:
            response = requests.get(url, headers=headers)
            return self.handle_response(response, "Course Progress")
        except Exception as e:
            TestLogger.error(f"Error getting course progress: {str(e)}")
            return None

def run_analytics_tests():
    tester = CourseAnalyticsTester()
    
    # Login as teacher
    tester.teacher_token = tester.login("newuser2@example.com", "NewPass123!", "teacher")
    if not tester.teacher_token:
        TestLogger.error("Teacher login failed. Stopping tests.")
        return

    # Create test course
    category_id = tester.create_category("Test Category", "Test category for analytics")
    if not category_id:
        TestLogger.error("Failed to create category")
        return

    course_id = tester.create_course(
        "Test Analytics Course",
        "Course for testing analytics features",
        category_id,
        status="published"
    )
    if not course_id:
        TestLogger.error("Failed to create course")
        return

    # Login as student
    tester.student_token = tester.login("student@example.com", "StudentPass123!", "student")
    if not tester.student_token:
        TestLogger.error("Student login failed")
        return

    # Test course visibility
    TestLogger.log("Testing course visibility...")
    visibility_results = tester.get_course_visibility(course_id)
    for user_type, result in visibility_results.items():
        if result:
            TestLogger.success(f"Course visible to {user_type}")
        else:
            TestLogger.error(f"Course not visible to {user_type}")

    # Enroll student in course
    if tester.enroll_in_course(course_id):
        TestLogger.success("Student enrolled successfully")
        
        # Test course progress
        progress = tester.test_course_progress(course_id)
        if progress:
            TestLogger.success("Successfully retrieved course progress")
        
        # Test course analytics
        analytics = tester.get_course_analytics(course_id)
        if analytics:
            TestLogger.success("Successfully retrieved course analytics")
            TestLogger.log(f"Analytics data: {json.dumps(analytics, indent=2)}")
    else:
        TestLogger.error("Failed to enroll student")

if __name__ == '__main__':
    run_analytics_tests() 