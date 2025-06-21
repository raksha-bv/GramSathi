import requests
import json
from datetime import datetime, timedelta

# Test scheduling an appointment
def test_schedule_appointment():
    url = "http://127.0.0.1:5000/api/schedule-appointment"
    
    # Schedule for 1 minute from now (for testing)
    appointment_time = datetime.now() + timedelta(minutes=1)
    
    data = {
        "phone_number": "+917204663202",  # Your verified number
        "appointment_date": appointment_time.strftime("%Y-%m-%d %H:%M"),
        "appointment_type": "gynacologist"
    }
    
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

# Test getting appointments
def test_get_appointments():
    url = "http://127.0.0.1:5000/api/appointments"
    response = requests.get(url)
    print(f"Appointments: {response.json()}")

if __name__ == "__main__":
    print("Testing appointment scheduling...")
    test_schedule_appointment()
    print("\nGetting appointments...")
    test_get_appointments()