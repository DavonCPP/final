
from pymongo import MongoClient
import os


mongodb_host = os.getenv("MONGO_URI", "mongodb://root:root@localhost:27017/")





database_name = 'ecom'
ecom_collection = 'ecom_collection'
users_collection = 'users_collection'
login_attempts_collection = 'login_attempts_collection'


client = MongoClient(mongodb_host)
ecom_db = client[database_name]
ecom_collection = ecom_db[ecom_collection]
users_collection = ecom_db[users_collection]
login_attempts_collection = ecom_db[login_attempts_collection]
