# Docker Compose Development Guide

## Cách sử dụng

File `docker-compose.yml` này đã được cấu hình để chạy:

- **MongoDB**: Database chạy trên port 27017
- **Backend**: FastAPI với UV và uvicorn chạy trên port 8000
- **Frontend**: Next.js development server chạy trên port 3000

## Các lệnh cần thiết

### 1. Khởi chạy tất cả services:
```bash
docker-compose up -d
```

### 2. Xem logs:
```bash
# Xem logs tất cả services
docker-compose logs -f

# Xem logs riêng từng service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### 3. Dừng services:
```bash
docker-compose down
```

### 4. Rebuild containers (khi thay đổi dependencies):
```bash
docker-compose up --build
```

### 5. Vào container để debug:
```bash
# Vào backend container
docker-compose exec backend bash

# Vào frontend container  
docker-compose exec frontend sh
```

## Cấu hình môi trường

Các biến môi trường quan trọng:

### MongoDB:
- Username: `admin`
- Password: `password`
- Connection string: `mongodb://admin:password@mongodb:27017/`
- Database name: `synsere_tts`

### Backend:
- Port: `8000`
- Command: `uvicorn main:app --host 0.0.0.0 --port 8000 --reload`
- Working directory: `/app/src`
- Virtual environment: UV venv được khởi tạo mới trong container

### Frontend:
- Port: `3000`
- Command: `npm run dev -- --hostname 0.0.0.0`
- API URL: `http://backend:8000` (trong Docker network)

## Docker Network Configuration

**Vấn đề đã được giải quyết:**
- Frontend và Backend communicate qua Docker network name `backend:8000`
- Không còn hardcode `localhost:8000` 
- Sử dụng environment variable `NEXT_PUBLIC_API_URL=http://backend:8000`

**API URL Management:**
- Tạo utility file `frontend/src/utils/api.ts` để centralize API configuration
- Tự động switch giữa `backend:8000` (Docker) và `localhost:8000` (local development)
- Updated các components quan trọng để sử dụng utility này

## Architecture Decision: Commands

**Lý do không dùng CMD trong Dockerfile:**
- `command` trong docker-compose.yml sẽ override `CMD` trong Dockerfile
- Để tránh confusion, tất cả commands được define trong docker-compose.yml
- Điều này giúp centralized configuration và dễ customize cho development

## Volumes được mount:

- `./backend:/app` - Hot reload cho backend (code changes)
- `./frontend:/app` - Hot reload cho frontend (code changes)
- `mongodb_data:/data/db` - Persistent data cho MongoDB

## Network:

Tất cả services chạy trong cùng network `app-network` để có thể communicate với nhau.

## Lưu ý quan trọng:

1. **Backend**: Sử dụng UV package manager với virtual environment được khởi tạo mới trong container
2. **Frontend**: Chạy trong development mode với hot reload
3. **MongoDB**: Data được persist qua các lần restart
4. **Dependencies**: MongoDB → Backend → Frontend
5. **FastAPI**: Chạy với uvicorn và auto-reload enabled
6. **Hot Reload**: Cả frontend và backend đều tự động reload khi code thay đổi
7. **Commands**: Tất cả commands được define trong docker-compose.yml, không trong Dockerfile
8. **Network**: Frontend kết nối tới Backend qua service name `backend:8000`, không qua `localhost`

## Truy cập services:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- FastAPI Docs: http://localhost:8000/docs
- MongoDB: localhost:27017

## Troubleshooting

### Nếu frontend không connect được backend:
1. Check environment variable `NEXT_PUBLIC_API_URL` được set đúng chưa
2. Verify network connectivity: `docker-compose exec frontend ping backend`
3. Check logs: `docker-compose logs -f frontend` và `docker-compose logs -f backend` 