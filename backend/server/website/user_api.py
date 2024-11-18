import re
from datetime import datetime
from flask import render_template, request, redirect, url_for, session, jsonify
from flask_hashing import Hashing
from website import app
from website import mongodb

hashing = Hashing(app)  #create an instance of hashing

# IMPORTANT: Change 'ExampleSaltValue' to whatever salt value you'll use in
# your application. If you don't do this, your password hashes won't work!
PASSWORD_SALT = 'ExampleSaltValue'

# Default role assigned to new users upon registration.
DEFAULT_USER_ROLE = 'member'
DEFAULT_STATUS = 'active'

def save_login_attempts(email, success, reason):
    forwarded_for = request.headers.get('X-Forwarded-For')
    if forwarded_for:
        client_ip = forwarded_for.split(',')[0]
    else:
        client_ip = request.remote_addr

    item = {
        "email": email,
        "ip_address": client_ip,
        "success": success,
        "reason": reason,
        "attempted_at": datetime.now()
    }
    mongodb.login_attempts_collection.insert_one(item)

@app.route('/api/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        email = request.args.get('email', '', type=str)
        password = request.args.get('password', '', type=str)
    elif request.method == 'POST':
        email = request.form.get('email', '', type=str)
        password = request.form.get('password', '', type=str)
        # data = request.get_json()  # 从前端的 JSON 获取数据
        # email = data.get('email')
        # password = data.get('password')
    print("hahhaha",email)
    print("hahahha",password)
    if not email or not password:
        msg = 'No need to enter email or password!'
        return jsonify({'result_code': 401, 'message': msg})
    
    user = mongodb.users_collection.find_one({'email': email})
    print(user);
    if user is not None:
        password_hash = user['password_hash']
        if hashing.check_value(password_hash, password, PASSWORD_SALT):
            if user['status'] == 'active':
                session['loggedin'] = True
                session['id'] = str(user['_id'])
                session['name'] = user['name']
                session['role'] = user['role']
                msg = 'success'
                save_login_attempts(email, True, msg)
                return jsonify({'result_code': 200, 'message': msg})
            else:
                msg = 'Status is inactive!'
                save_login_attempts(email, False, msg)
                return jsonify({'result_code': 401, 'message': msg})
        else:
            msg = 'Incorrect password!'
            save_login_attempts(email, False, msg)
            return jsonify({'result_code': 401, 'message': msg})

    msg = 'Incorrect email or password!'
    save_login_attempts(email, False, msg)
    return jsonify({'result_code': 401, 'message': msg})


@app.route('/api/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        email = request.args.get('email', '', type=str)
        password = request.args.get('password', '', type=str)
        name = request.args.get('name', '', type=str)
    elif request.method == 'POST':
        email = request.form.get('email', '', type=str)
        password = request.form.get('password', '', type=str)
        name = request.form.get('name', '', type=str)
        print(email, password, name);
    if not email or not password or not name:
        msg = 'Please fill out the form!'
        return jsonify({'result_code': 401, 'message': msg})

    user_exists = mongodb.users_collection.count_documents({'email': email})
    if user_exists:
        msg = 'Account already exists!'
        return jsonify({'result_code': 401, 'message': msg})
    if len(password) < 8:
        msg = 'Password must be at least 8 characters long!'
        return jsonify({'result_code': 401, 'message': msg})
    '''
    if not any(c.isalpha() for c in password):
        msg = 'Password must contain at least one letter!'
        return jsonify({'result_code': 401, 'message': msg})
    if not any(c in'special_characters' for c in password):
        msg = 'Password must contain at least one special character!'
        return jsonify({'result_code': 401, 'message': msg})
    '''
    if not re.match(r'[^@]+@[^@]+\.[^@]+', email):
        msg = 'Invalid email address!'
        return jsonify({'result_code': 401, 'message': msg})
    if not re.match(r'[A-Za-z0-9]+', name):
        msg = 'Name must contain only characters and numbers!'
        return jsonify({'result_code': 401, 'message': msg})

    password_hash = hashing.hash_value(password, PASSWORD_SALT)

    user = {
        "email": email,
        "name": name,
        "password_hash": password_hash,
        "role": DEFAULT_USER_ROLE,
        "status": DEFAULT_STATUS,
        "created_at": datetime.now()
    }
    result = mongodb.users_collection.insert_one(user)
    if result.acknowledged:
        msg = 'You have successfully registered!'
        return jsonify({'result_code': 200, 'message': msg})

    msg = 'You have successfully registered!'
    return jsonify({'result_code': 401, 'message': msg})


@app.route('/api/logout')
def logout():
    # Remove session data, this will log the user out
    session.pop('loggedin', None)
    session.pop('id', None)
    session.pop('email', None)

    # Redirect to login page
    return jsonify({'result_code': 200, 'message': 'success'})
