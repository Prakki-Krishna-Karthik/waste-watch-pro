import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
    MONGO_DB = os.getenv('MONGO_DB', 'wastewatch_pro')
    SECRET_KEY = os.getenv('SECRET_KEY', 'wastewatch_secret_key_2026')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'wastewatch_jwt_secret_2026')
    DEBUG = True
    CURRENCY = '₹'