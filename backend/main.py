from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="EDUTRACK API")

# Setup CORS
origins = [
    "http://localhost",
    "http://localhost:5173", # Vite default port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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
