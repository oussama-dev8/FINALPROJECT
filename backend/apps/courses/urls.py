from django.urls import path
from . import views

urlpatterns = [
    # Categories
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    
    # Courses
    path('courses/', views.CourseListCreateView.as_view(), name='course-list-create'),
    path('courses/<int:pk>/', views.CourseDetailView.as_view(), name='course-detail'),
    path('courses/<int:course_id>/enroll/', views.enroll_course, name='enroll-course'),
    path('courses/<int:course_id>/unenroll/', views.unenroll_course, name='unenroll-course'),
    path('courses/<int:course_id>/lessons/', views.LessonListCreateView.as_view(), name='lesson-list-create'),
    
    # Lessons
    path('lessons/<int:pk>/', views.LessonDetailView.as_view(), name='lesson-detail'),
    path('lessons/<int:pk>/complete/', views.mark_lesson_complete, name='mark-lesson-complete'),
    
    # Teacher specific
    path('my-courses/', views.TeacherCoursesView.as_view(), name='teacher-courses'),
    
    # Student specific
    path('enrolled-courses/', views.StudentCoursesView.as_view(), name='student-courses'),
    
    # Reviews
    path('courses/<int:course_id>/reviews/', views.CourseReviewListCreateView.as_view(), name='course-reviews'),
    
    # Course Progress
    path('courses/<int:course_id>/progress/', views.get_course_progress, name='course-progress'),
]