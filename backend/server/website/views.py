from flask import render_template, request, redirect, url_for, session, jsonify
from website import app

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')
