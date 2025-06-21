import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import threading
import time
from .twilio_service import TwilioService
import re

class AppointmentScheduler:
    def __init__(self):
        self.twilio_service = TwilioService()
        self.appointments_file = "scheduled_appointments.json"
        self.appointments: List[Dict] = self.load_appointments()
        self.running = False
        self.scheduler_thread = None
    
    def load_appointments(self) -> List[Dict]:
        """Load appointments from file"""
        try:
            if os.path.exists(self.appointments_file):
                with open(self.appointments_file, 'r') as f:
                    return json.load(f)
        except Exception as e:
            print(f"Error loading appointments: {e}")
        return []
    
    def save_appointments(self):
        """Save appointments to file"""
        try:
            with open(self.appointments_file, 'w') as f:
                json.dump(self.appointments, f, indent=2)
        except Exception as e:
            print(f"Error saving appointments: {e}")
    
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
                "id": f"{phone_number}_{int(time.time())}",
                "phone_number": phone_number,
                "appointment_datetime": appointment_time.isoformat(),
                "reminder_datetime": reminder_time.isoformat(),
                "appointment_type": appointment_type,
                "status": "scheduled",
                "created_at": datetime.now().isoformat()
            }
            
            self.appointments.append(appointment)
            self.save_appointments()
            
            # Start scheduler if not running
            if not self.running:
                self.start_scheduler()
            
            return {
                "success": True,
                "appointment_id": appointment["id"],
                "appointment_time": appointment_time.isoformat(),
                "reminder_time": reminder_time.isoformat(),
                "message": f"Appointment reminder scheduled for {reminder_time.strftime('%Y-%m-%d %H:%M')} (1 hour before your {appointment_type} appointment)"
            }
            
        except Exception as e:
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
        """Main scheduler loop - checks every 30 seconds"""
        while self.running:
            try:
                now = datetime.now()
                
                for appointment in self.appointments[:]:
                    if appointment["status"] != "scheduled":
                        continue
                    
                    reminder_time = datetime.fromisoformat(appointment["reminder_datetime"])
                    
                    # Check if it's time for the reminder (within 1 minute window)
                    if now >= reminder_time and now <= reminder_time + timedelta(minutes=1):
                        print(f"Making reminder call for appointment: {appointment['id']}")
                        
                        try:
                            call_sid = self.twilio_service.make_appointment_reminder_call(
                                appointment["phone_number"],
                                appointment["appointment_type"]
                            )
                            
                            appointment["status"] = "called"
                            appointment["call_sid"] = call_sid
                            appointment["called_at"] = now.isoformat()
                            
                            print(f"Reminder call made successfully: {call_sid}")
                            
                        except Exception as e:
                            print(f"Failed to make reminder call: {e}")
                            appointment["status"] = "failed"
                            appointment["error"] = str(e)
                        
                        self.save_appointments()
                
                time.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                print(f"Error in scheduler loop: {e}")
                time.sleep(60)
    
    def get_appointments(self, phone_number: Optional[str] = None) -> List[Dict]:
        """Get appointments"""
        if phone_number:
            return [apt for apt in self.appointments if apt["phone_number"] == phone_number]
        return self.appointments