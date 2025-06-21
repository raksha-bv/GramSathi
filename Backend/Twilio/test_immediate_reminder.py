import requests
import json
from datetime import datetime, timedelta

def test_immediate_appointment_reminder():
    """Test making an appointment reminder call in 30 seconds"""
    url = "http://127.0.0.1:5000/api/schedule-appointment"
    
    # Schedule for 1 minute and 30 seconds from now (so reminder will be in 30 seconds)
    appointment_time = datetime.now() + timedelta(minutes=1, seconds=30)
    
    data = {
        "phone_number": "+917204663202",  # Your verified number
        "appointment_datetime": appointment_time.strftime("%Y-%m-%d %H:%M:%S"),
        "appointment_type": "gynacologist"
    }
    
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"\nAppointment scheduled!")
        print(f"Appointment time: {result.get('appointment_time')}")
        print(f"Reminder call will be made at: {result.get('reminder_time')}")
        print(f"You should receive a call in about 30 seconds!")

def test_direct_call():
    """Test making a direct appointment call right now"""
    from twilio.rest import Client
    
    account_sid = "ACc3ce8798bff5cc0dc18495331eaab6e6"
    auth_token = "b506eeec0762368a705e59a8cf4000cd"
    client = Client(account_sid, auth_token)
    
    from twilio.twiml.voice_response import VoiceResponse
    
    response = VoiceResponse()
    response.say(
        "Hello! This is your appointment reminder. You have a gynacologist appointment today. Please make sure to attend your scheduled appointment. Thank you!",
        voice='alice'
    )
    response.hangup()
    
    call = client.calls.create(
        twiml=str(response),
        to="+917204663202",
        from_="+15043184187"
    )
    
    print(f"Direct call initiated: {call.sid}")

if __name__ == "__main__":
    print("Choose test:")
    print("1. Schedule reminder (30 seconds)")
    print("2. Make direct call now")
    
    choice = input("Enter choice (1 or 2): ")
    
    if choice == "1":
        test_immediate_appointment_reminder()
    elif choice == "2":
        test_direct_call()
    else:
        print("Invalid choice")