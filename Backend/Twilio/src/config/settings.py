import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
    TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
    TWILIO_FLOW_SID = os.getenv('TWILIO_FLOW_SID')
    TWILIO_FROM_NUMBER = os.getenv('TWILIO_FROM_NUMBER')
    SECRET_KEY = os.getenv('SECRET_KEY')
    BASE_URL = os.getenv('BASE_URL')
    
    # MongoDB configuration
    MONGODB_URI = os.getenv('MONGODB_URI')
    MONGODB_DATABASE = os.getenv('MONGODB_DATABASE')