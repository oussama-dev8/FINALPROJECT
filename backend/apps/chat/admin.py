from django.contrib import admin
from .models import ChatMessage, ChatReaction

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['user', 'room', 'message_type', 'content', 'timestamp']
    list_filter = ['message_type', 'timestamp', 'is_edited']
    search_fields = ['user__first_name', 'user__last_name', 'content', 'room']
    readonly_fields = ['timestamp']

@admin.register(ChatReaction)
class ChatReactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'message', 'reaction', 'created_at']
    list_filter = ['reaction', 'created_at']
    search_fields = ['user__first_name', 'user__last_name', 'message__content']