from fastapi import APIRouter, HTTPException, status
from models import UserCreate, UserLogin, UserInDB
from database import users_collection
from routes.deps import get_password_hash, verify_password, create_access_token
from datetime import timedelta
from bson import ObjectId
import os

router = APIRouter(prefix="/auth", tags=["auth"])
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

@router.post("/register", response_model=UserInDB)
async def register(user: UserCreate):
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    user_dict = user.model_dump()
    user_dict["password"] = hashed_password
    user_dict["enrolled_courses"] = []
    user_dict["applied_jobs"] = []
    user_dict["role"] = "user"

    result = users_collection.insert_one(user_dict)
    user_dict["_id"] = str(result.inserted_id)
    return user_dict

@router.post("/login")
async def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": str(db_user["_id"]), "name": db_user["name"], "email": db_user["email"], "role": db_user.get("role", "user")}}
