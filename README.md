# Missing Person Identification System

A full-stack web application for reporting and identifying missing persons using AI-powered facial recognition. Built with **FastAPI**, **React (TypeScript)**, **PostgreSQL (pgvector)**, and **DeepFace**.

## Features

- **Face Recognition Search** — Upload a photo to find potential matches using DeepFace (FaceNet model) and pgvector cosine similarity
- **Report Missing Persons** — Authenticated users can submit detailed reports with photos
- **Public Browse** — Anyone can browse the missing persons database with filters and pagination
- **Admin Dashboard** — Manage users, update case statuses, view statistics
- **Google OAuth** — Secure authentication via Google Sign-In
- **Role-Based Access** — Public (browse), User (report + search), Admin (full management)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy (async), Pydantic |
| Database | PostgreSQL with pgvector extension |
| Face Recognition | DeepFace (FaceNet model) |
| Authentication | Google OAuth 2.0 + JWT |
| Validation | Zod (frontend), Pydantic (backend) |
| Infrastructure | Docker, Docker Compose |

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── config.py            # Settings (pydantic-settings)
│   │   ├── database.py          # SQLAlchemy async engine
│   │   ├── dependencies.py      # Auth dependencies
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── routers/             # API endpoints
│   │   ├── services/            # Business logic
│   │   ├── utils/               # JWT helpers
│   │   └── middleware/          # Error handlers
│   ├── alembic/                 # Database migrations
│   ├── media/                   # Uploaded photos
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios client & API functions
│   │   ├── components/          # Reusable UI components
│   │   ├── context/             # Auth context
│   │   ├── pages/               # Page components
│   │   ├── schemas/             # Zod validation schemas
│   │   ├── types/               # TypeScript interfaces
│   │   └── utils/               # Error handling utilities
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## Prerequisites

- **Docker & Docker Compose** (for PostgreSQL)
- **Python 3.11+** (for backend)
- **Node.js 18+** (for frontend)
- **Google OAuth credentials** (Client ID & Secret)

## Setup

### 1. Clone and configure environment

```bash
git clone <your-repo-url>
cd missing-person-identification

# Copy environment template
cp .env.example .env
```

Edit `.env` and fill in:
- `GOOGLE_CLIENT_ID` — from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- `GOOGLE_CLIENT_SECRET` — same source
- `JWT_SECRET_KEY` — generate a secure random string

### 2. Start PostgreSQL

```bash
docker-compose up -d db
```

### 3. Backend setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000` with docs at `http://localhost:8000/docs`.

### 4. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_GOOGLE_CLIENT_ID=your-google-client-id" > .env.local
echo "VITE_API_BASE_URL=/api" >> .env.local

# Start dev server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### 5. Full stack with Docker (optional)

```bash
# Start everything (db + backend + frontend)
docker-compose --profile full up -d
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services > Credentials**
4. Create an **OAuth 2.0 Client ID** (Web application)
5. Add authorized JavaScript origins: `http://localhost:5173`
6. Add authorized redirect URIs: `http://localhost:5173`
7. Copy the Client ID and Secret to your `.env` file

## API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/health` | Public | Health check |
| POST | `/api/auth/google` | Public | Google OAuth login |
| GET | `/api/missing-persons` | Public | List missing persons (paginated) |
| GET | `/api/missing-persons/:id` | Public | Get person details |
| POST | `/api/missing-persons` | User | Create missing person report |
| PUT | `/api/missing-persons/:id` | User/Admin | Update person record |
| PATCH | `/api/missing-persons/:id/status` | Admin | Update case status |
| DELETE | `/api/missing-persons/:id` | Admin | Delete person record |
| GET | `/api/missing-persons/statistics` | Admin | Get case statistics |
| POST | `/api/upload` | User | Upload photo |
| POST | `/api/search/face` | User | Search by face |
| GET | `/api/admin/users` | Admin | List all users |
| PATCH | `/api/admin/users/:id/role` | Admin | Update user role |

## Usage

1. **Browse** — Visit `/browse` to see all reported missing persons (no login required)
2. **Login** — Click "Sign in with Google" to authenticate
3. **Report** — Navigate to `/report` to submit a missing person report with photo
4. **Search** — Go to `/search`, upload a photo, and find potential matches
5. **Admin** — Admin users can access `/admin` for user and case management

## Face Recognition

The system uses **DeepFace** with the **FaceNet** model to generate 128-dimensional face embeddings. These are stored in PostgreSQL using the **pgvector** extension, enabling fast cosine similarity search.

- On report submission, a face embedding is automatically generated from the uploaded photo
- During search, the uploaded photo's embedding is compared against all stored embeddings
- Results are ranked by similarity score with a configurable threshold

## License

MIT
