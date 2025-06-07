import requests
from test_utils import BaseAPITest, TestLogger
from test_auth import AuthTest
from test_courses import CourseTest
from datetime import datetime

class EnrollmentTest(CourseTest):
    def test_enroll_in_course(self, course_id):
        if not self.access_token:
            TestLogger.error("Authentication required for enrollment")
            return None

        url = f"{self.BASE_URL}/courses/courses/{course_id}/enroll/"
        
        try:
            response = requests.post(url, headers=self.get_headers())
            return self.handle_response(response, "Course Enrollment")
        except Exception as e:
            TestLogger.error(f"Error in course enrollment: {str(e)}")
            return None

    def test_unenroll_from_course(self, course_id):
        if not self.access_token:
            TestLogger.error("Authentication required for unenrollment")
            return None

        url = f"{self.BASE_URL}/courses/courses/{course_id}/unenroll/"
        
        try:
            response = requests.post(url, headers=self.get_headers())
            return self.handle_response(response, "Course Unenrollment")
        except Exception as e:
            TestLogger.error(f"Error in course unenrollment: {str(e)}")
            return None

    def test_list_enrolled_courses(self):
        if not self.access_token:
            TestLogger.error("Authentication required to list enrollments")
            return None

        url = f"{self.BASE_URL}/courses/enrolled-courses/"
        
        try:
            response = requests.get(url, headers=self.get_headers())
            return self.handle_response(response, "List Enrolled Courses")
        except Exception as e:
            TestLogger.error(f"Error listing enrolled courses: {str(e)}")
            return None

    def test_get_enrollment_progress(self, course_id):
        if not self.access_token:
            TestLogger.error("Authentication required to get progress")
            return None

        url = f"{self.BASE_URL}/courses/courses/{course_id}/progress/"
        
        try:
            response = requests.get(url, headers=self.get_headers())
            return self.handle_response(response, "Get Course Progress")
        except Exception as e:
            TestLogger.error(f"Error getting course progress: {str(e)}")
            return None

def run_enrollment_tests():
    TestLogger.log("\n=== Running Enrollment Tests ===")
    tester = EnrollmentTest()
    
    # First create a teacher and course
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    teacher_email = f"enrollteacher{timestamp}@example.com"
    teacher_password = "TeacherPass123!"
    
    # Register and login as teacher to create course
    teacher_reg = tester.test_register(
        teacher_email,
        teacher_password,
        user_type="teacher",
        first_name="Enroll",
        last_name="Teacher",
        username=f"enrollteacher{timestamp}"
    )
    if not teacher_reg:
        TestLogger.error("Teacher registration failed. Stopping tests.")
        return
    
    # Login as teacher
    if not tester.test_login(teacher_email, teacher_password):
        TestLogger.error("Teacher login failed. Stopping tests.")
        return
    
    # Create category and course
    category_name = f"Test Category {timestamp}"
    category_id = tester.test_create_category(
        category_name,
        "Category for enrollment tests"
    )
    if not category_id:
        TestLogger.error("Category creation failed. Stopping tests.")
        return
    
    # Create a course for enrollment
    course_id = tester.test_create_course(
        "Test Course",
        "Course for enrollment tests",
        category_id,
        difficulty_level="beginner",
        duration_weeks=8,
        max_students=50,
        price=49.99,
        status="published"
    )
    if not course_id:
        TestLogger.error("Course creation failed. Stopping tests.")
        return
    
    TestLogger.success(f"Created test course with ID: {course_id}")
    
    # Register a student
    student_email = f"enrollstudent{timestamp}@example.com"
    student_password = "StudentPass123!"
    
    student_reg = tester.test_register(
        student_email,
        student_password,
        user_type="student",
        first_name="Enroll",
        last_name="Student",
        username=f"enrollstudent{timestamp}"
    )
    if not student_reg:
        TestLogger.error("Student registration failed. Stopping tests.")
        return
    
    # Login as student
    login_result = tester.test_login(student_email, student_password)
    if not login_result:
        TestLogger.error("Student login failed. Stopping tests.")
        return
    
    TestLogger.success("Student login successful")

    # Test course enrollment
    enrollment = tester.test_enroll_in_course(course_id)
    if enrollment:
        TestLogger.success("Course enrollment successful")
        
        # Test enrollment listing
        enrollments = tester.test_list_enrolled_courses()
        if enrollments:
            TestLogger.success(f"Found {len(enrollments.get('results', []))} enrollments")
        
        # Test progress tracking
        progress = tester.test_get_enrollment_progress(course_id)
        if progress:
            TestLogger.success("Successfully retrieved course progress")
        
        # Test unenrollment
        if tester.test_unenroll_from_course(course_id):
            TestLogger.success("Course unenrollment successful")
    
    # Login back as teacher to clean up
    if tester.test_login(teacher_email, teacher_password):
        if tester.test_delete_course(course_id):
            TestLogger.success("Test course cleanup successful")

if __name__ == '__main__':
    run_enrollment_tests() 