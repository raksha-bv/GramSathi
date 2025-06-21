from flask import Blueprint, request, jsonify
from services.twilio_service import TwilioService
from services.appointment_scheduler import AppointmentScheduler

class CallController:
    def __init__(self):
        self.twilio_service = TwilioService()
        self.appointment_scheduler = AppointmentScheduler()
        self.blueprint = Blueprint('call', __name__)
        self._register_routes()
    
    def _register_routes(self):
        self.blueprint.route('/make-call', methods=['POST'])(self.make_call)
        self.blueprint.route('/schedule-appointment', methods=['POST'])(self.schedule_appointment)
        self.blueprint.route('/appointments', methods=['GET'])(self.get_appointments)
    
    def make_call(self):
        try:
            data = request.get_json()
            to_number = data.get('to')
            
            if not to_number:
                return jsonify({'error': 'Phone number is required'}), 400
            
            execution_sid = self.twilio_service.make_call(to_number)
            return jsonify({
                'success': True,
                'execution_sid': execution_sid,
                'message': 'Call initiated successfully'
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    def schedule_appointment(self):
        try:
            data = request.get_json()
            phone_number = data.get('phone_number')
            appointment_datetime = data.get('appointment_datetime')  # Changed from appointment_date
            appointment_type = data.get('appointment_type', 'gynacologist')
            
            if not phone_number or not appointment_datetime:
                return jsonify({'error': 'Phone number and appointment datetime are required'}), 400
            
            result = self.appointment_scheduler.schedule_appointment_reminder(
                phone_number, appointment_datetime, appointment_type
            )
            
            if result['success']:
                return jsonify(result), 200
            else:
                return jsonify(result), 400
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    def get_appointments(self):
        try:
            phone_number = request.args.get('phone_number')
            appointments = self.appointment_scheduler.get_appointments(phone_number)
            return jsonify({'appointments': appointments}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500