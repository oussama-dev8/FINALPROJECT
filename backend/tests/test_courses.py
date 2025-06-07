import requests
import json
from test_utils import BaseAPITest, TestLogger
from test_auth import AuthTest
from datetime import datetime

class CourseTest(AuthTest):
    def test_create_category(self, name, description):
        if not self.access_token:
            TestLogger.error("Teacher token required for category creation")
            return None

        url = f"{self.BASE_URL}/courses/categories/"
        data = {
            'name': name,
            'description': description
        }

        try:
            response = requests.post(url, json=data, headers=self.get_headers())
            result = self.handle_response(response, "Create Category")
            return result['id'] if result else None
        except Exception as e:
            TestLogger.error(f"Error in category creation: {str(e)}")
            return None

    def test_list_categories(self):
        url = f"{self.BASE_URL}/courses/categories/"
        try:
            response = requests.get(url)
            return self.handle_response(response, "List Categories")
        except Exception as e:
            TestLogger.error(f"Error listing categories: {str(e)}")
            return None

    def test_create_course(self, title, description, category, **kwargs):
        url = f"{self.BASE_URL}/courses/courses/"
        data = {
            "title": title,
            "description": description,
            "category": category,
            "difficulty_level": kwargs.get("difficulty_level", "beginner"),
            "duration_weeks": kwargs.get("duration_weeks", 8),
            "max_students": kwargs.get("max_students", 50),
            "price": kwargs.get("price", 49.99),
            "status": kwargs.get("status", "published")
        }
        
        try:
            TestLogger.log(f"Creating course with data: {json.dumps(data, indent=2)}")
            response = requests.post(url, json=data, headers=self.get_headers())
            
            if response.status_code == 201:
                result = response.json()
                TestLogger.log(f"Course creation response: {json.dumps(result, indent=2)}")
                course_id = result.get('id')
                if course_id:
                    TestLogger.success(f"Course created with ID: {course_id}")
                    return course_id
                else:
                    TestLogger.error(f"Course ID not found in response: {result}")
            else:
                TestLogger.error(f"Course creation failed with status {response.status_code}: {response.text}")
            return None
        except Exception as e:
            TestLogger.error(f"Error in course creation: {str(e)}")
            return None

    def test_list_courses(self, **filters):
        url = f"{self.BASE_URL}/courses/courses/"
        try:
            response = requests.get(url, params=filters, headers=self.get_headers())
            return self.handle_response(response, "List Courses")
        except Exception as e:
            TestLogger.error(f"Error listing courses: {str(e)}")
            return None

    def test_get_course_details(self, course_id):
        url = f"{self.BASE_URL}/courses/courses/{course_id}/"
        try:
            response = requests.get(url, headers=self.get_headers())
            return self.handle_response(response, "Get Course Details")
        except Exception as e:
            TestLogger.error(f"Error getting course details: {str(e)}")
            return None

    def test_update_course(self, course_id, **kwargs):
        if not self.access_token:
            TestLogger.error("Teacher token required for course update")
            return None

        url = f"{self.BASE_URL}/courses/courses/{course_id}/"
        data = {k: v for k, v in kwargs.items() if v is not None}

        try:
            response = requests.patch(url, json=data, headers=self.get_headers())
            return self.handle_response(response, "Update Course")
        except Exception as e:
            TestLogger.error(f"Error updating course: {str(e)}")
            return None

    def test_delete_course(self, course_id):
        if not self.access_token:
            TestLogger.error("Teacher token required for course deletion")
            return None

        url = f"{self.BASE_URL}/courses/courses/{course_id}/"
        try:
            response = requests.delete(url, headers=self.get_headers())
            return self.handle_response(response, "Delete Course")
        except Exception as e:
            TestLogger.error(f"Error deleting course: {str(e)}")
            return None

def run_course_tests():
    TestLogger.log("\n=== Running Course Tests ===")
    tester = CourseTest()
    
    # First register and login as teacher
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    teacher_email = f"courseteacher{timestamp}@example.com"
    teacher_password = "TeacherPass123!"
    
    teacher_reg = tester.test_register(
        teacher_email,
        teacher_password,
        user_type="teacher",
        first_name="Course",
        last_name="Teacher",
        username=f"courseteacher{timestamp}"
    )
    if not teacher_reg:
        TestLogger.error("Teacher registration failed. Stopping tests.")
        return
    
    # Login as teacher
    login_result = tester.test_login(teacher_email, teacher_password)
    if not login_result:
        TestLogger.error("Teacher login failed. Stopping tests.")
        return
    
    TestLogger.success("Teacher login successful")

    # Test category creation with unique name
    category_name = f"Programming {timestamp}"
    category_id = tester.test_create_category(
        category_name,
        "Computer programming and software development courses"
    )
    if category_id:
        TestLogger.success(f"Category created with ID: {category_id}")
        
        # Test category listing
        categories = tester.test_list_categories()
        if categories:
            TestLogger.success(f"Found {len(categories.get('results', []))} categories")
        
        # Test course creation
        course_id = tester.test_create_course(
            "Python Programming Basics",
            "Learn the fundamentals of Python programming",
            category_id,
            difficulty_level="beginner",
            duration_weeks=8,
            max_students=50,
            price=49.99,
            status="published"
        )
        
        if course_id:
            TestLogger.success(f"Course created with ID: {course_id}")
            
            # Test course listing
            courses = tester.test_list_courses()
            if courses:
                TestLogger.success(f"Found {len(courses.get('results', []))} courses")
            
            # Test course details
            details = tester.test_get_course_details(course_id)
            if details:
                TestLogger.success("Successfully retrieved course details")
            
            # Test course update
            update = tester.test_update_course(
                course_id,
                title="Updated: Python Programming Basics",
                price=59.99
            )
            if update:
                TestLogger.success("Course update successful")
            
            # Test course deletion
            if tester.test_delete_course(course_id):
                TestLogger.success("Course deletion successful")

if __name__ == '__main__':
    run_course_tests() 