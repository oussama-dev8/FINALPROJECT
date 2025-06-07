from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'first_name', 'last_name', 'user_type', 'is_verified', 'created_at']
    list_filter = ['user_type', 'is_verified', 'is_active', 'created_at']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Profile Information', {
            'fields': ('user_type', 'profile_picture', 'bio', 'phone_number', 'is_verified')
        }),
        ('Teacher Information', {
            'fields': ('specialization', 'experience', 'qualifications'),
            'classes': ('collapse',)
        }),
        ('Student Information', {
            'fields': ('grade_level', 'school', 'learning_goals'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Profile Information', {
            'fields': ('email', 'user_type', 'first_name', 'last_name')
        }),
    )