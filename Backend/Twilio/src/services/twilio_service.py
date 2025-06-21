import os
from datetime import datetime, timedelta
from twilio.rest import Client
from config.settings import Config
import json

class TwilioService:
    def __init__(self):
        self.account_sid = Config.TWILIO_ACCOUNT_SID
        self.auth_token = Config.TWILIO_AUTH_TOKEN
        self.flow_sid = Config.TWILIO_FLOW_SID
        self.from_number = Config.TWILIO_FROM_NUMBER
        self.client = Client(self.account_sid, self.auth_token)
    
    def make_call(self, to_number):
        try:
            execution = self.client.studio.v2.flows(
                self.flow_sid
            ).executions.create(
                to=to_number, 
                from_=self.from_number
            )
            return execution.sid
        except Exception as e:
            raise Exception(f"Failed to make call: {str(e)}")
    
    def make_appointment_reminder_call(self, to_number, appointment_type="gynacologist"):
        """Make a call with appointment reminder message using inline TwiML"""
        try:
            from twilio.twiml.voice_response import VoiceResponse
            
            # Create comprehensive TwiML response
            response = VoiceResponse()
            
            # Shorter, more concise message
            main_message = (
                f"Hello! Reminder: You have a {appointment_type} appointment today. "
                f"Please attend on time. Thank you!"
            )
            
            response.say(main_message, voice='alice', language='en-US')
            response.pause(length=1)
            response.hangup()
            
            print(f"Generated TwiML: {str(response)}")  # Debug print
            
            call = self.client.calls.create(
                twiml=str(response),
                to=to_number,
                from_=self.from_number
            )
            return call.sid
        except Exception as e:
            raise Exception(f"Failed to make appointment reminder call: {str(e)}")
    
    def make_appointment_reminder_call_inline(self, to_number, appointment_type="gynacologist"):
        """Alternative: Make a call with inline TwiML (backup method)"""
        try:
            from twilio.twiml.voice_response import VoiceResponse
            
            # Create TwiML response
            response = VoiceResponse()
            response.say(
                f"Hello! This is a friendly reminder that you have a {appointment_type} appointment today. "
                f"Please make sure to attend your scheduled appointment on time. "
                f"If you need to reschedule, please contact your healthcare provider. "
                f"Thank you and have a great day!",
                voice='alice'
            )
            response.pause(length=2)
            response.hangup()
            
            call = self.client.calls.create(
                twiml=str(response),
                to=to_number,
                from_=self.from_number
            )
            return call.sid
        except Exception as e:
            raise Exception(f"Failed to make appointment reminder call: {str(e)}")
    
    def schedule_call(self, to_number, scheduled_time, appointment_type="gynacologist"):
        """Schedule a call for a specific time"""
        try:
            # For immediate implementation, we'll use a simple approach
            # In production, you'd want to use a proper job scheduler like Celery
            
            # Calculate delay in seconds
            now = datetime.now()
            delay_seconds = (scheduled_time - now).total_seconds()
            
            if delay_seconds <= 0:
                # If time has passed, make call immediately
                return self.make_appointment_reminder_call(to_number, appointment_type)
            
            # For now, return scheduled info (you'd implement actual scheduling)
            return {
                "scheduled": True,
                "call_time": scheduled_time.isoformat(),
                "to_number": to_number,
                "appointment_type": appointment_type,
                "delay_seconds": delay_seconds
            }
        except Exception as e:
            raise Exception(f"Failed to schedule call: {str(e)}")