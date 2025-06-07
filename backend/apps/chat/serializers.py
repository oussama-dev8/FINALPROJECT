from rest_framework import serializers
from .models import ChatMessage, ChatReaction
from apps.authentication.serializers import UserProfileSerializer

class ChatReactionSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = ChatReaction
        fields = ['id', 'user', 'reaction', 'created_at']

class ChatMessageSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    reactions = ChatReactionSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = ChatMessage
        fields = [
            'id', 'user', 'user_name', 'message_type', 'content',
            'file_url', 'file_name', 'file_size', 'timestamp',
            'is_edited', 'edited_at', 'reactions'
        ]

class ChatMessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['content', 'message_type', 'file_url', 'file_name', 'file_size']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['room_id'] = self.context['room_id']
        return super().create(validated_data)