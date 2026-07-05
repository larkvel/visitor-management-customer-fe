# Visitor Management Customer Frontend

React + Vite customer dashboard for visitor registration, check-in/check-out, and company management.

## Features

- Company and user selection
- Visitor dashboard with metrics
- Visitor registration and management
- Check-in/check-out functionality
- User management (for company admins)
- Role-based access control

## Tech Stack

- **Frontend**: React 18.3.1
- **Build Tool**: Vite 5.4.2
- **UI Icons**: Lucide React 0.468.0
- **Web Server**: Nginx 1.27-alpine

## Setup

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
VITE_API_BASE_URL=http://localhost:3000
```

3. Start dev server:
```bash
npm run dev
```

Dev server will be available at `http://localhost:5173`

### Docker

Build and run with Docker:
```bash
docker build -t visitor-management-customer-fe \
  --build-arg VITE_API_BASE_URL=http://api.example.com \
  .
docker run -p 8081:80 visitor-management-customer-fe
```