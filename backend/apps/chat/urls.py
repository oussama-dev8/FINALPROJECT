from django.urls import path
from . import views

urlpatterns = [
    path('rooms/<int:room_id>/messages/', views.ChatMessageListCreateView.as_view(), name='chat-messages'),
    path('messages/<int:message_id>/react/', views.add_reaction, name='add-reaction'),
    path('messages/<int:message_id>/unreact/', views.remove_reaction, name='remove-reaction'),
    path('messages/<int:message_id>/edit/', views.edit_message, name='edit-message'),
    path('messages/<int:message_id>/delete/', views.delete_message, name='delete-message'),
]