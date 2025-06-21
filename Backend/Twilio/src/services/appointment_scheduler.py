import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from .twilio_service import TwilioService
from .mongodb_service import MongoDBService
import threading
import time
import re

class AppointmentScheduler:
    def __init__(self):
        self.twilio_service = TwilioService()
        self.mongodb_service = MongoDBService()
        self.running = False
        self.scheduler_thread = None
        
        # Start scheduler immediately
        self.start_scheduler()
    
    def schedule_appointment_reminder(self, phone_number: str, appointment_datetime: str, appointment_type: str = "gynacologist") -> Dict:
        """Schedule an appointment reminder 1 hour before the appointment"""
        try:
            # Parse the appointment datetime
            appointment_time = self.parse_appointment_datetime(appointment_datetime)
            
            # Calculate reminder time (1 hour before appointment)
            reminder_time = appointment_time - timedelta(hours=1)
            
            # Don't schedule if reminder time is in the past
            if reminder_time <= datetime.now():
                return {
                    "success": False,
                    "error": "Cannot schedule reminder for past appointments. Please provide a future appointment time."
                }
            
            # Create appointment record
            appointment = {
                "phone_number": phone_number,
                "appointment_datetime": appointment_time.isoformat(),
                "reminder_datetime": reminder_time.isoformat(),
                "appointment_type": appointment_type,
                "status": "scheduled",
                "created_at": datetime.now().isoformat()
            }
            
            # Save to MongoDB
            appointment_id = self.mongodb_service.insert_appointment(appointment)
            print(f"Appointment scheduled with ID: {appointment_id}")
            
            # Start scheduler if not running
            if not self.running:
                self.start_scheduler()
            
            return {
                "success": True,
                "appointment_id": appointment_id,
                "appointment_time": appointment_time.isoformat(),
                "reminder_time": reminder_time.isoformat(),
                "message": f"Appointment reminder scheduled for {reminder_time.strftime('%Y-%m-%d %H:%M')} (1 hour before your {appointment_type} appointment)"
            }
            
        except Exception as e:
            print(f"Error scheduling appointment: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def parse_appointment_datetime(self, datetime_string: str) -> datetime:
        """Parse various datetime formats with improved time handling"""
        datetime_string = datetime_string.lower().strip()
        now = datetime.now()
        
        # Handle relative dates with times
        if "tomorrow" in datetime_string:
            base_date = now + timedelta(days=1)
            time_part = self.extract_time_from_string(datetime_string)
            if time_part:
                return base_date.replace(hour=time_part[0], minute=time_part[1], second=0, microsecond=0)
            else:
                return base_date.replace(hour=9, minute=0, second=0, microsecond=0)
        
        elif "today" in datetime_string:
            base_date = now
            time_part = self.extract_time_from_string(datetime_string)
            if time_part:
                appointment_time = base_date.replace(hour=time_part[0], minute=time_part[1], second=0, microsecond=0)
                # If time has passed today, schedule for tomorrow
                if appointment_time <= now:
                    appointment_time = appointment_time + timedelta(days=1)
                return appointment_time
            else:
                return base_date.replace(hour=9, minute=0, second=0, microsecond=0)
        
        elif "next week" in datetime_string:
            base_date = now + timedelta(days=7)
            time_part = self.extract_time_from_string(datetime_string)
            if time_part:
                return base_date.replace(hour=time_part[0], minute=time_part[1], second=0, microsecond=0)
            else:
                return base_date.replace(hour=9, minute=0, second=0, microsecond=0)
        
        # Try to parse complete datetime formats
        datetime_formats = [
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%d %H:%M",
            "%d/%m/%Y %H:%M",
            "%d-%m-%Y %H:%M",
            "%B %d %H:%M",  # "June 25 14:30"
            "%B %d at %I:%M %p",  # "June 25 at 3:30 PM"
        ]
        
        for fmt in datetime_formats:
            try:
                parsed_time = datetime.strptime(datetime_string, fmt)
                # Add current year if not specified
                if parsed_time.year == 1900:
                    parsed_time = parsed_time.replace(year=now.year)
                return parsed_time
            except ValueError:
                continue
        
        # If no specific format works, try to extract time from string
        time_part = self.extract_time_from_string(datetime_string)
        if time_part:
            # Default to tomorrow if only time is specified
            return (now + timedelta(days=1)).replace(hour=time_part[0], minute=time_part[1], second=0, microsecond=0)
        
        # Default fallback
        return (now + timedelta(days=1)).replace(hour=9, minute=0, second=0, microsecond=0)
    
    def extract_time_from_string(self, text: str) -> Optional[tuple]:
        """Extract time (hour, minute) from text"""
        # Patterns for time extraction
        patterns = [
            r'(\d{1,2}):(\d{2})\s*(am|pm)',  # "3:30 PM"
            r'(\d{1,2})\s*(am|pm)',          # "3 PM"
            r'(\d{1,2}):(\d{2})',            # "15:30" (24-hour)
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                hour = int(match.group(1))
                minute = int(match.group(2)) if len(match.groups()) >= 2 and match.group(2).isdigit() else 0
                
                # Handle AM/PM
                if len(match.groups()) >= 3:
                    period = match.group(3).lower()
                    if period == 'pm' and hour != 12:
                        hour += 12
                    elif period == 'am' and hour == 12:
                        hour = 0
                
                return (hour, minute)
        
        return None
    
    def start_scheduler(self):
        """Start the appointment scheduler"""
        if not self.running:
            self.running = True
            self.scheduler_thread = threading.Thread(target=self._scheduler_loop)
            self.scheduler_thread.daemon = True
            self.scheduler_thread.start()
            print("Appointment scheduler started")
    
    def _scheduler_loop(self):
        """Main scheduler loop - checks every 10 seconds"""
        print("Scheduler loop started")
        while self.running:
            try:
                current_time = datetime.now()
                print(f"Scheduler check at: {current_time.isoformat()}")
                
                # Get pending reminders from MongoDB
                pending_appointments = self.mongodb_service.get_pending_reminders()
                print(f"Found {len(pending_appointments)} pending appointments")
                
                for appointment in pending_appointments:
                    print(f"Processing appointment: {appointment}")
                    reminder_time = datetime.fromisoformat(appointment['reminder_datetime'])
                    print(f"Reminder time: {reminder_time}, Current time: {current_time}")
                    
                    try:
                        print(f"Making call to: {appointment['phone_number']}")
                        
                        # Make the reminder call
                        call_sid = self.twilio_service.make_appointment_reminder_call(
                            appointment["phone_number"],
                            appointment["appointment_type"]
                        )
                        
                        if call_sid:
                            # Update status to 'called'
                            self.mongodb_service.update_appointment_status(
                                appointment["_id"], 
                                "reminder_sent"
                            )
                            print(f"Reminder call made successfully. Call SID: {call_sid}")
                        else:
                            print("Call SID is None - call failed")
                        
                    except Exception as e:
                        print(f"Error processing appointment {appointment['_id']}: {e}")
                        # Update status to 'failed'
                        self.mongodb_service.update_appointment_status(
                            appointment["_id"], 
                            "failed"
                        )
            
            except Exception as e:
                print(f"Error in scheduler loop: {e}")
        
        time.sleep(10)  # Check every 10 seconds
    
    def get_appointments(self, phone_number: Optional[str] = None) -> List[Dict]:
        """Get appointments from MongoDB"""
        return self.mongodb_service.get_appointments(phone_number=phone_number)
    
    def stop_scheduler(self):
        """Stop the scheduler"""
        self.running = False
        if self.scheduler_thread:
            self.scheduler_thread.join()
        print("Appointment scheduler stopped")