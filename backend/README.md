# Synsere TTS Backend API

API service for user authentication and speech generation history using MongoDB.

## Setup

### Option 1: Local Setup

1. Install dependencies:
```
pip install -r requirements.txt
```

2. Configure MongoDB:
   - Install MongoDB or use MongoDB Atlas
   - Set environment variables (optional):
     - `MONGO_URI`: MongoDB connection string (default: 'mongodb://localhost:27017')
     - `DB_NAME`: Database name (default: 'synsere_tts')
     - `JWT_SECRET_KEY`: Secret key for JWT token generation

3. Run the application:
```
python run.py
```

### Option 2: Docker Setup

1. Make sure Docker and Docker Compose are installed on your system.

2. Run the application with MongoDB using Docker Compose:
```
docker-compose up -d
```

This will:
- Start MongoDB with authentication
- Build and start the backend API
- Set up appropriate environment variables
- Create a network for communication between services

3. Access the API at http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/user` - Get current user info (requires authentication)

### Speech Generation History
- `POST /api/auth/speech-history` - Add new speech generation entry (requires authentication)
- `GET /api/auth/speech-history` - Get all history entries for the user (requires authentication)
- `GET /api/auth/speech-history/<history_id>` - Get specific history entry (requires authentication)
- `DELETE /api/auth/speech-history/<history_id>` - Delete a history entry (requires authentication)

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## MongoDB Connection

When running with Docker, MongoDB is available at:
- URI: `mongodb://admin:password@mongodb:27017/`
- Authentication: Enabled with username `admin` and password `password`
- Database: `synsere_tts`

For security in production:
1. Change the MongoDB credentials in docker-compose.yml
2. Set a strong `JWT_SECRET_KEY` in docker-compose.yml
