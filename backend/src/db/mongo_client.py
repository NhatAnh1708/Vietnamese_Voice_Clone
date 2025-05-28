from pymongo import MongoClient
import os

# MongoDB connection string - replace with your actual connection string or use environment variables
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://admin:password@localhost:27017/?authSource=admin')
DB_NAME = os.environ.get('DB_NAME', 'synsere_tts')

# Create client
try:
    # Connect to MongoDB
    client = MongoClient(MONGO_URI)
    
    # Test connection
    client.admin.command('ping')
    print("MongoDB connection successful")
except Exception as e:
    print(f"MongoDB connection error: {e}")
    raise

db = client[DB_NAME]

# Create indexes
def setup_indexes():
    # User indexes
    db.users.create_index('email', unique=True)
    
    # Speech history indexes
    db.speech_history.create_index('user_id')
    db.speech_history.create_index([('user_id', 1), ('created_at', -1)])

# Call this function when the application starts
setup_indexes()

# if __name__ == '__main__':
#     client = MongoClient(MONGO_URI)
#     db = client[DB_NAME]
#     client.admin.command('ping')
#     setup_indexes()
#     print("Indexes created successfully")