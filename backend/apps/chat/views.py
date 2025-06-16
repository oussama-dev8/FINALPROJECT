from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Count
from .models import ChatMessage, ChatReaction
from .serializers import ChatMessageSerializer, ChatMessageCreateSerializer, ChatReactionSerializer

class ChatMessageListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        room_id = self.kwargs['room_id']  # Using room_id as room for now
        return ChatMessage.objects.filter(room=room_id)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ChatMessageCreateSerializer
        return ChatMessageSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['room_id'] = self.kwargs['room_id']
        return context

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user, 
            room=self.kwargs['room_id']  # Using room_id as room for now
        )

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
    
    # Add or update reaction
    reaction, created = ChatReaction.objects.update_or_create(
        message=message,
        user=request.user,
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
    message = get_object_or_404(ChatMessage, id=message_id, user=request.user)
    message.delete()
    return Response({'message': 'Message deleted'})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_as_read(request, message_id=None, room_id=None):
    """Mark a message or all messages in a room as read"""
    if message_id:
        # Mark specific message as read
        message = get_object_or_404(ChatMessage, id=message_id)
        # Here you would typically update a read status model
        # For now, just return success
        return Response({'message': 'Message marked as read'})
    elif room_id:
        # Mark all messages in room as read
        # Here you would typically update read status for all messages in room
        return Response({'message': 'All messages in room marked as read'})
    else:
        return Response(
            {'error': 'Either message_id or room_id is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

class MessageThreadView(generics.ListAPIView):
    """View for getting threaded replies to a message"""
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        message_id = self.kwargs['message_id']
        # Get threaded replies to a message
        return ChatMessage.objects.filter(parent_message_id=message_id)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_message_reactions(request, message_id):
    """Get all reactions for a specific message"""
    message = get_object_or_404(ChatMessage, id=message_id)
    reactions = ChatReaction.objects.filter(message=message)
    return Response(ChatReactionSerializer(reactions, many=True).data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_reaction_analytics(request, room_id):
    """Get reaction analytics for a room"""
    reactions = ChatReaction.objects.filter(message__room=room_id)
    
    # Count reactions by emoji
    reaction_counts = reactions.values('reaction').annotate(
        count=Count('reaction')
    ).order_by('-count')
    
    # Count reactions by user
    user_counts = reactions.values('user__username').annotate(
        count=Count('user')
    ).order_by('-count')
    
    return Response({
        'reaction_counts': list(reaction_counts),
        'user_counts': list(user_counts),
        'total_reactions': reactions.count()
    })