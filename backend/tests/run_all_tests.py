from test_utils import TestLogger
from test_auth import run_auth_tests
from test_enrollment import run_enrollment_tests
from test_lessons import run_lesson_tests
from test_courses import run_course_tests

def run_all_tests():
    TestLogger.log("\n=== Starting All API Tests ===\n")
    
    # Run authentication tests first
    run_auth_tests()
    
    # Run course tests
    run_course_tests()
    
    # Run enrollment tests
    run_enrollment_tests()
    
    # Run lesson tests
    run_lesson_tests()
    
    TestLogger.log("\n=== All Tests Completed ===")

if __name__ == '__main__':
    run_all_tests() 