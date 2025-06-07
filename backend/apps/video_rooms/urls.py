from django.urls import path
from . import views

urlpatterns = [
    path('rooms/', views.VideoRoomListCreateView.as_view(), name='room-list-create'),
    path('rooms/<int:pk>/', views.VideoRoomDetailView.as_view(), name='room-detail'),
    path('rooms/<int:room_id>/join/', views.join_room, name='join-room'),
    path('rooms/<int:room_id>/leave/', views.leave_room, name='leave-room'),
    path('rooms/<int:room_id>/update-status/', views.update_participant_status, name='update-participant-status'),
    path('token/', views.generate_token, name='generate-token'),
]