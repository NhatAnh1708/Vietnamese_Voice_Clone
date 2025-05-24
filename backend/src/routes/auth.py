from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from typing import Optional, List
import jwt
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr, Field
from bson.objectid import ObjectId
from db.mongo_client import db
import os
from google.oauth2 import id_token
from google.auth.transport import requests
import httpx

# JWT and password configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', "default_secret_key_for_development")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours
PRODUCTION_MODE = os.environ.get('PRODUCTION_MODE', 'false').lower() == 'true'
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '990510508408-obseipr918cl1fr9crfbubqmqtnlgpp4.apps.googleusercontent.com')

# Models
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

class SpeechHistoryInput(BaseModel):
    text: str
    audio_url: Optional[str] = None
    settings: Optional[dict] = Field(default_factory=dict)

class SpeechHistory(SpeechHistoryInput):
    id: str
    user_id: str
    created_at: datetime

class UpdateProfileRequest(BaseModel):
    name: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class GoogleToken(BaseModel):
    token: str

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

router = APIRouter(prefix="/api/auth")

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = db.users.find_one({"_id": ObjectId(token_data.user_id)})
    if user is None:
        raise credentials_exception
    
    return user

# Conditional authentication dependency based on environment
async def get_production_user(token: str = Depends(oauth2_scheme)):
    """
    Authentication dependency that only enforces authentication in production mode.
    In development mode, it will return a dummy user.
    """
    if not PRODUCTION_MODE:
        # Return a dummy user in development mode
        return {"_id": "dev_user_id", "email": "dev@example.com", "name": "Development User"}
    
    # Use the regular authentication in production
    return await get_current_user(token)

# Routes
@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    # Check if user already exists
    existing_user = db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # Hash the password
    hashed_password = get_password_hash(user.password)
    
    # Create user document
    user_dict = user.dict()
    user_dict.pop("password")
    user_dict["password"] = hashed_password
    user_dict["created_at"] = datetime.utcnow()
    
    # Insert into database
    result = db.users.insert_one(user_dict)
    
    # Return user data
    return {
        "id": str(result.inserted_id),
        "email": user.email,
        "name": user.name
    }

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # Find user
    user = db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"user_id": str(user["_id"])},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/user", response_model=User)
async def read_users_me(current_user = Depends(get_current_user)):
    return {
        "id": str(current_user["_id"]),
        "email": current_user["email"],
        "name": current_user.get("name", "")
    }

@router.put("/update-profile", response_model=User)
async def update_profile(profile_data: UpdateProfileRequest, current_user = Depends(get_current_user)):
    # Update user name
    db.users.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {"name": profile_data.name}}
    )
    
    # Return updated user data
    updated_user = db.users.find_one({"_id": ObjectId(current_user["_id"])})
    
    return {
        "id": str(updated_user["_id"]),
        "email": updated_user["email"],
        "name": updated_user.get("name", "")
    }

@router.post("/change-password")
async def change_password(password_data: ChangePasswordRequest, current_user = Depends(get_current_user)):
    # Verify current password
    if not verify_password(password_data.current_password, current_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Hash the new password
    hashed_password = get_password_hash(password_data.new_password)
    
    # Update password in database
    db.users.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {"password": hashed_password}}
    )
    
    return {"message": "Password changed successfully"}

# Speech History Routes
@router.post("/speech-history", status_code=status.HTTP_201_CREATED)
async def create_speech_history(
    speech_data: SpeechHistoryInput,
    current_user = Depends(get_current_user)
):
    history_entry = speech_data.dict()
    history_entry["user_id"] = current_user["_id"]
    history_entry["created_at"] = datetime.utcnow()
    
    result = db.speech_history.insert_one(history_entry)
    
    return {"id": str(result.inserted_id), "message": "History recorded successfully"}

@router.get("/speech-history")
async def get_speech_history(current_user = Depends(get_current_user)):
    history = list(db.speech_history.find({"user_id": current_user["_id"]}).sort("created_at", -1))
    
    # Convert for JSON serialization
    for entry in history:
        entry["id"] = str(entry.pop("_id"))
        entry["user_id"] = str(entry["user_id"])
        
    return history

@router.get("/speech-history/{history_id}")
async def get_speech_history_entry(history_id: str, current_user = Depends(get_current_user)):
    try:
        entry = db.speech_history.find_one({
            "_id": ObjectId(history_id),
            "user_id": current_user["_id"]
        })
        
        if not entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="History entry not found"
            )
        
        # Convert for JSON serialization
        entry["id"] = str(entry.pop("_id"))
        entry["user_id"] = str(entry["user_id"])
        
        return entry
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid history ID"
        )

@router.delete("/speech-history/{history_id}", status_code=status.HTTP_200_OK)
async def delete_speech_history_entry(history_id: str, current_user = Depends(get_current_user)):
    try:
        result = db.speech_history.delete_one({
            "_id": ObjectId(history_id),
            "user_id": current_user["_id"]
        })
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="History entry not found"
            )
        
        return {"message": "History entry deleted successfully"}
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid history ID"
        )

@router.post("/google-login", response_model=Token)
async def google_login(google_token: GoogleToken):
    try:
        auth_code = google_token.token
        print(f"Received auth code: {auth_code[:10]}... (length: {len(auth_code)})")
        
        client_id = GOOGLE_CLIENT_ID
        client_secret = "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"
        redirect_uri = "http://localhost:3000/api/auth/google-redirect"
        
        # Simple validation
        if not auth_code or len(auth_code) < 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid authorization code"
            )

        print(f"Using client_id: {client_id}")
        print(f"Using client_secret: {client_secret[:5]}...")
        print(f"Using redirect_uri: {redirect_uri}")
        
        # Exchange code for tokens using httpx with explicit form data
        token_url = "https://oauth2.googleapis.com/token"
        
        # Create form data to send to Google
        form_data = {
            "code": auth_code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code"
        }
        
        print("Sending form data to Google:", form_data)
        
        # Make request to Google token endpoint
        async with httpx.AsyncClient() as client:
            response = await client.post(token_url, data=form_data)
            print(f"Google token response status: {response.status_code}")
            
            if response.status_code != 200:
                print(f"Google token error: {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Failed to exchange code: {response.text}"
                )
            
            token_data = response.json()
            access_token = token_data.get("access_token")
            id_token_jwt = token_data.get("id_token")
            
            if not access_token or not id_token_jwt:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Missing tokens in response"
                )
            
            print("Received tokens from Google, fetching user info")
            
            # Use access token to get user info
            userinfo_url = f"https://www.googleapis.com/oauth2/v1/userinfo?access_token={access_token}"
            userinfo_response = await client.get(userinfo_url)
            
            if userinfo_response.status_code != 200:
                print(f"Failed to get user info: {userinfo_response.text}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Failed to get user info"
                )
            
            user_info = userinfo_response.json()
            email = user_info.get("email")
            name = user_info.get("name", "")
            google_id = user_info.get("id")
            
            if not email:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Email not found in user info"
                )
            
            print(f"User authenticated: {email}")
        
        # Check if user exists
        user = db.users.find_one({"email": email})
        
        if not user:
            print(f"Creating new user for: {email}")
            # Create new user if doesn't exist
            user_dict = {
                "email": email,
                "name": name,
                "created_at": datetime.utcnow(),
                "google_id": google_id
            }
            result = db.users.insert_one(user_dict)
            user = db.users.find_one({"_id": result.inserted_id})
        else:
            print(f"Existing user found: {email}")

        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"user_id": str(user["_id"])},
            expires_delta=access_token_expires
        )
        print(f"Access token created for: {email}")

        return {"access_token": access_token, "token_type": "bearer"}

    except Exception as e:
        print(f"Google login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
