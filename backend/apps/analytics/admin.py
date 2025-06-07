from django.contrib import admin
from .models import CourseAnalytics, StudentActivity, SessionAnalytics

@admin.register(CourseAnalytics)
class CourseAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['course', 'total_enrollments', 'active_enrollments', 'average_rating', 'last_updated']
    list_filter = ['last_updated']
    search_fields = ['course__title']
    readonly_fields = ['last_updated']

@admin.register(StudentActivity)
class StudentActivityAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'activity_type', 'duration_minutes', 'timestamp']
    list_filter = ['activity_type', 'timestamp']
    search_fields = ['student__first_name', 'student__last_name', 'course__title']

@admin.register(SessionAnalytics)
class SessionAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['room', 'total_participants', 'peak_participants', 'session_rating', 'created_at']
    list_filter = ['created_at']
    search_fields = ['room__title']