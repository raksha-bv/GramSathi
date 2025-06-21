from flask import Flask, jsonify
from controllers.call_controller import CallController
from config.settings import Config
import os
from datetime import datetime, timedelta

app = Flask(__name__)
app.config.from_object(Config)

# Initialize controllers
call_controller = CallController()

# Initialize scheduler on app startup (important for Render)
scheduler = None

def initialize_scheduler():
    global scheduler
    try:
        from services.appointment_scheduler import AppointmentScheduler
        scheduler = AppointmentScheduler()
        print("✅ Scheduler initialized on app startup")
    except Exception as e:
        print(f"❌ Failed to initialize scheduler: {e}")

# Initialize scheduler when app starts
initialize_scheduler()

# Register blueprints
app.register_blueprint(call_controller.blueprint, url_prefix='/api')

# Add a home route
@app.route('/')
def home():
    return jsonify({
        'message': 'Twilio Backend API is running!',
        'endpoints': {
            'make_call': '/api/make-call (POST)',
            'health': '/health (GET)'
        }
    })

# Add a health check that also ensures scheduler is running
@app.route('/health')
def health():
    global scheduler
    scheduler_status = "running" if scheduler and scheduler.running else "stopped"
    
    # Restart scheduler if it's not running
    if not scheduler or not scheduler.running:
        try:
            initialize_scheduler()
            scheduler_status = "restarted"
        except Exception as e:
            scheduler_status = f"failed: {e}"
    
    return jsonify({
        'status': 'healthy',
        'scheduler': scheduler_status,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/debug/config')
def debug_config():
    return jsonify({
        'TWILIO_ACCOUNT_SID': Config.TWILIO_ACCOUNT_SID[:10] + "..." if Config.TWILIO_ACCOUNT_SID else "Not set",
        'TWILIO_AUTH_TOKEN': "Set" if Config.TWILIO_AUTH_TOKEN else "Not set",
        'TWILIO_FLOW_SID': Config.TWILIO_FLOW_SID[:10] + "..." if Config.TWILIO_FLOW_SID else "Not set",
        'TWILIO_FROM_NUMBER': Config.TWILIO_FROM_NUMBER if Config.TWILIO_FROM_NUMBER else "Not set",
        'SECRET_KEY': "Set" if Config.SECRET_KEY else "Not set",
        'BASE_URL': Config.BASE_URL if Config.BASE_URL else "Not set",
        'env_vars_from_os': {
            'TWILIO_ACCOUNT_SID': os.getenv('TWILIO_ACCOUNT_SID')[:10] + "..." if os.getenv('TWILIO_ACCOUNT_SID') else "Not set",
            'TWILIO_AUTH_TOKEN': "Set" if os.getenv('TWILIO_AUTH_TOKEN') else "Not set",
            'TWILIO_FLOW_SID': os.getenv('TWILIO_FLOW_SID')[:10] + "..." if os.getenv('TWILIO_FLOW_SID') else "Not set",
            'TWILIO_FROM_NUMBER': os.getenv('TWILIO_FROM_NUMBER') if os.getenv('TWILIO_FROM_NUMBER') else "Not set"
        }
    })

@app.route('/debug/trigger-reminders')
def trigger_reminders():
    """Manually trigger reminder processing for testing"""
    try:
        from services.appointment_scheduler import AppointmentScheduler
        
        # Create a new scheduler instance
        scheduler = AppointmentScheduler()
        
        # Get all scheduled appointments
        all_appointments = scheduler.mongodb_service.get_appointments()
        scheduled_appointments = [apt for apt in all_appointments if apt['status'] == 'scheduled']
        
        if not scheduled_appointments:
            return jsonify({
                'success': False,
                'message': 'No scheduled appointments found',
                'total_appointments': len(all_appointments)
            })
        
        results = []
        for appointment in scheduled_appointments:
            try:
                print(f"Manually triggering call for: {appointment['phone_number']}")
                
                # Make the call regardless of time for testing
                call_sid = scheduler.twilio_service.make_appointment_reminder_call(
                    appointment["phone_number"],
                    appointment["appointment_type"]
                )
                
                if call_sid:
                    scheduler.mongodb_service.update_appointment_status(
                        appointment["_id"], 
                        "reminder_sent"
                    )
                    results.append({
                        'appointment_id': appointment['_id'],
                        'phone_number': appointment['phone_number'],
                        'call_sid': call_sid,
                        'status': 'success'
                    })
                else:
                    results.append({
                        'appointment_id': appointment['_id'],
                        'phone_number': appointment['phone_number'],
                        'status': 'failed',
                        'error': 'No call SID returned'
                    })
                    
            except Exception as e:
                results.append({
                    'appointment_id': appointment['_id'],
                    'phone_number': appointment['phone_number'],
                    'status': 'error',
                    'error': str(e)
                })
        
        return jsonify({
            'success': True,
            'message': f'Processed {len(results)} appointments',
            'results': results
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/debug/schedule-immediate', methods=['POST'])
def schedule_immediate_test():
    """Schedule an appointment with reminder in 1 minute for testing"""
    try:
        from services.appointment_scheduler import AppointmentScheduler
        scheduler = AppointmentScheduler()
        
        # Schedule for 2 minutes from now, reminder in 1 minute
        now = datetime.now()
        appointment_time = now + timedelta(minutes=2)
        
        result = scheduler.schedule_appointment_reminder(
            phone_number="+917204663202",
            appointment_datetime=appointment_time.strftime("%Y-%m-%d %H:%M"),
            appointment_type="test appointment"
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/debug/scheduler-status')
def scheduler_status():
    """Check scheduler status"""
    global scheduler
    return jsonify({
        'scheduler_exists': scheduler is not None,
        'scheduler_running': scheduler.running if scheduler else False,
        'thread_alive': scheduler.scheduler_thread.is_alive() if scheduler and scheduler.scheduler_thread else False
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)