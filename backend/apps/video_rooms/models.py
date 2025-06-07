from django.db import models
from django.conf import settings
from apps.courses.models import Course, Lesson

class VideoRoom(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='video_rooms')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='video_rooms', null=True, blank=True)
    room_id = models.CharField(max_length=100, unique=True)
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='hosted_rooms')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=False)
    max_participants = models.PositiveIntegerField(default=50)
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} - {self.room_id}"

    @property
    def current_participants_count(self):
        return self.participants.filter(left_at__isnull=True).count()

    class Meta:
        ordering = ['-created_at']

class RoomParticipant(models.Model):
    ROLE_CHOICES = [
        ('host', 'Host'),
        ('moderator', 'Moderator'),
        ('participant', 'Participant'),
    ]

    room = models.ForeignKey(VideoRoom, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=12, choices=ROLE_CHOICES, default='participant')
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    is_video_on = models.BooleanField(default=True)
    is_audio_on = models.BooleanField(default=True)
    is_screen_sharing = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.get_full_name()} in {self.room.title}"

    class Meta:
        unique_together = ['room', 'user']

class AgoraToken(models.Model):
    TOKEN_TYPE_CHOICES = [
        ('rtc', 'RTC Token'),
        ('rtm', 'RTM Token'),
    ]

    room = models.ForeignKey(VideoRoom, on_delete=models.CASCADE, related_name='tokens')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    token_type = models.CharField(max_length=3, choices=TOKEN_TYPE_CHOICES)
    token = models.TextField()
    channel_name = models.CharField(max_length=100)
    uid = models.PositiveIntegerField()
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.token_type} token for {self.user.get_full_name()}"

    class Meta:
        unique_together = ['room', 'user', 'token_type']