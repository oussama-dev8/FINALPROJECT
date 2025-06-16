from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from .models import Category, Course, Lesson, Enrollment, LessonProgress, CourseReview, LessonMaterial
from .serializers import (
    CategorySerializer, CourseSerializer, CourseCreateSerializer,
    CourseDetailSerializer, LessonSerializer, EnrollmentSerializer,
    LessonProgressSerializer, CourseReviewSerializer, LessonMaterialSerializer
)

class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.filter(status='published')
    serializer_class = CourseSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category', 'difficulty_level', 'teacher']
    search_fields = ['title', 'description', 'teacher__first_name', 'teacher__last_name']
    ordering_fields = ['created_at', 'rating', 'current_students']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CourseCreateSerializer
        return CourseSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        # Only teachers can create courses
        if self.request.user.user_type != 'teacher':
            raise permissions.PermissionDenied("Only teachers can create courses")
        serializer.save()

class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseDetailSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_object(self):
        obj = super().get_object()
        # Only course teacher can modify/delete
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            if obj.teacher != self.request.user:
                raise permissions.PermissionDenied("You can only modify your own courses")
        return obj

class TeacherCoursesView(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Course.objects.filter(teacher=self.request.user)

class StudentCoursesView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user, status='active')

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def enroll_course(request, course_id):
    course = get_object_or_404(Course, id=course_id, status='published')
    
    # Check if student
    if request.user.user_type != 'student':
        return Response(
            {'error': 'Only students can enroll in courses'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Check if already enrolled
    if Enrollment.objects.filter(student=request.user, course=course).exists():
        return Response(
            {'error': 'Already enrolled in this course'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check course capacity
    if course.current_students >= course.max_students:
        return Response(
            {'error': 'Course is full'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create enrollment
    enrollment = Enrollment.objects.create(student=request.user, course=course)
    course.update_student_count()
    
    return Response(
        EnrollmentSerializer(enrollment).data, 
        status=status.HTTP_201_CREATED
    )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def unenroll_course(request, course_id):
    enrollment = get_object_or_404(
        Enrollment, 
        student=request.user, 
        course_id=course_id, 
        status='active'
    )
    
    enrollment.status = 'cancelled'
    enrollment.save()
    enrollment.course.update_student_count()
    
    return Response({'message': 'Successfully unenrolled from course'})

class LessonListCreateView(generics.ListCreateAPIView):
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        course_id = self.kwargs['course_id']
        course = get_object_or_404(Course, id=course_id)
        
        # Teachers can see all lessons, students only published ones
        if self.request.user == course.teacher:
            return course.lessons.all()
        else:
            # Check if student is enrolled
            if not Enrollment.objects.filter(
                student=self.request.user, 
                course=course, 
                status='active'
            ).exists():
                return Lesson.objects.none()
            return course.lessons.filter(is_published=True)

    def perform_create(self, serializer):
        course_id = self.kwargs['course_id']
        course = get_object_or_404(Course, id=course_id)
        
        # Only course teacher can add lessons
        if course.teacher != self.request.user:
            raise permissions.PermissionDenied("You can only add lessons to your own courses")
        
        lesson = serializer.save(course=course)
        
        # Handle material uploads
        materials_count = int(self.request.data.get('materials_count', 0))
        for i in range(materials_count):
            material_file = self.request.FILES.get(f'material_{i}')
            material_title = self.request.data.get(f'material_{i}_title', '')
            
            if material_file:
                LessonMaterial.objects.create(
                    lesson=lesson,
                    title=material_title or material_file.name,
                    file=material_file
                )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_lesson_complete(request, pk):
    lesson = get_object_or_404(Lesson, id=pk)
    
    # Check if student is enrolled in the course
    enrollment = get_object_or_404(
        Enrollment, 
        student=request.user, 
        course=lesson.course, 
        status='active'
    )
    
    # Get or create lesson progress
    lesson_progress, created = LessonProgress.objects.get_or_create(
        enrollment=enrollment,
        lesson=lesson,
        defaults={'completed': True, 'completed_at': timezone.now()}
    )
    
    if not created and not lesson_progress.completed:
        lesson_progress.completed = True
        lesson_progress.completed_at = timezone.now()
        lesson_progress.save()
        
        # Update enrollment progress
        enrollment.update_progress()
    
    return Response({'message': 'Lesson marked as complete'}, status=status.HTTP_200_OK)

class CourseReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        course_id = self.kwargs['course_id']
        return CourseReview.objects.filter(course_id=course_id)

    def perform_create(self, serializer):
        course_id = self.kwargs['course_id']
        course = get_object_or_404(Course, id=course_id)
        
        # Check if student is enrolled
        if not Enrollment.objects.filter(
            student=self.request.user, 
            course=course, 
            status__in=['active', 'completed']
        ).exists():
            raise permissions.PermissionDenied("You must be enrolled (active or completed) to review this course")
        
        review = serializer.save(student=self.request.user, course=course)
        # Update course rating
        course.update_rating()

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_course_progress(request, course_id):
    """
    Get the progress of a student in a course
    """
    course = get_object_or_404(Course, id=course_id)
    enrollment = get_object_or_404(
        Enrollment, 
        student=request.user,
        course=course,
        status__in=['active', 'completed']
    )
    
    # Get completed lessons
    completed_lesson_progress = LessonProgress.objects.filter(
        enrollment=enrollment,
        completed=True
    )
    completed_lessons_count = completed_lesson_progress.count()
    completed_lesson_ids = list(completed_lesson_progress.values_list('lesson_id', flat=True))
    
    # Get total lessons
    total_lessons = course.lessons.filter(is_published=True).count()
    
    # Calculate progress percentage
    progress_percentage = (completed_lessons_count / total_lessons * 100) if total_lessons > 0 else 0
    
    return Response({
        'total_lessons': total_lessons,
        'completed_lessons': completed_lessons_count,
        'completed_lesson_ids': completed_lesson_ids,
        'progress_percentage': round(progress_percentage, 2),
        'progress': round(progress_percentage, 2)  # Alias for frontend compatibility
    })

class LessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        user = self.request.user

        # Teachers can access any lesson they created
        if user == obj.course.teacher:
            return obj

        # Students can only access published lessons from enrolled courses
        if user.user_type == 'student':
            enrollment = get_object_or_404(
                Enrollment,
                student=user,
                course=obj.course,
                status='active'
            )
            if obj.is_published:
                return obj
            raise permissions.PermissionDenied("This lesson is not published")
        
        raise permissions.PermissionDenied("You don't have permission to access this lesson")

    def perform_update(self, serializer):
        lesson = self.get_object()
        # Only course teacher can update lessons
        if lesson.course.teacher != self.request.user:
            raise permissions.PermissionDenied("You can only update your own lessons")
        serializer.save()

    def perform_destroy(self, instance):
        # Only course teacher can delete lessons
        if instance.course.teacher != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own lessons")
        instance.delete()

class LessonMaterialListCreateView(generics.ListCreateAPIView):
    serializer_class = LessonMaterialSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        lesson_id = self.kwargs['lesson_id']
        lesson = get_object_or_404(Lesson, id=lesson_id)
        
        # Teachers can see all materials, students only if enrolled
        if self.request.user == lesson.course.teacher:
            return lesson.materials.all()
        else:
            # Check if student is enrolled
            if not Enrollment.objects.filter(
                student=self.request.user, 
                course=lesson.course, 
                status='active'
            ).exists():
                return LessonMaterial.objects.none()
            return lesson.materials.all()

    def perform_create(self, serializer):
        lesson_id = self.kwargs['lesson_id']
        lesson = get_object_or_404(Lesson, id=lesson_id)
        
        # Only course teacher can add materials
        if lesson.course.teacher != self.request.user:
            raise permissions.PermissionDenied("You can only add materials to your own lessons")
        
        serializer.save(lesson=lesson)