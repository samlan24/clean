from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app, origins=['http://localhost:5173'], supports_credentials=True)

    # Register the blueprint
    from .extension import extension
    app.register_blueprint(extension)
