from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('change-password/', views.change_password_view, name='change_password'),
    path('verify-token/', views.verify_token_view, name='verify_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('password-reset/', views.password_reset_view, name='password_reset'),
    path('account/', views.delete_account_view, name='delete_account'),
]