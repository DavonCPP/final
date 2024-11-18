import base64
import requests
from flask import Flask, session, send_from_directory, send_file, make_response
from flask_cors import CORS
from functools import wraps
from datetime import timedelta

app = Flask(__name__)
app.static_folder = 'static'
CORS(app)

# Change this to your secret key (can be anything, it's used to secure session data)
app.secret_key = 'Example Secret Key (Change this!)'

from website import mongodb
from website import data_api
from website import user_api
from website import views


'''
@app.after_request
def add_cache_control(response):
    response.headers['Cache-Control'] = 'max-age=3600'
    return response
'''

# Decorator for role-based access control
def role_required(role):
    def wrapper(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'username' not in session:
                return redirect(url_for('login'))
            if role == 'any_role':
                return f(*args, **kwargs)
            if role == 'member_or_admin':
                if session.get('role') == 'member' or session.get('role') == 'admin':
                    return f(*args, **kwargs)
            if session.get('role') != role:
                return "Access Denied", 403
            return f(*args, **kwargs)
        return decorated_function
    return wrapper

'''
@app.before_request
def validate_session():
    session.permanent = True
    app.permanent_session_lifetime = timedelta(minutes=30)  # Set session timeout to 30 minutes
'''

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def catch_all(path):
    return send_from_directory('static', 'index.html')



@app.route('/firestorage_proxy/<path:base64str>')
def firestorage_proxy(base64str):
    firestorage_path = base64.b64decode(base64str)

    response = requests.get(firestorage_path)
    response_headers = {'Content-Type': 'image/jpeg'}  
    return make_response(response.content, 200, response_headers)
