from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import ChatMessage, ChatReaction
from .serializers import ChatMessageSerializer, ChatMessageCreateSerializer, ChatReactionSerializer
from apps.video_rooms.models import VideoRoom, RoomParticipant

class ChatMessageListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        room_id = self.kwargs['room_id']
        room = get_object_or_404(VideoRoom, id=room_id)
        
        # Check if user can access the room
        user = self.request.user
        if user.user_type == 'student':
            from apps.courses.models import Enrollment
            if not Enrollment.objects.filter(
                student=user, 
                course=room.course, 
                status='active'
            ).exists():
                return ChatMessage.objects.none()
        elif user != room.host:
            return ChatMessage.objects.none()
        
        return ChatMessage.objects.filter(room=room)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ChatMessageCreateSerializer
        return ChatMessageSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['room_id'] = self.kwargs['room_id']
        return context

    def perform_create(self, serializer):
        room_id = self.kwargs['room_id']
        room = get_object_or_404(VideoRoom, id=room_id)
        
        # Check if user is a participant in the room
        if not RoomParticipant.objects.filter(
            room=room, 
            user=self.request.user, 
            left_at__isnull=True
        ).exists():
            raise permissions.PermissionDenied("You must be in the room to send messages")
        
        serializer.save()

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_reaction(request, message_id):
    message = get_object_or_404(ChatMessage, id=message_id)
    reaction_emoji = request.data.get('reaction')
    
    if not reaction_emoji:
        return Response(
            {'error': 'Reaction emoji is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if user can access the room
    room = message.room
    user = request.user
    
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
    
    # Add or update reaction
    reaction, created = ChatReaction.objects.update_or_create(
        message=message,
        user=user,
        defaults={'reaction': reaction_emoji}
    )
    
    return Response(ChatReactionSerializer(reaction).data)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_reaction(request, message_id):
    message = get_object_or_404(ChatMessage, id=message_id)
    
    try:
        reaction = ChatReaction.objects.get(message=message, user=request.user)
        reaction.delete()
        return Response({'message': 'Reaction removed'})
    except ChatReaction.DoesNotExist:
        return Response(
            {'error': 'Reaction not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def edit_message(request, message_id):
    message = get_object_or_404(ChatMessage, id=message_id, user=request.user)
    
    new_content = request.data.get('content')
    if not new_content:
        return Response(
            {'error': 'Content is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    message.content = new_content
    message.is_edited = True
    message.edited_at = timezone.now()
    message.save()
    
    return Response(ChatMessageSerializer(message).data)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_message(request, message_id):
    message = get_object_or_404(ChatMessage, id=message_id)
    
    # Only message author or room host can delete messages
    if message.user != request.user and message.room.host != request.user:
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    message.delete()
    return Response({'message': 'Message deleted'})