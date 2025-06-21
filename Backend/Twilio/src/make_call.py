# Download the helper library from https://www.twilio.com/docs/python/install
import os
from twilio.rest import Client

# Find your Account SID and Auth Token at twilio.com/console
# and set the environment variables. See http://twil.io/secure
account_sid = "ACc3ce8798bff5cc0dc18495331eaab6e6"
auth_token = "b506eeec0762368a705e59a8cf4000cd"
client = Client(account_sid, auth_token)

call = client.calls.create(
    url="http://demo.twilio.com/docs/voice.xml",
    to="+917204663202",  # Fixed: Added country code +91 for India
    from_="+15043184187",
)

print(call.sid)