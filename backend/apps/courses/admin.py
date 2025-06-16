from django.contrib import admin
from .models import Category, Course, Lesson, Enrollment, LessonProgress, CourseReview, LessonMaterial

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'teacher', 'category', 'difficulty_level', 'status', 'current_students', 'rating', 'created_at']
    list_filter = ['status', 'difficulty_level', 'category', 'created_at']
    search_fields = ['title', 'teacher__first_name', 'teacher__last_name']
    readonly_fields = ['current_students', 'rating']

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'lesson_type', 'order', 'is_published', 'created_at']
    list_filter = ['lesson_type', 'is_published', 'created_at']
    search_fields = ['title', 'course__title']

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'status', 'progress_percentage', 'enrolled_at']
    list_filter = ['status', 'enrolled_at']
    search_fields = ['student__first_name', 'student__last_name', 'course__title']

@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ['enrollment', 'lesson', 'completed', 'completed_at']
    list_filter = ['completed', 'completed_at']

@admin.register(LessonMaterial)
class LessonMaterialAdmin(admin.ModelAdmin):
    list_display = ['title', 'lesson', 'file_type', 'file_size', 'created_at']
    list_filter = ['file_type', 'created_at']
    search_fields = ['title', 'lesson__title']

@admin.register(CourseReview)
class CourseReviewAdmin(admin.ModelAdmin):
    list_display = ['course', 'student', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['course__title', 'student__first_name', 'student__last_name']