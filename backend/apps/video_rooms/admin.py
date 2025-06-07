from django.contrib import admin
from .models import VideoRoom, RoomParticipant, AgoraToken

@admin.register(VideoRoom)
class VideoRoomAdmin(admin.ModelAdmin):
    list_display = ['title', 'host', 'course', 'is_active', 'current_participants_count', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'host__first_name', 'host__last_name', 'course__title']
    readonly_fields = ['room_id', 'current_participants_count']

@admin.register(RoomParticipant)
class RoomParticipantAdmin(admin.ModelAdmin):
    list_display = ['user', 'room', 'role', 'joined_at', 'left_at']
    list_filter = ['role', 'joined_at', 'left_at']
    search_fields = ['user__first_name', 'user__last_name', 'room__title']

@admin.register(AgoraToken)
class AgoraTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'room', 'token_type', 'expires_at', 'created_at']
    list_filter = ['token_type', 'expires_at', 'created_at']
    search_fields = ['user__first_name', 'user__last_name', 'room__title']