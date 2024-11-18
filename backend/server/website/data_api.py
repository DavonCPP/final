import os
import math
import random
import requests
from datetime import datetime
from flask import render_template, request, redirect, url_for, session, jsonify
from website import app
from website import mongodb


@app.route('/api/get_data_key', methods=['GET', 'POST'])
def get_data_key():
    try:
        doc = mongodb.ecom_collection.find_one()
        field_names = doc.keys()
        return jsonify(list(field_names))
    except Exception as e:
        return jsonify({'result_code': 401, 'message': f'An error occurred: {str(e)}'})


@app.route('/api/query_data', methods=['GET', 'POST'])
def query_data():
    if request.method == 'GET':
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)

        
        other_params = {k: v for k, v in request.args.items() if k not in ['page', 'limit', 'field_name', 'query_str']}

    elif request.method == 'POST':
        page = request.form.get('page', 1, type=int)
        limit = request.form.get('limit', 10, type=int)

        # 获取其他任意参数
        other_params = {k: v for k, v in request.form.items() if k not in ['page', 'limit', 'field_name', 'query_str']}

    try:
        # 先获取一条数据来判断字段类型
        sample_data = mongodb.ecom_collection.find_one()
        if not sample_data:
            raise Exception("No data available for type detection")

        query = {}
        for param_key, param_value in other_params.items():
            if param_key in sample_data and isinstance(sample_data[param_key], int):
                if ',' in param_value:
                    values = param_value.split(',')
                    query[param_key] = {'$gt': int(values[0]), '$lt': int(values[1])}
                else:
                    query[param_key] = int(param_value)
            elif param_key in sample_data and isinstance(sample_data[param_key], float):
                if ',' in param_value:
                    values = param_value.split(',')
                    query[param_key] = {'$gt': float(values[0]), '$lt': float(values[1])}
                else:
                    query[param_key] = float(param_value)
            elif param_key in sample_data and isinstance(sample_data[param_key], datetime):
                if ',' in param_value:
                    start_date_str, end_date_str = param_value.split(',')
                    start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
                    end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
                    query[param_key] = {'$gt': start_date, '$lt': end_date}
                else:
                    date = datetime.strptime(param_value, '%Y-%m-%d')
                    query[param_key] = date
            else:
                if '.*' in param_value:
                    query[param_key] = {'$regex': param_value}
                else:
                    query[param_key] = param_value

        
        total_items = mongodb.ecom_collection.count_documents(query)

       
        total_pages = math.ceil(total_items / limit)

       
        skip = (page - 1) * limit
        data = list(mongodb.ecom_collection.find(query).skip(skip).limit(limit))

        for item in data:
            item['_id'] = str(item['_id'])

        pagination = {
            "current_page": page,
            "total_pages": total_pages,
            "total_items": total_items,
        }
        return jsonify({'data': data, 'pagination': pagination}) #, 'query': query, 'other_params': other_params})

    except Exception as e:
        return jsonify({'result_code': 401, 'message': f'An error occurred: {str(e)}'})


@app.route('/api/query_data_2', methods=['GET', 'POST'])
def query_data_2():
    if request.method == 'GET':
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)

        
        other_params = {k: v for k, v in request.args.items() if k not in ['page', 'limit', 'field_name', 'query_str']}

    elif request.method == 'POST':
        page = request.form.get('page', 1, type=int)
        limit = request.form.get('limit', 10, type=int)

       
        other_params = {k: v for k, v in request.form.items() if k not in ['page', 'limit', 'field_name', 'query_str']}

    try:
       
        sample_data = mongodb.ecom_collection.find_one()
        if not sample_data:
            raise Exception("No data available for type detection")

        query = {}
        for param_key, param_value in other_params.items():
            if param_key in sample_data and isinstance(sample_data[param_key], int):
                if ',' in param_value:
                    values = param_value.split(',')
                    query[param_key] = {'$gt': int(values[0]), '$lt': int(values[1])}
                else:
                    query[param_key] = int(param_value)
            elif param_key in sample_data and isinstance(sample_data[param_key], float):
                if ',' in param_value:
                    values = param_value.split(',')
                    query[param_key] = {'$gt': float(values[0]), '$lt': float(values[1])}
                else:
                    query[param_key] = float(param_value)
            elif param_key in sample_data and isinstance(sample_data[param_key], datetime):
                if ',' in param_value:
                    start_date_str, end_date_str = param_value.split(',')
                    start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
                    end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
                    query[param_key] = {'$gt': start_date, '$lt': end_date}
                else:
                    date = datetime.strptime(param_value, '%Y-%m-%d')
                    query[param_key] = date
            else:
                if '.*' in param_value:
                    query[param_key] = {'$regex': param_value}
                else:
                    query[param_key] = param_value

      
        pipeline = [{"$match": query}, {"$group": {"_id": "$perm_id", "data": {"$first": "$$ROOT"}}}]
        distinct_data = list(mongodb.ecom_collection.aggregate(pipeline))

        total_items = len(distinct_data)

        
        total_pages = math.ceil(total_items / limit)

        
        skip = (page - 1) * limit
        data = distinct_data[skip:skip + limit]

        for item in data:
            item['data']['_id'] = str(item['data']['_id'])

        pagination = {
            "current_page": page,
            "total_pages": total_pages,
            "total_items": total_items,
        }
        return jsonify({'data': [item['data'] for item in data], 'pagination': pagination})  #, 'query': query, 'other_params': other_params})

    except Exception as e:
        return jsonify({'result_code': 401, 'message': f'An error occurred: {str(e)}'})
