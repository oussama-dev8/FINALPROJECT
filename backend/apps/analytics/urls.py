from django.urls import path
from . import views

urlpatterns = [
    path('teacher/dashboard/', views.teacher_dashboard_stats, name='teacher-dashboard-stats'),
    path('student/dashboard/', views.student_dashboard_stats, name='student-dashboard-stats'),
    path('teacher/courses/', views.TeacherAnalyticsView.as_view(), name='teacher-analytics'),
    path('activities/', views.StudentActivityListView.as_view(), name='student-activities'),
    path('track/', views.track_activity, name='track-activity'),
]