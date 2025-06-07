import requests
from test_utils import BaseAPITest, TestLogger
from test_auth import AuthTest
from test_courses import CourseTest
from datetime import datetime

class LessonTest(CourseTest):
    def test_create_lesson(self, course_id):
        if not self.access_token:
            TestLogger.error("Authentication required for lesson creation")
            return None

        url = f"{self.BASE_URL}/courses/courses/{course_id}/lessons/"
        data = {
            'title': 'Introduction to Python',
            'description': 'Learn the basics of Python programming',
            'lesson_type': 'video',
            'order': 1,
            'duration_minutes': 60,
            'content': 'Python basics content',
            'is_published': True
        }
        
        try:
            response = requests.post(url, json=data, headers=self.get_headers())
            return self.handle_response(response, "Create Lesson")
        except Exception as e:
            TestLogger.error(f"Error in lesson creation: {str(e)}")
            return None

    def test_list_course_lessons(self, course_id):
        if not self.access_token:
            TestLogger.error("Authentication required to list lessons")
            return None

        url = f"{self.BASE_URL}/courses/courses/{course_id}/lessons/"
        
        try:
            response = requests.get(url, headers=self.get_headers())
            result = self.handle_response(response, "List Course Lessons")
            if result:
                TestLogger.success(f"Found {len(result)} lessons")
            return result
        except Exception as e:
            TestLogger.error(f"Error listing lessons: {str(e)}")
            return None

    def test_get_lesson_details(self, lesson_id):
        if not self.access_token:
            TestLogger.error("Authentication required to get lesson details")
            return None

        url = f"{self.BASE_URL}/courses/lessons/{lesson_id}/"
        
        try:
            response = requests.get(url, headers=self.get_headers())
            result = self.handle_response(response, "Get Lesson Details")
            if result:
                TestLogger.success("Successfully retrieved lesson details")
            return result
        except Exception as e:
            TestLogger.error(f"Error getting lesson details: {str(e)}")
            return None

    def test_update_lesson(self, lesson_id):
        if not self.access_token:
            TestLogger.error("Authentication required to update lesson")
            return None

        url = f"{self.BASE_URL}/courses/lessons/{lesson_id}/"
        data = {
            'title': 'Updated Python Introduction',
            'description': 'Updated Python basics lesson',
            'is_published': True
        }
        
        try:
            response = requests.patch(url, json=data, headers=self.get_headers())
            result = self.handle_response(response, "Update Lesson")
            if result:
                TestLogger.success("Lesson update successful")
            return result
        except Exception as e:
            TestLogger.error(f"Error updating lesson: {str(e)}")
            return None

    def test_delete_lesson(self, lesson_id):
        if not self.access_token:
            TestLogger.error("Authentication required to delete lesson")
            return None

        url = f"{self.BASE_URL}/courses/lessons/{lesson_id}/"
        
        try:
            response = requests.delete(url, headers=self.get_headers())
            return self.handle_response(response, "Delete Lesson")
        except Exception as e:
            TestLogger.error(f"Error deleting lesson: {str(e)}")
            return None

    def test_mark_lesson_complete(self, lesson_id):
        if not self.access_token:
            TestLogger.error("Authentication required to mark lesson complete")
            return None

        url = f"{self.BASE_URL}/courses/lessons/{lesson_id}/complete/"
        
        try:
            response = requests.post(url, headers=self.get_headers())
            return self.handle_response(response, "Mark Lesson Complete")
        except Exception as e:
            TestLogger.error(f"Error marking lesson complete: {str(e)}")
            return None

    def test_enroll_in_course(self, course_id):
        if not self.access_token:
            TestLogger.error("Authentication required for enrollment")
            return None
            
        url = f"{self.BASE_URL}/courses/courses/{course_id}/enroll/"
        headers = {'Authorization': f'Bearer {self.access_token}'}
        
        try:
            response = requests.post(url, headers=headers)
            return self.handle_response(response, "Course Enrollment")
        except Exception as e:
            TestLogger.error(f"Course enrollment failed: {str(e)}")
            return None

def run_lesson_tests():
    TestLogger.log("\n=== Running Lesson Tests ===")
    tester = LessonTest()
    
    # First create a teacher and course
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    teacher_email = f"lessonteacher{timestamp}@example.com"
    teacher_password = "TeacherPass123!"
    
    # Register and login as teacher to create course
    teacher_reg = tester.test_register(
        teacher_email,
        teacher_password,
        user_type="teacher",
        first_name="Lesson",
        last_name="Teacher",
        username=f"lessonteacher{timestamp}"
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
        "Category for lesson tests"
    )
    if not category_id:
        TestLogger.error("Category creation failed. Stopping tests.")
        return
    
    # Create a course for lessons
    course_id = tester.test_create_course(
        "Python Programming",
        "Learn Python programming from scratch",
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
    
    TestLogger.success(f"Created course with ID: {course_id}")
    
    # Create a lesson
    lesson = tester.test_create_lesson(course_id)
    if not lesson:
        TestLogger.error("Lesson creation failed. Stopping tests.")
        return
    
    TestLogger.success("Lesson creation successful")
    lesson_id = lesson['id']
    
    # List lessons
    lessons = tester.test_list_course_lessons(course_id)
    if lessons:
        TestLogger.success(f"Found {len(lessons)} lessons")
    
    # Get lesson details
    lesson_details = tester.test_get_lesson_details(lesson_id)
    if lesson_details:
        TestLogger.success("Successfully retrieved lesson details")
    
    # Update lesson
    updated_lesson = tester.test_update_lesson(lesson_id)
    if updated_lesson:
        TestLogger.success("Lesson update successful")
    
    # Register and login as student
    student_email = f"lessonstudent{timestamp}@example.com"
    student_password = "StudentPass123!"
    
    student_reg = tester.test_register(
        student_email,
        student_password,
        user_type="student",
        first_name="Lesson",
        last_name="Student",
        username=f"lessonstudent{timestamp}"
    )
    if not student_reg:
        TestLogger.error("Student registration failed. Stopping tests.")
        return
    
    # Login as student
    if not tester.test_login(student_email, student_password):
        TestLogger.error("Student login failed. Stopping tests.")
        return
    
    # Enroll student in the course
    enrollment = tester.test_enroll_in_course(course_id)
    if not enrollment:
        TestLogger.error("Course enrollment failed. Stopping tests.")
        return
    
    # Mark lesson as complete
    completion = tester.test_mark_lesson_complete(lesson_id)
    if completion:
        TestLogger.success("Successfully marked lesson as complete")
    
    # Login back as teacher to clean up
    if tester.test_login(teacher_email, teacher_password):
        # Delete lesson
        if tester.test_delete_lesson(lesson_id):
            TestLogger.success("Lesson deletion successful")
        
        # Delete course
        if tester.test_delete_course(course_id):
            TestLogger.success("Test course cleanup successful")

if __name__ == "__main__":
    run_lesson_tests() 