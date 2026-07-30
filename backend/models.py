from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    enrolled_courses: List[str] = []
    applied_jobs: List[str] = []
    role: str = "user" # user, admin

class CourseBase(BaseModel):
    title: str
    description: str
    video_link: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class CourseInDB(CourseBase):
    id: str = Field(alias="_id")

class Question(BaseModel):
    question_text: str
    options: List[str]
    correct_option_index: int

class QuizBase(BaseModel):
    course_id: str
    questions: List[Question]

class QuizCreate(QuizBase):
    pass

class QuizInDB(QuizBase):
    id: str = Field(alias="_id")

class QuizSubmission(BaseModel):
    answers: List[int] # List of chosen option indexes

class JobBase(BaseModel):
    title: str
    company: str
    description: str
    location: str

class JobCreate(JobBase):
    pass

class JobInDB(JobBase):
    id: str = Field(alias="_id")

class CertificateBase(BaseModel):
    user_id: str
    course_id: str
    user_name: str
    course_name: str
    date_issued: datetime

class CertificateInDB(CertificateBase):
    id: str = Field(alias="_id")
