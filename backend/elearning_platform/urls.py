from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/courses/', include('apps.courses.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/video-rooms/', include('apps.video_rooms.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)