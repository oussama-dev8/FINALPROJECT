from django.urls import path
from . import views

urlpatterns = [
    path('rooms/<int:room_id>/messages/', views.ChatMessageListCreateView.as_view(), name='chat-messages-list'),
    path('messages/<int:message_id>/react/', views.add_reaction, name='add-reaction'),
    path('messages/<int:message_id>/unreact/', views.remove_reaction, name='remove-reaction'),
    path('messages/<int:message_id>/edit/', views.edit_message, name='edit-message'),
    path('messages/<int:message_id>/delete/', views.delete_message, name='delete-message'),
    path('messages/<int:message_id>/read/', views.mark_as_read, name='mark-message-read'),
    path('rooms/<int:room_id>/read/', views.mark_as_read, name='mark-room-read'),
    path('messages/<int:message_id>/thread/', views.MessageThreadView.as_view(), name='message-thread'),
    path('messages/<int:message_id>/reactions/', views.get_message_reactions, name='message-reactions'),
    path('rooms/<int:room_id>/reaction-analytics/', views.get_reaction_analytics, name='reaction-analytics'),
]