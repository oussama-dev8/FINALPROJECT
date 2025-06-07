from rest_framework import serializers
from .models import VideoRoom, RoomParticipant, AgoraToken
from apps.authentication.serializers import UserProfileSerializer
from apps.courses.serializers import CourseSerializer, LessonSerializer

class RoomParticipantSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = RoomParticipant
        fields = [
            'id', 'user', 'role', 'joined_at', 'left_at',
            'is_video_on', 'is_audio_on', 'is_screen_sharing'
        ]

class VideoRoomSerializer(serializers.ModelSerializer):
    host = UserProfileSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    lesson = LessonSerializer(read_only=True)
    participants = RoomParticipantSerializer(many=True, read_only=True)
    current_participants_count = serializers.ReadOnlyField()

    class Meta:
        model = VideoRoom
        fields = [
            'id', 'course', 'lesson', 'room_id', 'host', 'title', 'description',
            'is_active', 'max_participants', 'current_participants_count',
            'participants', 'created_at', 'started_at', 'ended_at'
        ]

class VideoRoomCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoRoom
        fields = ['course', 'lesson', 'title', 'description', 'max_participants']

    def create(self, validated_data):
        import uuid
        validated_data['host'] = self.context['request'].user
        validated_data['room_id'] = f"darsy_{uuid.uuid4().hex[:8]}"
        return super().create(validated_data)

class AgoraTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgoraToken
        fields = ['token', 'channel_name', 'uid', 'expires_at']