from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="EDUTRACK API")

# Setup CORS
origins = [
    "https://edutrack-psi-nine.vercel.app",
    "https://localhost:3000", # Vite default port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routes import auth, courses, quiz, jobs, certificate, user

app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(quiz.router)
app.include_router(jobs.router)
app.include_router(certificate.router)
app.include_router(user.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to EDUTRACK API"}
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Backend working"}

@app.get("/jobs")
def get_jobs():
    return [
        {"title": "Software Engineer"},
        {"title": "Data Analyst"}
    ]
