from django.db import models
from django.conf import settings
from apps.courses.models import Course, Lesson

class CourseAnalytics(models.Model):
    course = models.OneToOneField(Course, on_delete=models.CASCADE, related_name='analytics')
    total_enrollments = models.PositiveIntegerField(default=0)
    active_enrollments = models.PositiveIntegerField(default=0)
    completed_enrollments = models.PositiveIntegerField(default=0)
    average_completion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_reviews = models.PositiveIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Analytics for {self.course.title}"

class StudentActivity(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activities')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='student_activities')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, null=True, blank=True)
    activity_type = models.CharField(max_length=50)  # 'lesson_start', 'lesson_complete', 'video_join', etc.
    duration_minutes = models.PositiveIntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.activity_type}"

    class Meta:
        ordering = ['-timestamp']

class SessionAnalytics(models.Model):
    room_name = models.CharField(max_length=255)  # Simple room name instead of ForeignKey
    total_participants = models.PositiveIntegerField(default=0)
    peak_participants = models.PositiveIntegerField(default=0)
    average_duration_minutes = models.PositiveIntegerField(default=0)
    total_messages = models.PositiveIntegerField(default=0)
    session_rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Session Analytics for {self.room_name}"