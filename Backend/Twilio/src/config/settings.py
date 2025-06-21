import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', 'ACc3ce8798bff5cc0dc18495331eaab6e6')
    TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', 'b506eeec0762368a705e59a8cf4000cd')
    TWILIO_FLOW_SID = os.getenv('TWILIO_FLOW_SID', 'FW17f23d0b19794e9b7a126ed4cfa77491')
    TWILIO_FROM_NUMBER = os.getenv('TWILIO_FROM_NUMBER', '+15043184187')
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key')
    BASE_URL = os.getenv('BASE_URL', 'http://localhost:5000')  # For TwiML URLs