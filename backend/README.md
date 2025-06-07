# Darsy E-Learning Platform Backend

A comprehensive Django REST API backend for the Darsy e-learning platform with real-time video streaming, chat capabilities, and course management.

## Features

- **User Authentication**: JWT-based authentication with separate teacher/student roles
- **Course Management**: Complete CRUD operations for courses, lessons, and enrollments
- **Video Rooms**: Agora WebRTC integration for live video sessions
- **Real-time Chat**: WebSocket-based chat with reactions and file sharing
- **Analytics**: Comprehensive tracking and reporting for teachers and students
- **Admin Interface**: Django admin for platform management

## Technology Stack

- **Framework**: Django 4.2+ with Django REST Framework
- **Database**: PostgreSQL
- **Real-time**: Django Channels with Redis
- **Video**: Agora WebRTC SDK
- **Authentication**: JWT tokens
- **File Storage**: Local storage (configurable for AWS S3)

## Installation

### Prerequisites

- Python 3.8+
- PostgreSQL 12+
- Redis 6+
- Agora.io account (for video features)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/iamislamtb/darsy.git
   cd darsy/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   AGORA_APP_ID=your_app_id_here
   AGORA_APP_CERTIFICATE=your_app_certificate_here
   ```

5. **Database setup**
   ```bash
   # Create PostgreSQL database
   createdb darsy_db
   
   # Run migrations
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start Redis server**
   ```bash
   redis-server
   ```

8. **Run development server**
   ```bash
   python manage.py runserver
   ```

## API Documentation

### Authentication Endpoints

```
POST /api/auth/register/          # User registration
POST /api/auth/login/             # User login
POST /api/auth/logout/            # User logout
GET  /api/auth/profile/           # Get user profile
PUT  /api/auth/profile/           # Update user profile
POST /api/auth/change-password/   # Change password
```

### Course Management

```
GET    /api/courses/courses/                 # List courses
POST   /api/courses/courses/                 # Create course (teachers)
GET    /api/courses/courses/{id}/            # Course details
PUT    /api/courses/courses/{id}/            # Update course
DELETE /api/courses/courses/{id}/            # Delete course
POST   /api/courses/courses/{id}/enroll/     # Enroll in course
GET    /api/courses/my-courses/              # Teacher's courses
GET    /api/courses/enrolled-courses/        # Student's enrollments
```

### Video Rooms

```
GET    /api/video-rooms/rooms/               # List rooms
POST   /api/video-rooms/rooms/               # Create room
GET    /api/video-rooms/rooms/{id}/          # Room details
POST   /api/video-rooms/rooms/{id}/join/     # Join room
POST   /api/video-rooms/rooms/{id}/leave/    # Leave room
POST   /api/video-rooms/token/               # Generate Agora token
```

### Chat System

```
GET    /api/chat/rooms/{id}/messages/        # Get messages
POST   /api/chat/rooms/{id}/messages/        # Send message
POST   /api/chat/messages/{id}/react/        # Add reaction
DELETE /api/chat/messages/{id}/unreact/      # Remove reaction
```

### Analytics

```
GET    /api/analytics/teacher/dashboard/     # Teacher dashboard stats
GET    /api/analytics/student/dashboard/     # Student dashboard stats
GET    /api/analytics/activities/            # Activity tracking
POST   /api/analytics/track/                 # Track new activity
```

## Database Schema

### Core Models

- **User**: Extended Django user with teacher/student roles
- **Course**: Course information and metadata
- **Lesson**: Individual lessons within courses
- **Enrollment**: Student course enrollments
- **VideoRoom**: Live video session rooms
- **ChatMessage**: Real-time chat messages
- **Analytics**: Usage and performance tracking

## Real-time Features

### WebSocket Connections

The platform uses Django Channels for real-time features:

- **Chat**: `/ws/chat/{room_id}/`
- **Video Room Updates**: Real-time participant updates
- **Notifications**: System-wide notifications

### Agora Integration

Video functionality is powered by Agora.io:

- **RTC Tokens**: Generated for video/audio streaming
- **RTM Tokens**: Generated for real-time messaging
- **Channel Management**: Automatic room creation and management

## Development

### Running Tests

```bash
python manage.py test
```

### Code Quality

```bash
# Install development dependencies
pip install flake8 black isort

# Format code
black .
isort .

# Check code quality
flake8 .
```

### Database Migrations

```bash
# Create new migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Reset migrations (development only)
python manage.py migrate --fake-initial
```

## Deployment

### Production Settings

1. **Environment Variables**
   ```bash
   DEBUG=False
   ALLOWED_HOSTS=yourdomain.com
   SECRET_KEY=your-production-secret-key
   ```

2. **Database Configuration**
   - Use production PostgreSQL instance
   - Configure connection pooling
   - Set up database backups

3. **Static Files**
   ```bash
   python manage.py collectstatic
   ```

4. **ASGI Server**
   ```bash
   # Install production ASGI server
   pip install uvicorn[standard]
   
   # Run with uvicorn
   uvicorn elearning_platform.asgi:application --host 0.0.0.0 --port 8000
   ```

### Docker Deployment

```dockerfile
# Dockerfile example
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "elearning_platform.asgi:application", "--host", "0.0.0.0", "--port", "8000"]
```

## Monitoring

### Logging

The platform includes comprehensive logging:

- **API Requests**: All API calls logged
- **Errors**: Detailed error tracking
- **Performance**: Response time monitoring
- **User Activity**: Learning analytics

### Health Checks

```bash
# Database connectivity
python manage.py check --database default

# Redis connectivity
python manage.py shell -c "from django.core.cache import cache; cache.set('test', 'ok')"
```

## Security

### Best Practices

- **JWT Tokens**: Secure token-based authentication
- **CORS**: Properly configured cross-origin requests
- **Input Validation**: All user inputs validated
- **SQL Injection**: Protected by Django ORM
- **XSS Protection**: Built-in Django security features

### Rate Limiting

Consider implementing rate limiting for production:

```python
# Install django-ratelimit
pip install django-ratelimit

# Apply to views
from django_ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='100/h')
def api_view(request):
    pass
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- **Documentation**: Check the API documentation
- **Issues**: Create a GitHub issue
- **Email**: contact@darsy.com

## Changelog

### Version 1.0.0
- Initial release with core features
- User authentication and authorization
- Course management system
- Video room functionality
- Real-time chat system
- Basic analytics and reporting