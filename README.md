# EDUTRACK

EDUTRACK is a full-stack platform where users can learn courses, take quizzes, get certificates, and apply for jobs.

## Tech Stack
- Frontend: React.js + Vite + Tailwind CSS
- Backend: FastAPI (Python)
- Database: MongoDB
- Authentication: JWT

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB instance (Atlas or local)

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   # Update MONGODB_URI and JWT_SECRET_KEY as needed
   ```

5. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

The backend will run on `http://localhost:8000`. API docs available at `http://localhost:8000/docs`.

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will run on the port specified by Vite (usually `http://localhost:5173`).

## Environment Variables
See `.env.example` in the backend folder.
