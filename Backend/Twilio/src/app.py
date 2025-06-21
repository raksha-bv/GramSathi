from flask import Flask, jsonify
from controllers.call_controller import CallController
from config.settings import Config

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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)