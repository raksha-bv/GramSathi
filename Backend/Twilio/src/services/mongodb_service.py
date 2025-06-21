from pymongo import MongoClient
from config.settings import Config
from datetime import datetime
from typing import List, Dict, Optional
import logging

class MongoDBService:
    def __init__(self):
        try:
            self.client = MongoClient(Config.MONGODB_URI)
            self.db = self.client[Config.MONGODB_DATABASE]
            self.appointments_collection = self.db.appointments
            
            # Test connection
            self.client.admin.command('ping')
            print("MongoDB connection successful")
            
            # Create indexes for better performance
            self.appointments_collection.create_index("phone_number")
            self.appointments_collection.create_index("reminder_datetime")
            self.appointments_collection.create_index("status")
            
        except Exception as e:
            print(f"MongoDB connection failed: {e}")
            raise e
    
    def insert_appointment(self, appointment_data: Dict) -> str:
        """Insert a new appointment"""
        try:
            result = self.appointments_collection.insert_one(appointment_data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error inserting appointment: {e}")
            raise e
    
    def get_appointments(self, phone_number: Optional[str] = None, status: Optional[str] = None) -> List[Dict]:
        """Get appointments with optional filters"""
        try:
            query = {}
            if phone_number:
                query["phone_number"] = phone_number
            if status:
                query["status"] = status
            
            appointments = list(self.appointments_collection.find(query))
            # Convert ObjectId to string for JSON serialization
            for apt in appointments:
                apt["_id"] = str(apt["_id"])
            
            return appointments
        except Exception as e:
            print(f"Error getting appointments: {e}")
            return []
    
    def get_pending_reminders(self) -> List[Dict]:
        """Get appointments that need reminders sent"""
        try:
            now = datetime.now()
            
            query = {
                "status": "scheduled",
                "reminder_datetime": {"$lte": now.isoformat()}
            }
            
            appointments = list(self.appointments_collection.find(query))
            
            for apt in appointments:
                apt["_id"] = str(apt["_id"])
            
            return appointments
        except Exception as e:
            print(f"Error getting pending reminders: {e}")
            return []
    
    def update_appointment_status(self, appointment_id: str, status: str) -> bool:
        """Update appointment status"""
        try:
            from bson import ObjectId
            result = self.appointments_collection.update_one(
                {"_id": ObjectId(appointment_id)},
                {"$set": {"status": status, "updated_at": datetime.now().isoformat()}}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating appointment status: {e}")
            return False
    
    def delete_appointment(self, appointment_id: str) -> bool:
        """Delete an appointment"""
        try:
            from bson import ObjectId
            result = self.appointments_collection.delete_one({"_id": ObjectId(appointment_id)})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting appointment: {e}")
            return False
    
    def close_connection(self):
        """Close MongoDB connection"""
        try:
            self.client.close()
        except Exception as e:
            print(f"Error closing MongoDB connection: {e}")