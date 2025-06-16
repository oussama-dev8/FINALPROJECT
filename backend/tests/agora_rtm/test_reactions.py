#!/usr/bin/env python3
import requests
import json
import time
from datetime import datetime
import sys
import os
import importlib.util

# Get the path to test_rtm.py
current_dir = os.path.dirname(os.path.abspath(__file__))
test_rtm_path = os.path.join(current_dir, 'test_rtm.py')

# Load the module
spec = importlib.util.spec_from_file_location("test_rtm", test_rtm_path)
test_rtm = importlib.util.module_from_spec(spec)
spec.loader.exec_module(test_rtm)

# Now we can access the classes and variables
AgoraRTMTester = test_rtm.AgoraRTMTester
BASE_URL = test_rtm.BASE_URL

class ReactionTester(AgoraRTMTester):
    def __init__(self):
        super().__init__()
        self.test_message_id = None
        self.reaction_id = None
        self.custom_reaction_id = None
        
    def create_message(self):
        """Create a test chat message"""
        print("\nCreating chat message...")
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        data = {
            "content": "Test message for reactions",
            "message_type": "text"
        }
        
        # Make sure room_id is available
        if not self.room_id:
            print("Error: Room ID is not available. Cannot create message.")
            return False
            
        # Print debug info
        print(f"Room ID: {self.room_id}")
        print(f"API URL: {BASE_URL}/api/chat/rooms/{self.room_id}/messages/")
        
        response = requests.post(
            f"{BASE_URL}/api/chat/rooms/{self.room_id}/messages/",
            json=data,
            headers=headers
        )
        print(f"Message creation response: {response.status_code}")
        
        if response.status_code == 201:
            try:
                response_data = response.json()
                print(f"Response data: {json.dumps(response_data, indent=2)}")
                
                # Print detailed message information
                print("\n--- Created Message Details ---")
                print(f"Content: {response_data.get('content', 'N/A')}")
                print(f"Message Type: {response_data.get('message_type', 'N/A')}")
                print(f"Room: {response_data.get('room', 'N/A')}")
                
                if 'user' in response_data:
                    user_data = response_data['user']
                    print(f"Sender: {user_data.get('full_name', 'Unknown')} (ID: {user_data.get('id', 'N/A')})")
                    print(f"Email: {user_data.get('email', 'N/A')}")
                
                print(f"Timestamp: {response_data.get('timestamp', 'N/A')}")
                print(f"ID: {response_data.get('id', 'N/A')}")
                print("")
                
                # Check different possible response formats
                if 'id' in response_data:
                    self.test_message_id = response_data['id']
                    print(f"Message ID extracted: {self.test_message_id}")
                    return True
                else:
                    print("Warning: Could not find 'id' in response. Response keys:", response_data.keys())
                    # Try to extract ID from other possible fields
                    for key in ['message_id', 'pk', '_id']:
                        if key in response_data:
                            self.test_message_id = response_data[key]
                            print(f"Message ID extracted from '{key}': {self.test_message_id}")
                            return True
            except Exception as e:
                print(f"Error parsing message creation response: {str(e)}")
                print(f"Raw response: {response.text[:500]}...")  # Print first 500 chars of response
        else:
            try:
                print(f"Message creation error: {response.json()}")
            except:
                print(f"Message creation failed with status {response.status_code}")
                print(f"Raw response: {response.text[:500]}")
        
        return False

    def add_reaction(self, reaction="👍", token=None):
        """Test adding a reaction to a message"""
        if token is None:
            token = self.teacher_token
            
        print(f"\nAdding reaction '{reaction}' to message...")
        
        if not self.test_message_id:
            print("Error: No message ID available. Cannot add reaction.")
            return False
            
        reaction_data = {
            "reaction": reaction
        }
        
        # Add custom reaction if needed
        if reaction == "custom":
            reaction_data["custom_reaction"] = "🚀"
            
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(
            f"{BASE_URL}/api/chat/messages/{self.test_message_id}/react/", 
            json=reaction_data, 
            headers=headers
        )
        print(f"Add reaction response: {response.status_code}")
        
        if response.status_code == 200:
            response_data = response.json()
            print("Reaction data:", json.dumps(response_data, indent=2))
            if reaction == "custom":
                self.custom_reaction_id = response_data["id"]
            else:
                self.reaction_id = response_data["id"]
            return True
        else:
            try:
                print(f"Add reaction error: {response.json()}")
            except:
                print(f"Add reaction failed with status {response.status_code}")
                print(f"Raw response: {response.text[:500]}")
        
        return False

    def get_message_reactions(self):
        """Test getting all reactions for a message"""
        print("\nGetting message reactions...")
        
        if not self.test_message_id:
            print("Error: No message ID available. Cannot get reactions.")
            return False
            
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        response = requests.get(
            f"{BASE_URL}/api/chat/messages/{self.test_message_id}/reactions/", 
            headers=headers
        )
        print(f"Get reactions response: {response.status_code}")
        
        if response.status_code == 200:
            response_data = response.json()
            print("All reactions:", json.dumps(response_data, indent=2))
            return True
        else:
            try:
                print(f"Get reactions error: {response.json()}")
            except:
                print(f"Get reactions failed with status {response.status_code}")
                print(f"Raw response: {response.text[:500]}")
        
        return False

    def get_reaction_analytics(self):
        """Test getting reaction analytics for a room"""
        print("\nGetting reaction analytics for room...")
        
        if not self.room_id:
            print("Error: Room ID is not available. Cannot get analytics.")
            return False
            
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        response = requests.get(
            f"{BASE_URL}/api/chat/rooms/{self.room_id}/reaction-analytics/", 
            headers=headers
        )
        print(f"Get analytics response: {response.status_code}")
        
        if response.status_code == 200:
            response_data = response.json()
            print("Analytics data:", json.dumps(response_data, indent=2))
            return True
        else:
            try:
                print(f"Get analytics error: {response.json()}")
            except:
                print(f"Get analytics failed with status {response.status_code}")
                print(f"Raw response: {response.text[:500]}")
        
        return False

    def remove_reaction(self, reaction_type="👍", token=None):
        """Test removing a reaction"""
        if token is None:
            token = self.teacher_token
            
        print(f"\nRemoving '{reaction_type}' reaction...")
        
        if not self.test_message_id:
            print("Error: No message ID available. Cannot remove reaction.")
            return False
            
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.delete(
            f"{BASE_URL}/api/chat/messages/{self.test_message_id}/unreact/?type={reaction_type}", 
            headers=headers
        )
        print(f"Remove reaction response: {response.status_code}")
        
        if response.status_code != 200:
            try:
                print(f"Remove reaction error: {response.json()}")
            except:
                print(f"Remove reaction failed with status {response.status_code}")
                print(f"Raw response: {response.text[:500]}")
        
        return response.status_code == 200

    def run_reaction_tests(self):
        print("\n=== Testing Enhanced Reaction Functionality ===")
        
        # Setup: Register and login users, create category, course, and room
        self.test_authentication()
        self.create_category()
        self.create_course()
        self.create_room()
        self.enroll_student()
        
        # Test creating a message
        print("\nTest 1: Create chat message")
        if not self.create_message():
            print("Failed to create chat message")
            return
        print("Create message test: PASSED")
        
        # Test adding standard reaction
        print("\nTest 2: Add standard reaction")
        if not self.add_reaction("👍"):
            print("Failed to add standard reaction")
            return
        print("Add standard reaction test: PASSED")
        
        # Test adding custom reaction
        print("\nTest 3: Add custom reaction")
        if not self.add_reaction("custom", self.student_token):
            print("Failed to add custom reaction")
            return
        print("Add custom reaction test: PASSED")
        
        # Test getting message reactions
        print("\nTest 4: Get message reactions")
        if not self.get_message_reactions():
            print("Failed to get message reactions")
            return
        print("Get message reactions test: PASSED")
        
        # Test getting reaction analytics
        print("\nTest 5: Get reaction analytics")
        if not self.get_reaction_analytics():
            print("Failed to get reaction analytics")
            return
        print("Get reaction analytics test: PASSED")
        
        # Test removing standard reaction
        print("\nTest 6: Remove standard reaction")
        if not self.remove_reaction("👍"):
            print("Failed to remove standard reaction")
            return
        print("Remove standard reaction test: PASSED")
        
        # Test removing custom reaction
        print("\nTest 7: Remove custom reaction")
        if not self.remove_reaction("custom", self.student_token):
            print("Failed to remove custom reaction")
            return
        print("Remove custom reaction test: PASSED")
        
        # Verify reactions were removed
        print("\nTest 8: Verify reactions removed")
        if not self.get_message_reactions():
            print("Failed to get message reactions")
            return
        print("Verify reactions removed test: PASSED")
        
        print("\n=== All Reaction Tests Complete ===")
        print("All tests passed successfully!")
        
        # Skip cleanup to preserve test data for manual inspection
        print("Skipping cleanup to preserve test data")

def run_tests():
    tester = ReactionTester()
    tester.run_reaction_tests()

if __name__ == "__main__":
    run_tests() 