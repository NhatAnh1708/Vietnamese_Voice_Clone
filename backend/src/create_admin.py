#!/usr/bin/env python3
"""
Script to create admin user for development purposes
Usage: python create_admin.py
"""
import sys
import os
from datetime import datetime

# Add the src directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from passlib.context import CryptContext
from pymongo import MongoClient
from db.mongo_client import db

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin_user():
    """Create admin user with admin@gmail.com / admin123"""
    
    admin_email = "admin@gmail.com"
    admin_password = "admin123"
    admin_name = "Admin User"
    
    # Check if admin user already exists
    existing_admin = db.users.find_one({"email": admin_email})
    if existing_admin:
        print(f"Admin user with email {admin_email} already exists!")
        print(f"User ID: {existing_admin['_id']}")
        print(f"Name: {existing_admin.get('name', 'No name')}")
        print(f"Created at: {existing_admin.get('created_at', 'Unknown')}")
        return existing_admin
    
    # Hash the password
    hashed_password = pwd_context.hash(admin_password)
    
    # Create admin user document
    admin_user = {
        "email": admin_email,
        "name": admin_name,
        "password": hashed_password,
        "is_admin": True,  # Add admin flag
        "created_at": datetime.utcnow(),
        "role": "admin"  # Add role field
    }
    
    try:
        # Insert admin user into database
        result = db.users.insert_one(admin_user)
        
        print("✅ Admin user created successfully!")
        print(f"Email: {admin_email}")
        print(f"Password: {admin_password}")
        print(f"Name: {admin_name}")
        print(f"User ID: {result.inserted_id}")
        print(f"Role: admin")
        print(f"Created at: {admin_user['created_at']}")
        
        return admin_user
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        return None

def test_admin_login():
    """Test admin login credentials"""
    admin_email = "admin@gmail.com"
    admin_password = "admin123"
    
    # Find admin user
    admin_user = db.users.find_one({"email": admin_email})
    if not admin_user:
        print(f"❌ Admin user not found!")
        return False
    
    # Verify password
    is_valid = pwd_context.verify(admin_password, admin_user["password"])
    
    if is_valid:
        print("✅ Admin login test successful!")
        return True
    else:
        print("❌ Admin login test failed!")
        return False

if __name__ == "__main__":
    print("🚀 Creating admin user for development...")
    print("=" * 50)
    
    try:
        # Create admin user
        admin_user = create_admin_user()
        
        if admin_user:
            print("\n" + "=" * 50)
            print("🔐 Testing admin login...")
            test_admin_login()
            
            print("\n" + "=" * 50)
            print("📋 DEVELOPMENT CREDENTIALS:")
            print("Email: admin@gmail.com")
            print("Password: admin123")
            print("=" * 50)
        
    except Exception as e:
        print(f"❌ Script error: {e}")
        sys.exit(1) 