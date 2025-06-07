from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Avg, Sum
from django.utils import timezone
from datetime import timedelta
from .models import CourseAnalytics, StudentActivity, SessionAnalytics
from .serializers import CourseAnalyticsSerializer, StudentActivitySerializer, SessionAnalyticsSerializer
from apps.courses.models import Course, Enrollment

class TeacherAnalyticsView(generics.ListAPIView):
    serializer_class = CourseAnalyticsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type != 'teacher':
            return CourseAnalytics.objects.none()
        
        teacher_courses = Course.objects.filter(teacher=self.request.user)
        return CourseAnalytics.objects.filter(course__in=teacher_courses)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def teacher_dashboard_stats(request):
    if request.user.user_type != 'teacher':
        return Response({'error': 'Only teachers can access this endpoint'}, status=403)
    
    teacher_courses = Course.objects.filter(teacher=request.user)
    
    # Basic stats
    total_courses = teacher_courses.count()
    total_students = Enrollment.objects.filter(
        course__in=teacher_courses, 
        status='active'
    ).count()
    
    # Recent activity (last 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent_enrollments = Enrollment.objects.filter(
        course__in=teacher_courses,
        enrolled_at__gte=thirty_days_ago
    ).count()
    
    # Course performance
    course_stats = teacher_courses.aggregate(
        avg_rating=Avg('rating'),
        total_revenue=Sum('enrollments__course__price')
    )
    
    return Response({
        'total_courses': total_courses,
        'total_students': total_students,
        'recent_enrollments': recent_enrollments,
        'average_rating': course_stats['avg_rating'] or 0,
        'total_revenue': course_stats['total_revenue'] or 0,
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def student_dashboard_stats(request):
    if request.user.user_type != 'student':
        return Response({'error': 'Only students can access this endpoint'}, status=403)
    
    enrollments = Enrollment.objects.filter(student=request.user, status='active')
    
    # Basic stats
    total_courses = enrollments.count()
    completed_courses = Enrollment.objects.filter(
        student=request.user, 
        status='completed'
    ).count()
    
    # Progress stats
    if total_courses > 0:
        avg_progress = enrollments.aggregate(
            avg_progress=Avg('progress_percentage')
        )['avg_progress'] or 0
    else:
        avg_progress = 0
    
    # Learning time (last 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent_activity = StudentActivity.objects.filter(
        student=request.user,
        timestamp__gte=thirty_days_ago
    ).aggregate(
        total_time=Sum('duration_minutes')
    )['total_time'] or 0
    
    return Response({
        'enrolled_courses': total_courses,
        'completed_courses': completed_courses,
        'average_progress': round(avg_progress, 2),
        'learning_time_hours': round(recent_activity / 60, 1),
    })

class StudentActivityListView(generics.ListAPIView):
    serializer_class = StudentActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type == 'student':
            return StudentActivity.objects.filter(student=self.request.user)
        elif self.request.user.user_type == 'teacher':
            # Teachers can see activities for their courses
            teacher_courses = Course.objects.filter(teacher=self.request.user)
            return StudentActivity.objects.filter(course__in=teacher_courses)
        return StudentActivity.objects.none()

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def track_activity(request):
    """
    Track student activity
    """
    activity_type = request.data.get('activity_type')
    course_id = request.data.get('course_id')
    lesson_id = request.data.get('lesson_id')
    duration_minutes = request.data.get('duration_minutes', 0)
    metadata = request.data.get('metadata', {})
    
    if not activity_type or not course_id:
        return Response({'error': 'activity_type and course_id are required'}, status=400)
    
    try:
        course = Course.objects.get(id=course_id)
        lesson = None
        if lesson_id:
            lesson = course.lessons.get(id=lesson_id)
        
        activity = StudentActivity.objects.create(
            student=request.user,
            course=course,
            lesson=lesson,
            activity_type=activity_type,
            duration_minutes=duration_minutes,
            metadata=metadata
        )
        
        return Response(StudentActivitySerializer(activity).data)
        
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)