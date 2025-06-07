from rest_framework import serializers
from .models import Category, Course, Lesson, Enrollment, LessonProgress, CourseReview
from apps.authentication.serializers import UserProfileSerializer

class CategorySerializer(serializers.ModelSerializer):
    course_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'course_count', 'created_at']

    def get_course_count(self, obj):
        return obj.courses.filter(status='published').count()

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'description', 'lesson_type', 'order',
            'duration_minutes', 'content', 'video_url', 'scheduled_at',
            'is_published', 'created_at'
        ]

class CourseSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    lessons = LessonSerializer(many=True, read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    enrollment_status = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'teacher', 'teacher_name',
            'category', 'category_name', 'thumbnail', 'difficulty_level',
            'duration_weeks', 'max_students', 'current_students', 'status',
            'price', 'rating', 'lessons', 'is_enrolled', 'enrollment_status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['current_students', 'rating']

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Enrollment.objects.filter(
                student=request.user, 
                course=obj, 
                status='active'
            ).exists()
        return False

    def get_enrollment_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            enrollment = Enrollment.objects.filter(
                student=request.user, 
                course=obj
            ).first()
            return enrollment.status if enrollment else None
        return None

class CourseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'category', 'thumbnail',
            'difficulty_level', 'duration_weeks', 'max_students', 'price',
            'status'
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        validated_data['teacher'] = self.context['request'].user
        if 'status' not in validated_data:
            validated_data['status'] = 'published'  # Set default status
        return super().create(validated_data)

class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    student = UserProfileSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'course', 'enrolled_at', 'status',
            'progress_percentage', 'completed_at'
        ]

class LessonProgressSerializer(serializers.ModelSerializer):
    lesson = LessonSerializer(read_only=True)

    class Meta:
        model = LessonProgress
        fields = [
            'id', 'lesson', 'completed', 'completed_at', 'time_spent_minutes'
        ]

class CourseReviewSerializer(serializers.ModelSerializer):
    student = UserProfileSerializer(read_only=True)

    class Meta:
        model = CourseReview
        fields = ['id', 'student', 'rating', 'comment', 'created_at']

class CourseDetailSerializer(CourseSerializer):
    reviews = CourseReviewSerializer(many=True, read_only=True)
    enrollment_count = serializers.SerializerMethodField()

    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields + ['reviews', 'enrollment_count']

    def get_enrollment_count(self, obj):
        return obj.enrollments.filter(status='active').count()