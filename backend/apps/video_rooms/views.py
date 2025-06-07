from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.conf import settings
from .models import VideoRoom, RoomParticipant, AgoraToken
from .serializers import (
    VideoRoomSerializer, VideoRoomCreateSerializer, 
    RoomParticipantSerializer, AgoraTokenSerializer
)
from .utils import generate_agora_token
import time

class VideoRoomListCreateView(generics.ListCreateAPIView):
    serializer_class = VideoRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'teacher':
            return VideoRoom.objects.filter(host=user)
        else:
            # Students can see rooms for courses they're enrolled in
            from apps.courses.models import Enrollment
            enrolled_courses = Enrollment.objects.filter(
                student=user, 
                status='active'
            ).values_list('course_id', flat=True)
            return VideoRoom.objects.filter(course_id__in=enrolled_courses)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return VideoRoomCreateSerializer
        return VideoRoomSerializer

    def perform_create(self, serializer):
        # Only teachers can create rooms
        if self.request.user.user_type != 'teacher':
            raise permissions.PermissionDenied("Only teachers can create video rooms")
        serializer.save()

class VideoRoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = VideoRoom.objects.all()
    serializer_class = VideoRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        
        # Check permissions
        if user.user_type == 'teacher':
            if obj.host != user:
                raise permissions.PermissionDenied("You can only access your own rooms")
        else:
            # Check if student is enrolled in the course
            from apps.courses.models import Enrollment
            if not Enrollment.objects.filter(
                student=user, 
                course=obj.course, 
                status='active'
            ).exists():
                raise permissions.PermissionDenied("You must be enrolled in the course")
        
        return obj

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def join_room(request, room_id):
    room = get_object_or_404(VideoRoom, id=room_id)
    user = request.user
    
    # Check if user can join the room
    if user.user_type == 'student':
        from apps.courses.models import Enrollment
        if not Enrollment.objects.filter(
            student=user, 
            course=room.course, 
            status='active'
        ).exists():
            return Response(
                {'error': 'You must be enrolled in the course to join this room'}, 
                status=status.HTTP_403_FORBIDDEN
            )
    
    # Check room capacity
    if room.current_participants_count >= room.max_participants:
        return Response(
            {'error': 'Room is full'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get or create participant
    participant, created = RoomParticipant.objects.get_or_create(
        room=room,
        user=user,
        defaults={
            'role': 'host' if user == room.host else 'participant',
            'left_at': None
        }
    )
    
    if not created and participant.left_at:
        # User is rejoining
        participant.left_at = None
        participant.joined_at = timezone.now()
        participant.save()
    
    # Activate room if host joins
    if user == room.host and not room.is_active:
        room.is_active = True
        room.started_at = timezone.now()
        room.save()
    
    return Response(RoomParticipantSerializer(participant).data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def leave_room(request, room_id):
    room = get_object_or_404(VideoRoom, id=room_id)
    participant = get_object_or_404(
        RoomParticipant, 
        room=room, 
        user=request.user, 
        left_at__isnull=True
    )
    
    participant.left_at = timezone.now()
    participant.save()
    
    # End room if host leaves
    if request.user == room.host:
        room.is_active = False
        room.ended_at = timezone.now()
        room.save()
        
        # Mark all participants as left
        RoomParticipant.objects.filter(
            room=room, 
            left_at__isnull=True
        ).update(left_at=timezone.now())
    
    return Response({'message': 'Successfully left the room'})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_token(request):
    room_id = request.data.get('room_id')
    token_type = request.data.get('token_type', 'rtc')
    
    if not room_id:
        return Response(
            {'error': 'room_id is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    room = get_object_or_404(VideoRoom, id=room_id)
    user = request.user
    
    # Check if user can access the room
    if user.user_type == 'student':
        from apps.courses.models import Enrollment
        if not Enrollment.objects.filter(
            student=user, 
            course=room.course, 
            status='active'
        ).exists():
            return Response(
                {'error': 'Access denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
    elif user != room.host:
        return Response(
            {'error': 'Access denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Generate token
    try:
        uid = int(str(user.id) + str(int(time.time()))[-4:])
        channel_name = room.room_id
        
        token_data = generate_agora_token(
            app_id=settings.AGORA_APP_ID,
            app_certificate=settings.AGORA_APP_CERTIFICATE,
            channel_name=channel_name,
            uid=uid,
            token_type=token_type
        )
        
        # Save token to database
        agora_token, created = AgoraToken.objects.update_or_create(
            room=room,
            user=user,
            token_type=token_type,
            defaults={
                'token': token_data['token'],
                'channel_name': channel_name,
                'uid': uid,
                'expires_at': token_data['expires_at']
            }
        )
        
        return Response(AgoraTokenSerializer(agora_token).data)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to generate token: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_participant_status(request, room_id):
    room = get_object_or_404(VideoRoom, id=room_id)
    participant = get_object_or_404(
        RoomParticipant, 
        room=room, 
        user=request.user, 
        left_at__isnull=True
    )
    
    # Update participant status
    is_video_on = request.data.get('is_video_on')
    is_audio_on = request.data.get('is_audio_on')
    is_screen_sharing = request.data.get('is_screen_sharing')
    
    if is_video_on is not None:
        participant.is_video_on = is_video_on
    if is_audio_on is not None:
        participant.is_audio_on = is_audio_on
    if is_screen_sharing is not None:
        participant.is_screen_sharing = is_screen_sharing
    
    participant.save()
    
    return Response(RoomParticipantSerializer(participant).data)