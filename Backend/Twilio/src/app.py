from flask import Flask, jsonify
from controllers.call_controller import CallController
from config.settings import Config
import os

app = Flask(__name__)
app.config.from_object(Config)

# Initialize controllers
call_controller = CallController()

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

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})

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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)