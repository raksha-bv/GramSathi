# Download the helper library from https://www.twilio.com/docs/python/install
import os
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse

# Find your Account SID and Auth Token at twilio.com/console
# and set the environment variables. See http://twil.io/secure
account_sid = "ACc3ce8798bff5cc0dc18495331eaab6e6"
auth_token = "b506eeec0762368a705e59a8cf4000cd"
from_number = "+15043184187"
to_number = "+917204663202"

client = Client(account_sid, auth_token)

# Test 1: Simple call with TwiML URL
print("Test 1: Making call with TwiML URL...")
try:
    call = client.calls.create(
        url="http://demo.twilio.com/docs/voice.xml",
        to=to_number,
        from_=from_number,
    )
    print(f"Call SID: {call.sid}")
except Exception as e:
    print(f"Error: {e}")

# Test 2: Call with inline TwiML (appointment reminder)
print("\nTest 2: Making appointment reminder call...")
try:
    response = VoiceResponse()
    response.say(
        "Hello! This is a test appointment reminder. You have a gynacologist appointment today. Please attend on time. Thank you!",
        voice='alice'
    )
    response.hangup()
    
    call = client.calls.create(
        twiml=str(response),
        to=to_number,
        from_=from_number
    )
    print(f"Appointment reminder call SID: {call.sid}")
    print(f"TwiML used: {str(response)}")
except Exception as e:
    print(f"Error: {e}")