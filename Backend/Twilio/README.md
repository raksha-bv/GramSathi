# Twilio Backend Project

This project is a backend application that utilizes Twilio's API to make phone calls. It is built using Flask and is structured to separate concerns into different modules for better maintainability.

## Project Structure

```
twilio-backend
├── src
│   ├── app.py                # Entry point of the application
│   ├── controllers
│   │   └── call_controller.py # Handles call-related requests
│   ├── services
│   │   └── twilio_service.py  # Interacts with the Twilio API
│   └── config
│       └── settings.py        # Configuration settings
├── requirements.txt           # Project dependencies
├── .env                       # Environment variables
└── README.md                  # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd twilio-backend
   ```

2. **Create a virtual environment:**
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install dependencies:**
   ```
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   Create a `.env` file in the root directory and add your Twilio Account SID and Auth Token:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   ```

## Usage

To run the application, execute the following command:
```
python src/app.py
```

You can then make requests to the endpoints defined in `app.py` to initiate phone calls using the Twilio service.

## License

This project is licensed under the MIT License.