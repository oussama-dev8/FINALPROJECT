import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

class AgoraRTMTester:
    def __init__(self):
        self.teacher_token = None
        self.student_token = None
        self.room_id = None
        self.course_id = None
        self.category_id = None
        
        # Generate unique timestamp for this test run
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        self.teacher_credentials = {
            "email": f"testteacher{timestamp}@example.com",
            "password": "testpass123",
            "confirm_password": "testpass123",
            "username": f"testteacher{timestamp}",
            "first_name": "Test",
            "last_name": "Teacher",
            "user_type": "teacher"
        }
        self.student_credentials = {
            "email": f"teststudent{timestamp}@example.com",
            "password": "testpass123",
            "confirm_password": "testpass123",
            "username": f"teststudent{timestamp}",
            "first_name": "Test",
            "last_name": "Student",
            "user_type": "student"
        }

    def register_user(self, credentials):
        print(f"\nRegistering user {credentials['email']}...")
        response = requests.post(
            f"{BASE_URL}/api/auth/register/",
            json=credentials
        )
        print(f"Registration response: {response.status_code}")
        if response.status_code != 201:
            print(f"Registration error: {response.text}")
        return response

    def login_user(self, credentials):
        print(f"\nLogging in user {credentials['email']}...")
        response = requests.post(
            f"{BASE_URL}/api/auth/login/",
            json={
                "email": credentials["email"],
                "password": credentials["password"]
            }
        )
        print(f"Login response: {response.status_code}")
        if response.status_code != 200:
            print(f"Login error: {response.text}")
        else:
            print(f"Login response body: {response.text}")
            try:
                data = response.json()
                # Check for nested token structure
                if 'tokens' in data and 'access' in data['tokens']:
                    return data['tokens']['access']
                elif 'token' in data:
                    return data['token']
                elif 'access' in data:
                    return data['access']
                else:
                    print("No token found in response")
                    return None
            except Exception as e:
                print(f"Error parsing login response: {str(e)}")
                return None
        return None

    def create_category(self):
        print("\nCreating test category...")
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        category_data = {
            "name": f"Test Category {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "description": "A test category for RTM testing"
        }
        response = requests.post(
            f"{BASE_URL}/api/courses/categories/",
            json=category_data,
            headers=headers
        )
        print(f"Category creation response: {response.status_code}")
        if response.status_code != 201:
            print(f"Category creation error: {response.text}")
            return None
        self.category_id = response.json()["id"]
        return response.json()

    def create_course(self):
        print("\nCreating test course...")
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        course_data = {
            "title": "Test Course",
            "description": "A test course for RTM testing",
            "category": self.category_id,
            "difficulty_level": "beginner",
            "duration_weeks": 1,
            "max_students": 10,
            "price": "0.00",
            "status": "published"
        }
        response = requests.post(
            f"{BASE_URL}/api/courses/courses/",
            json=course_data,
            headers=headers
        )
        print(f"Course creation response: {response.status_code}")
        if response.status_code != 201:
            print(f"Course creation error: {response.text}")
            return None
        self.course_id = response.json()["id"]
        return response.json()

    def create_room(self):
        print("\nCreating video room...")
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        room_data = {
            "course": self.course_id,
            "title": "Test Room",
            "description": "A test video room",
            "max_participants": 10
        }
        response = requests.post(
            f"{BASE_URL}/api/video-rooms/rooms/",
            json=room_data,
            headers=headers
        )
        print(f"Room creation response: {response.status_code}")
        if response.status_code != 201:
            print(f"Room creation error: {response.text}")
            return None
        
        # Get the room data directly from the response
        room_response_data = response.json()
        print(f"Room creation response data: {room_response_data}")
        self.room_id = room_response_data.get('id')
        
        if not self.room_id:
            print("Room ID not found in response, trying to fetch from list...")
            # Fallback: Get room details from list
            rooms_response = requests.get(
                f"{BASE_URL}/api/video-rooms/rooms/",
                headers=headers
            )
            print(f"Rooms list response: {rooms_response.status_code}")
            if rooms_response.status_code == 200:
                rooms_data = rooms_response.json()
                print(f"Rooms list data: {rooms_data}")
                
                if 'results' in rooms_data and rooms_data['results']:
                    # Find the room we just created (it should be the most recent one)
                    for room in rooms_data['results']:
                        if (room['title'] == room_data['title'] and 
                            room['description'] == room_data['description']):
                            self.room_id = room['id']
                            print(f"Found room with ID: {self.room_id}")
                            return room
                elif isinstance(rooms_data, list) and rooms_data:
                    # Handle case where response is directly a list
                    for room in rooms_data:
                        if (room['title'] == room_data['title'] and 
                            room['description'] == room_data['description']):
                            self.room_id = room['id']
                            print(f"Found room with ID: {self.room_id}")
                            return room
                else:
                    print("No rooms found in response")
            else:
                print(f"Failed to fetch rooms list: {rooms_response.text}")
            
            print("Could not find room ID")
            return None
        
        print(f"Room created successfully with ID: {self.room_id}")
        return room_response_data

    def join_room(self, token):
        print("\nJoining room...")
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(
            f"{BASE_URL}/api/video-rooms/rooms/{self.room_id}/join/",
            headers=headers
        )
        print(f"Join room response: {response.status_code}")
        if response.status_code != 200:
            print(f"Join room error: {response.text}")
        return response

    def generate_rtm_token(self, token):
        print("\nGenerating RTM token...")
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(
            f"{BASE_URL}/api/video-rooms/token/",
            json={"room_id": self.room_id, "token_type": "rtm"},
            headers=headers
        )
        print(f"Token generation response: {response.status_code}")
        if response.status_code != 200:
            print(f"Token generation error: {response.text}")
        return response

    def enroll_student(self):
        print("\nEnrolling student in course...")
        headers = {"Authorization": f"Bearer {self.student_token}"}
        response = requests.post(
            f"{BASE_URL}/api/courses/courses/{self.course_id}/enroll/",
            headers=headers
        )
        print(f"Enrollment response: {response.status_code}")
        if response.status_code != 201:
            print(f"Enrollment error: {response.text}")
            return None
        return response.json()

    def cleanup(self):
        print("\nCleaning up test data...")
        if self.teacher_token:
            headers = {"Authorization": f"Bearer {self.teacher_token}"}
            
            # Delete the course first (this will cascade delete the room)
            if self.course_id:
                response = requests.delete(
                    f"{BASE_URL}/api/courses/courses/{self.course_id}/",
                    headers=headers
                )
                print(f"Course deletion response: {response.status_code}")

            # Then delete the category
            if self.category_id:
                response = requests.delete(
                    f"{BASE_URL}/api/courses/categories/{self.category_id}/",
                    headers=headers
                )
                print(f"Category deletion response: {response.status_code}")

            # Delete the teacher account
            response = requests.delete(
                f"{BASE_URL}/api/auth/account/",
                headers=headers
            )
            print(f"Teacher account deletion response: {response.status_code}")

        # Delete the student account
        if self.student_token:
            headers = {"Authorization": f"Bearer {self.student_token}"}
            response = requests.delete(
                f"{BASE_URL}/api/auth/account/",
                headers=headers
            )
            print(f"Student account deletion response: {response.status_code}")

    def test_authentication(self):
        print("\nTest 1.0: Register teacher")
        response = self.register_user(self.teacher_credentials)
        assert response.status_code == 201, "Teacher registration failed"

        print("\nTest 1.1: Teacher login")
        self.teacher_token = self.login_user(self.teacher_credentials)
        assert self.teacher_token is not None, "Teacher login failed"

        print("\nTest 1.2: Register student")
        response = self.register_user(self.student_credentials)
        assert response.status_code == 201, "Student registration failed"

        print("\nTest 1.3: Student login")
        self.student_token = self.login_user(self.student_credentials)
        assert self.student_token is not None, "Student login failed"

    def test_rtm_token_generation(self):
        print("\nTest 2.0: Create category")
        if not self.create_category():
            print("Test failed: Category creation failed")
            return

        print("\nTest 2.1: Create course")
        if not self.create_course():
            print("Test failed: Course creation failed")
            return

        print("\nTest 2.2: Create room")
        if not self.create_room():
            print("Test failed: Room creation failed")
            return

        print("\nTest 2.2.1: Test room retrieval")
        self.test_room_retrieval()

        print("\nTest 2.3: Teacher joins room")
        teacher_join = self.join_room(self.teacher_token)
        if not teacher_join:
            print("Test failed: Teacher failed to join room")
            return

        print("\nTest 2.4: Generate teacher's RTM token")
        teacher_token = self.generate_rtm_token(self.teacher_token)
        if not teacher_token:
            print("Test failed: Failed to generate teacher's RTM token")
            return

        print("\nTest 2.5: Enroll student in course")
        if not self.enroll_student():
            print("Test failed: Student enrollment failed")
            return

        print("\nTest 2.6: Student joins room")
        student_join = self.join_room(self.student_token)
        if not student_join:
            print("Test failed: Student failed to join room")
            return

        print("\nTest 2.7: Generate student's RTM token")
        student_token = self.generate_rtm_token(self.student_token)
        if not student_token:
            print("Test failed: Failed to generate student's RTM token")
            return

        print("\nTest 2.8: Test participants endpoint")
        self.test_participants_endpoint()

    def test_room_retrieval(self):
        print("\nTesting room retrieval...")
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        
        # Test getting all rooms
        response = requests.get(
            f"{BASE_URL}/api/video-rooms/rooms/",
            headers=headers
        )
        print(f"Get rooms response: {response.status_code}")
        if response.status_code == 200:
            rooms_data = response.json()
            print(f"Rooms data: {rooms_data}")
            
            if 'results' in rooms_data:
                print(f"Found {len(rooms_data['results'])} rooms")
                for room in rooms_data['results']:
                    print(f"Room: {room['id']} - {room['title']} (Host: {room['host']['id']})")
            elif isinstance(rooms_data, list):
                print(f"Found {len(rooms_data)} rooms")
                for room in rooms_data:
                    print(f"Room: {room['id']} - {room['title']} (Host: {room['host']['id']})")
        else:
            print(f"Failed to get rooms: {response.text}")
        
        # Test getting specific room details if we have a room_id
        if self.room_id:
            print(f"\nTesting specific room retrieval for room {self.room_id}...")
            response = requests.get(
                f"{BASE_URL}/api/video-rooms/rooms/{self.room_id}/",
                headers=headers
            )
            print(f"Get room details response: {response.status_code}")
            if response.status_code == 200:
                room_data = response.json()
                print(f"Room details: {room_data}")
            else:
                print(f"Failed to get room details: {response.text}")

    def test_participants_endpoint(self):
        print("\nTesting participants endpoint...")
        if not self.room_id:
            print("No room ID available, skipping participants test")
            return
            
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        
        # Test getting participants
        response = requests.get(
            f"{BASE_URL}/api/video-rooms/rooms/{self.room_id}/participants/",
            headers=headers
        )
        print(f"Get participants response: {response.status_code}")
        if response.status_code == 200:
            participants_data = response.json()
            print(f"Participants data: {participants_data}")
            print(f"Number of participants: {len(participants_data)}")
            for participant in participants_data:
                print(f"Participant: {participant['user']['full_name']} (Role: {participant['role']})")
        else:
            print(f"Failed to get participants: {response.text}")

    def run_all_tests(self):
        try:
            self.test_authentication()
            self.test_rtm_token_generation()
            print("\nAll tests passed successfully!")
        except AssertionError as e:
            print(f"\nTest failed: {str(e)}")
        except Exception as e:
            print(f"\nUnexpected error: {str(e)}")
        finally:
            self.cleanup()

if __name__ == "__main__":
    tester = AgoraRTMTester()
    tester.run_all_tests() 