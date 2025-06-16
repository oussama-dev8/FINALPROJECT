# Darsy - Interactive E-Learning Platform

An advanced e-learning platform with real-time video communication capabilities using WebRTC.

## Tech Stack

- **Backend**:
  - Django (REST Framework)
  - Django Channels (WebSocket)
  - Janus Gateway (WebRTC Server)
  - PostgreSQL
  - Redis (for WebSocket and caching)

- **Frontend**:
  - React
  - Vite
  - WebRTC
  - TailwindCSS
  - Redux Toolkit

## Prerequisites

- Python 3.9+
- Node.js 18+
- Docker & Docker Compose
- Janus Gateway

## Development Setup

1. Clone the repository
2. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```

4. Set up Janus Gateway:
   ```bash
   docker-compose up janus
   ```

5. Run the development servers:
   ```bash
   # Backend
   python manage.py runserver

   # Frontend
   npm run dev
   ```

## Features

- Real-time video conferencing
- Interactive virtual classrooms
- Course management
- Student progress tracking
- Live chat and messaging
- Screen sharing
- Recording capabilities
- User authentication and authorization

## License

MIT
