import requests
import json
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

class ChatTester(AgoraRTMTester):
    def __init__(self):
        super().__init__()
        self.test_message_id = None
        self.message_created = False
        self.reaction_id = None
        self.custom_reaction_id = None

    def create_message(self, token, content="Test message"):
        print("\nCreating chat message...")
        headers = {"Authorization": f"Bearer {token}"}
        data = {
            "content": content,
            "message_type": "text",
            "room": str(self.room_id),
            "room_id": self.room_id
        }
        
        # Make sure room_id is available
        if not self.room_id:
            print("Error: Room ID is not available. Cannot create message.")
            return None
            
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
                    self.message_created = True
                else:
                    print("Warning: Could not find 'id' in response. Response keys:", response_data.keys())
                    # Try to extract ID from other possible fields
                    for key in ['message_id', 'pk', '_id']:
                        if key in response_data:
                            self.test_message_id = response_data[key]
                            print(f"Message ID extracted from '{key}': {self.test_message_id}")
                            self.message_created = True
                            break
            except Exception as e:
                print(f"Error parsing message creation response: {str(e)}")
                print(f"Raw response: {response.text[:500]}...")  # Print first 500 chars of response
        else:
            print(f"Message creation error: {response.text}")
            
        return response

    def list_messages(self, token):
        print("\nListing chat messages...")
        headers = {"Authorization": f"Bearer {token}"}
        
        if not self.room_id:
            print("Error: Room ID is not available. Cannot list messages.")
            return None
            
        response = requests.get(
            f"{BASE_URL}/api/chat/rooms/{self.room_id}/messages/",
            headers=headers
        )
        print(f"List messages response: {response.status_code}")
        
        if response.status_code == 200:
            try:
                messages = response.json()
                
                if isinstance(messages, dict) and 'results' in messages:
                    # Handle paginated response
                    message_list = messages.get('results', [])
                    print(f"Found {len(message_list)} messages in paginated response")
                else:
                    # Handle non-paginated list
                    message_list = messages
                    print(f"Found {len(message_list)} messages")
                
                # Print details of each message
                print("\n--- Message Details ---")
                for idx, msg in enumerate(message_list):
                    print(f"Message {idx+1}:")
                    print(f"  ID: {msg.get('id', 'N/A')}")
                    print(f"  Content: {msg.get('content', 'N/A')}")
                    print(f"  From: {msg.get('user_name', 'Unknown')} (User ID: {msg.get('user', {}).get('id', 'N/A')})")
                    print(f"  Room: {msg.get('room', 'N/A')}")
                    print(f"  Time: {msg.get('timestamp', 'N/A')}")
                    print(f"  Message Type: {msg.get('message_type', 'N/A')}")
                    print(f"  Edited: {msg.get('is_edited', False)}")
                    
                    # Print reactions if any
                    reactions = msg.get('reactions', [])
                    if reactions:
                        print(f"  Reactions: {len(reactions)}")
                        for reaction in reactions:
                            print(f"    {reaction.get('reaction', '?')} by {reaction.get('user', {}).get('full_name', 'Unknown')}")
                    print("")
                
                # If we don't have a message ID yet, try to get one from the list
                if not self.test_message_id and message_list:
                    if len(message_list) > 0:
                        if 'id' in message_list[0]:
                            self.test_message_id = message_list[0]['id']
                            print(f"Using message ID from list: {self.test_message_id}")
                            self.message_created = True
                        else:
                            print("Warning: Message object doesn't have 'id' field. Keys:", message_list[0].keys())
            except Exception as e:
                print(f"Error parsing message list response: {str(e)}")
                print(f"Raw response: {response.text[:500]}...")  # Print first 500 chars of response
        else:
            print(f"List messages error: {response.text}")
            
        return response

    def add_reaction(self, token, reaction="👍", custom_reaction=None):
        """Test adding a reaction to a message"""
        print(f"\nAdding reaction '{reaction}' to message...")
        
        if not self.test_message_id:
            print("Error: No message ID available. Cannot add reaction.")
            return None
            
        reaction_data = {
            "reaction": reaction
        }
        
        # Add custom reaction if needed
        if reaction == "custom" and custom_reaction:
            reaction_data["custom_reaction"] = custom_reaction
            
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.post(
            f"{BASE_URL}/api/chat/messages/{self.test_message_id}/react/", 
            json=reaction_data, 
            headers=headers
        )
        print(f"Add reaction response: {response.status_code}")
        
        if response.status_code == 200:
            try:
                response_data = response.json()
                print("Reaction data:", json.dumps(response_data, indent=2))
                if reaction == "custom":
                    self.custom_reaction_id = response_data.get("id")
                else:
                    self.reaction_id = response_data.get("id")
            except Exception as e:
                print(f"Error parsing reaction response: {str(e)}")
        else:
            print(f"Add reaction error: {response.text}")
        
        return response

    def get_message_reactions(self, token):
        """Test getting all reactions for a message"""
        print("\nGetting message reactions...")
        
        if not self.test_message_id:
            print("Error: No message ID available. Cannot get reactions.")
            return None
            
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{BASE_URL}/api/chat/messages/{self.test_message_id}/reactions/", 
            headers=headers
        )
        print(f"Get reactions response: {response.status_code}")
        
        if response.status_code == 200:
            try:
                response_data = response.json()
                print("All reactions:", json.dumps(response_data, indent=2))
            except Exception as e:
                print(f"Error parsing reactions response: {str(e)}")
        else:
            print(f"Get reactions error: {response.text}")
        
        return response

    def get_reaction_analytics(self, token):
        """Test getting reaction analytics for a room"""
        print("\nGetting reaction analytics for room...")
        
        if not self.room_id:
            print("Error: Room ID is not available. Cannot get analytics.")
            return None
            
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{BASE_URL}/api/chat/rooms/{self.room_id}/reaction-analytics/", 
            headers=headers
        )
        print(f"Get analytics response: {response.status_code}")
        
        if response.status_code == 200:
            try:
                response_data = response.json()
                print("Analytics data:", json.dumps(response_data, indent=2))
            except Exception as e:
                print(f"Error parsing analytics response: {str(e)}")
        else:
            print(f"Get analytics error: {response.text}")
        
        return response

    def remove_reaction(self, token, reaction_type=None):
        """Test removing a reaction"""
        print(f"\nRemoving {reaction_type if reaction_type else 'all'} reactions...")
        
        if not self.test_message_id:
            print("Error: No message ID available. Cannot remove reaction.")
            return None
            
        headers = {"Authorization": f"Bearer {token}"}
        url = f"{BASE_URL}/api/chat/messages/{self.test_message_id}/unreact/"
        
        if reaction_type:
            url += f"?type={reaction_type}"
            
        response = requests.delete(url, headers=headers)
        print(f"Remove reaction response: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Remove reaction error: {response.text}")
        
        return response

    def edit_message(self, token, new_content="Edited message"):
        print("\nEditing message...")
        
        if not self.test_message_id:
            print("Error: No message ID available. Cannot edit message.")
            return None
            
        headers = {"Authorization": f"Bearer {token}"}
        data = {"content": new_content}
        response = requests.put(
            f"{BASE_URL}/api/chat/messages/{self.test_message_id}/edit/",
            json=data,
            headers=headers
        )
        print(f"Edit message response: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Edit message error: {response.text}")
            
        return response

    def delete_message(self, token):
        print("\nDeleting message...")
        
        if not self.test_message_id:
            print("Error: No message ID available. Cannot delete message.")
            return None
            
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.delete(
            f"{BASE_URL}/api/chat/messages/{self.test_message_id}/delete/",
            headers=headers
        )
        print(f"Delete message response: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Delete message error: {response.text}")
            
        return response

    def run_chat_tests(self):
        print("\n=== Testing Chat Functionality ===")
        
        # Setup: Register and login users, create category, course, and room
        self.test_authentication()
        self.create_category()
        self.create_course()
        self.create_room()
        self.enroll_student()
        
        # Test creating a message
        create_response = self.create_message(self.teacher_token)
        if create_response:
            print(f"Create message test: {'PASSED' if create_response.status_code == 201 else 'FAILED'}")
        else:
            print("Create message test: SKIPPED (setup error)")
        
        # Test listing messages
        list_response = self.list_messages(self.teacher_token)
        if list_response:
            print(f"List messages test: {'PASSED' if list_response.status_code == 200 else 'FAILED'}")
        else:
            print("List messages test: SKIPPED (setup error)")
            
        # Test adding standard reaction
        add_reaction_response = self.add_reaction(self.teacher_token, "👍")
        if add_reaction_response:
            print(f"Add standard reaction test: {'PASSED' if add_reaction_response.status_code == 200 else 'FAILED'}")
        else:
            print("Add standard reaction test: SKIPPED (setup error)")
            
        # Test adding custom reaction
        add_custom_reaction_response = self.add_reaction(self.student_token, "custom", "🚀")
        if add_custom_reaction_response:
            print(f"Add custom reaction test: {'PASSED' if add_custom_reaction_response.status_code == 200 else 'FAILED'}")
        else:
            print("Add custom reaction test: SKIPPED (setup error)")
            
        # Test getting message reactions
        get_reactions_response = self.get_message_reactions(self.teacher_token)
        if get_reactions_response:
            print(f"Get message reactions test: {'PASSED' if get_reactions_response.status_code == 200 else 'FAILED'}")
        else:
            print("Get message reactions test: SKIPPED (setup error)")
            
        # Test getting reaction analytics
        get_analytics_response = self.get_reaction_analytics(self.teacher_token)
        if get_analytics_response:
            print(f"Get reaction analytics test: {'PASSED' if get_analytics_response.status_code == 200 else 'FAILED'}")
        else:
            print("Get reaction analytics test: SKIPPED (setup error)")
            
        # Test removing standard reaction
        remove_reaction_response = self.remove_reaction(self.teacher_token, "👍")
        if remove_reaction_response:
            print(f"Remove standard reaction test: {'PASSED' if remove_reaction_response.status_code == 200 else 'FAILED'}")
        else:
            print("Remove standard reaction test: SKIPPED (setup error)")
            
        # Test removing custom reaction
        remove_custom_reaction_response = self.remove_reaction(self.student_token, "custom")
        if remove_custom_reaction_response:
            print(f"Remove custom reaction test: {'PASSED' if remove_custom_reaction_response.status_code == 200 else 'FAILED'}")
        else:
            print("Remove custom reaction test: SKIPPED (setup error)")
        
        # Test editing message
        edit_response = self.edit_message(self.teacher_token, "Edited test message")
        if edit_response:
            print(f"Edit message test: {'PASSED' if edit_response.status_code == 200 else 'FAILED'}")
        else:
            print("Edit message test: SKIPPED (setup error)")
            
        # Test deleting message
        delete_response = self.delete_message(self.teacher_token)
        if delete_response:
            print(f"Delete message test: {'PASSED' if delete_response.status_code == 200 else 'FAILED'}")
        else:
            print("Delete message test: SKIPPED (setup error)")
            
        print("\n=== Chat Tests Complete ===")
        
        # Skip cleanup to preserve test data for manual inspection
        print("Skipping cleanup to preserve test data")

def run_chat_tests():
    try:
        tester = ChatTester()
        tester.run_chat_tests()
    except Exception as e:
        print(f"Error during chat tests: {str(e)}")
        import traceback
        traceback.print_exc()
    # Skip cleanup
    # finally:
    #     print("Cleaning up test data...")
    #     if hasattr(tester, 'course_id') and tester.course_id:
    #         tester.delete_course(tester.teacher_token)
    #     if hasattr(tester, 'category_id') and tester.category_id:
    #         tester.delete_category(tester.teacher_token)
    #     if hasattr(tester, 'teacher_id') and tester.teacher_id:
    #         tester.delete_user(tester.teacher_token, tester.teacher_id)
    #     if hasattr(tester, 'student_id') and tester.student_id:
    #         tester.delete_user(tester.teacher_token, tester.student_id)

if __name__ == "__main__":
    run_chat_tests() 