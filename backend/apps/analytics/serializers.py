from rest_framework import serializers
from .models import CourseAnalytics, StudentActivity, SessionAnalytics

class CourseAnalyticsSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = CourseAnalytics
        fields = [
            'course_title', 'total_enrollments', 'active_enrollments',
            'completed_enrollments', 'average_completion_rate',
            'total_revenue', 'average_rating', 'total_reviews', 'last_updated'
        ]

class StudentActivitySerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)

    class Meta:
        model = StudentActivity
        fields = [
            'id', 'student_name', 'course_title', 'lesson_title',
            'activity_type', 'duration_minutes', 'timestamp', 'metadata'
        ]

class SessionAnalyticsSerializer(serializers.ModelSerializer):
    room_title = serializers.CharField(source='room.title', read_only=True)

    class Meta:
        model = SessionAnalytics
        fields = [
            'room_title', 'total_participants', 'peak_participants',
            'average_duration_minutes', 'total_messages', 'session_rating', 'created_at'
        ]