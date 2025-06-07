from agora_token_builder import RtcTokenBuilder, RtmTokenBuilder
from datetime import datetime, timedelta
import time

def generate_agora_token(app_id, app_certificate, channel_name, uid, token_type='rtc', expiration_hours=24):
    """
    Generate Agora RTC or RTM token
    """
    if not app_id or not app_certificate:
        raise ValueError("Agora App ID and Certificate are required")
    
    # Token expiration time (24 hours from now)
    expiration_time_in_seconds = int(time.time()) + (expiration_hours * 3600)
    expires_at = datetime.fromtimestamp(expiration_time_in_seconds)
    
    if token_type == 'rtc':
        # Generate RTC token for video calling
        role = 1  # Publisher role
        token = RtcTokenBuilder.buildTokenWithUid(
            app_id, 
            app_certificate, 
            channel_name, 
            uid, 
            role, 
            expiration_time_in_seconds
        )
    elif token_type == 'rtm':
        # Generate RTM token for messaging
        token = RtmTokenBuilder.buildToken(
            app_id, 
            app_certificate, 
            str(uid), 
            expiration_time_in_seconds
        )
    else:
        raise ValueError("Invalid token type. Use 'rtc' or 'rtm'")
    
    return {
        'token': token,
        'expires_at': expires_at,
        'channel_name': channel_name,
        'uid': uid
    }

def validate_agora_config():
    """
    Validate Agora configuration
    """
    from django.conf import settings
    
    if not hasattr(settings, 'AGORA_APP_ID') or not settings.AGORA_APP_ID:
        return False, "AGORA_APP_ID is not configured"
    
    if not hasattr(settings, 'AGORA_APP_CERTIFICATE') or not settings.AGORA_APP_CERTIFICATE:
        return False, "AGORA_APP_CERTIFICATE is not configured"
    
    return True, "Agora configuration is valid"