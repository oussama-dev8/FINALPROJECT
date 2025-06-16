from django.db import models
from django.conf import settings

class ChatMessage(models.Model):
    MESSAGE_TYPE_CHOICES = [
        ('text', 'Text'),
        ('file', 'File'),
        ('system', 'System'),
    ]

    room = models.CharField(max_length=255)  # Temporary solution until we fix the migration
    room_id = models.IntegerField(null=True, blank=True)  # Restored field
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_messages')
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPE_CHOICES, default='text')
    content = models.TextField()
    file_url = models.URLField(blank=True)
    file_name = models.CharField(max_length=255, blank=True)
    file_size = models.PositiveIntegerField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_edited = models.BooleanField(default=False)
    edited_at = models.DateTimeField(null=True, blank=True)
    parent_message = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')  # Restored field

    def __str__(self):
        return f"{self.user.get_full_name()}: {self.content[:50]}"

    class Meta:
        ordering = ['timestamp']

class ChatReaction(models.Model):
    REACTION_CHOICES = [
        ('👍', 'Thumbs Up'),
        ('👎', 'Thumbs Down'),
        ('❤️', 'Heart'),
        ('😂', 'Laugh'),
        ('😮', 'Wow'),
        ('😢', 'Sad'),
        ('😡', 'Angry'),
        ('custom', 'Custom'),  # Restored choice
    ]

    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    reaction = models.CharField(max_length=10, choices=REACTION_CHOICES)
    custom_reaction = models.CharField(max_length=20, blank=True)  # Restored field
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.get_full_name()} reacted {self.reaction}"

    class Meta:
        unique_together = ['message', 'user', 'reaction']  # Restored unique constraint

class ReadReceipt(models.Model):  # Restored model
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='read_receipts')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    read_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.get_full_name()} read message {self.message.id}"

    class Meta:
        unique_together = ['message', 'user']

class ReactionAnalytics(models.Model):  # Restored model
    reaction = models.CharField(max_length=20)
    room_id = models.IntegerField()
    count = models.PositiveIntegerField(default=0)
    last_used = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.reaction} in room {self.room_id}: {self.count}"

    class Meta:
        unique_together = ['reaction', 'room_id']