from django.core.mail import send_mail
from django.conf import settings

def send_password_reset_email(user, reset_url):
    """
    Send password reset email to user
    """
    subject = 'Password Reset Request'
    message = f'''
    Hello {user.get_full_name()},

    You have requested to reset your password. Please click the link below to reset your password:

    {reset_url}

    If you did not request this password reset, please ignore this email.

    Best regards,
    The Team
    '''
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    ) 