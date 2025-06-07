import requests
import json
import sys
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

class APITester:
    BASE_URL = 'http://localhost:8000/api'
    
    def __init__(self):
        self.teacher_token = None
        self.student_token = None
        self.current_category_id = None
        self.current_course_id = None

    def handle_response(self, response, context=""):
        try:
            TestLogger.log(f"{context} - Status Code: {response.status_code}")
            if response.status_code in [200, 201]:
                data = response.json()
                TestLogger.success(f"{context} successful")
                return data
            else:
                TestLogger.error(f"{context} failed: {response.text}")
                return None
        except json.JSONDecodeError:
            TestLogger.error(f"Failed to parse JSON response: {response.text}")
            return None
        except Exception as e:
            TestLogger.error(f"Unexpected error in {context}: {str(e)}")
            return None

    def login(self, email, password, user_type="teacher"):
        url = f"{self.BASE_URL}/auth/login/"
        data = {
            'email': email,
            'password': password
        }
        headers = {'Content-Type': 'application/json'}
        
        try:
            response = requests.post(url, json=data, headers=headers)
            result = self.handle_response(response, f"{user_type.capitalize()} Login")
            if result and 'tokens' in result:
                return result['tokens']['access']
            return None
        except requests.exceptions.RequestException as e:
            TestLogger.error(f"Network error during login: {str(e)}")
            return None

    def create_category(self, name, description):
        if not self.teacher_token:
            TestLogger.error("Teacher token required for category creation")
            return None

        url = f"{self.BASE_URL}/courses/categories/"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.teacher_token}'
        }
        data = {
            'name': name,
            'description': description
        }

        try:
            # First check if category exists
            response = requests.get(url)
            categories = self.handle_response(response, "Get Categories")
            if categories:
                for category in categories.get('results', []):
                    if category['name'] == name:
                        TestLogger.log(f"Category '{name}' already exists")
                        return category['id']

            # Create new category if not found
            response = requests.post(url, json=data, headers=headers)
            result = self.handle_response(response, "Create Category")
            return result['id'] if result else None
        except Exception as e:
            TestLogger.error(f"Error in category creation: {str(e)}")
            return None

    def create_course(self, title, description, category_id, **kwargs):
        if not self.teacher_token:
            TestLogger.error("Teacher token required for course creation")
            return None

        url = f"{self.BASE_URL}/courses/courses/"
        data = {
            'title': title,
            'description': description,
            'category': category_id,
            'difficulty_level': kwargs.get('difficulty_level', 'beginner'),
            'duration_weeks': kwargs.get('duration_weeks', 8),
            'max_students': kwargs.get('max_students', 50),
            'price': kwargs.get('price', 49.99),
            'status': kwargs.get('status', 'published')
        }
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.teacher_token}'
        }

        try:
            TestLogger.log(f"Creating course with data: {json.dumps(data, indent=2)}")
            response = requests.post(url, json=data, headers=headers)
            result = self.handle_response(response, "Create Course")
            
            if result:
                TestLogger.log(f"Course creation response: {json.dumps(result, indent=2)}")
                
                # Verify course status
                if 'status' in result:
                    TestLogger.log(f"Course status in response: {result['status']}")
                else:
                    TestLogger.error("Course status not found in response")
                
                # Try to get course ID from response
                course_id = result.get('id')
                if course_id:
                    TestLogger.success(f"Got course ID directly: {course_id}")
                    return course_id

                # If no ID in response, try alternate approaches
                TestLogger.log("No ID in response, trying alternate approaches...")
                
                # Try direct URL from response headers
                location = response.headers.get('Location')
                if location:
                    TestLogger.log(f"Found Location header: {location}")
                    try:
                        course_id = int(location.rstrip('/').split('/')[-1])
                        TestLogger.success(f"Extracted course ID from Location: {course_id}")
                        return course_id
                    except (ValueError, IndexError):
                        TestLogger.error("Failed to extract course ID from Location header")

                # Try listing with minimal filters
                TestLogger.log("Trying minimal filter approach...")
                courses = self.list_courses_minimal()
                if courses:
                    for course in courses:
                        if (course.get('title') == title and 
                            course.get('description') == description):
                            course_id = course.get('id')
                            TestLogger.success(f"Found course ID through listing: {course_id}")
                            return course_id
                
                TestLogger.error("Could not retrieve course ID through any method")
            return None
        except Exception as e:
            TestLogger.error(f"Error in course creation: {str(e)}")
            return None

    def list_courses_minimal(self):
        """Minimal course listing without pagination or filters"""
        url = f"{self.BASE_URL}/courses/courses/"
        headers = {
            'Authorization': f'Bearer {self.teacher_token}'
        }
        
        try:
            TestLogger.log("Attempting minimal course listing...")
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict):
                    courses = data.get('results', [])
                else:
                    courses = data
                TestLogger.log(f"Raw response: {json.dumps(data, indent=2)}")
                return courses
            else:
                TestLogger.error(f"Failed to list courses: {response.status_code}")
                return None
        except Exception as e:
            TestLogger.error(f"Error in minimal course listing: {str(e)}")
            return None

    def get_course_details(self, course_id):
        url = f"{self.BASE_URL}/courses/courses/{course_id}/"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.teacher_token}'
        }
            
        try:
            TestLogger.log(f"Requesting course details for ID: {course_id}")
            response = requests.get(url, headers=headers)
            TestLogger.log(f"Raw response: {response.text}")
            if response.status_code == 404:
                TestLogger.error(f"Course with ID {course_id} not found")
                return None
            return self.handle_response(response, "Get Course Details")
        except Exception as e:
            TestLogger.error(f"Error getting course details: {str(e)}")
            return None

    def list_courses(self, page=1, page_size=10, use_auth=True, **filters):
        url = f"{self.BASE_URL}/courses/courses/"
        params = {
            'page': page,
            'page_size': page_size
        }
        # Add any additional filters
        params.update(filters)
        
        headers = {
            'Content-Type': 'application/json'
        }
        if use_auth and self.teacher_token:
            headers['Authorization'] = f'Bearer {self.teacher_token}'
        
        try:
            TestLogger.log(f"Requesting courses with params: {params}")
            TestLogger.log(f"Using headers: {headers}")
            response = requests.get(url, params=params, headers=headers)
            TestLogger.log(f"Raw response: {response.text}")
            
            result = self.handle_response(response, "List Courses")
            if result:
                courses = result.get('results', [])
                total = result.get('count', 0)
                TestLogger.log(f"Found {total} total courses (Page {page})")
                for course in courses:
                    TestLogger.log(
                        f"Course: {course.get('title')} "
                        f"(ID: {course.get('id')}, "
                        f"Category: {course.get('category')}, "
                        f"Status: {course.get('status', 'unknown')}, "
                        f"Teacher: {course.get('teacher', 'unknown')}"
                    )
            return result
        except Exception as e:
            TestLogger.error(f"Error listing courses: {str(e)}")
            return None

    def enroll_in_course(self, course_id):
        if not self.student_token:
            TestLogger.error("Student token required for enrollment")
            return False

        url = f"{self.BASE_URL}/courses/courses/{course_id}/enroll/"
        headers = {'Authorization': f'Bearer {self.student_token}'}
        
        try:
            response = requests.post(url, headers=headers)
            result = self.handle_response(response, "Course Enrollment")
            return bool(result)
        except Exception as e:
            TestLogger.error(f"Error in course enrollment: {str(e)}")
            return False

def run_tests():
    tester = APITester()
    
    # Test teacher login
    tester.teacher_token = tester.login("newuser2@example.com", "NewPass123!", "teacher")
    if not tester.teacher_token:
        TestLogger.error("Teacher login failed. Stopping tests.")
        sys.exit(1)

    # Test category creation
    category_id = tester.create_category(
        "Programming",
        "Computer programming and software development courses"
    )
    if not category_id:
        TestLogger.error("Category creation failed. Stopping tests.")
        sys.exit(1)
    tester.current_category_id = category_id

    # Test course creation
    TestLogger.log("\nCreating new course:")
    course_id = tester.create_course(
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
        TestLogger.success(f"Successfully created course with ID: {course_id}")
        
        # Verify course details
        TestLogger.log("\nVerifying course details:")
        course_details = tester.get_course_details(course_id)
        if course_details:
            TestLogger.success("Successfully retrieved course details")
            TestLogger.log(f"Course Details: {json.dumps(course_details, indent=2)}")
        else:
            TestLogger.error("Failed to get course details")
    else:
        TestLogger.error("Failed to create course or retrieve course ID")

if __name__ == '__main__':
    run_tests() 