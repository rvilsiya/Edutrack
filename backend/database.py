import os
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = MongoClient(MONGODB_URI, tlsCAFile=certifi.where())

# Connect to the edutrack database
db = client.edutrack

# Collections
users_collection = db.users
courses_collection = db.courses
quizzes_collection = db.quizzes
jobs_collection = db.jobs
certificates_collection = db.certificates

def get_db():
    return db
