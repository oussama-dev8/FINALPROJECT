from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.conf import settings
from .models import User
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, 
    UserProfileSerializer, UserUpdateSerializer, PasswordChangeSerializer, PasswordResetSerializer
)
from django.contrib.auth.tokens import default_token_generator
from .utils import send_password_reset_email

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = UserLoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    user = serializer.validated_data['user']
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'user': UserProfileSerializer(user).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    })

@api_view(['POST'])
def logout_view(request):
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Successfully logged out'})
    except Exception as e:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method == 'PUT' or self.request.method == 'PATCH':
            return UserUpdateSerializer
        return UserProfileSerializer

@api_view(['POST'])
def change_password_view(request):
    serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    
    user = request.user
    user.set_password(serializer.validated_data['new_password'])
    user.save()
    
    return Response({'message': 'Password changed successfully'})

@api_view(['GET'])
def verify_token_view(request):
    return Response({
        'user': UserProfileSerializer(request.user).data,
        'valid': True
    })

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def password_reset_view(request):
    """
    Request a password reset email
    """
    serializer = PasswordResetSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            # Generate password reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Send password reset email
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
            send_password_reset_email(user, reset_url)
            
            return Response({
                'message': 'Password reset email sent successfully'
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            # Don't reveal whether a user exists
            pass
        
    return Response({
        'message': 'If an account exists with this email, you will receive password reset instructions.'
    }, status=status.HTTP_200_OK)