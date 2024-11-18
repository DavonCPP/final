# Healthcare Service Website User Guide

  This health service website presents a basic platform for interaction and service, allowing users to register, log in, and carry out various operations.
  - There are three user roles in the system:
    - **member**
    - **doctor**
    - **admin**
  - Any new user is automatically assigned the role of member upon registration.

## Detailed Website Functions

On this healthcare service website, users can perform the following operations:

- **member**£º
    - Can evaluate the doctor's rating.
    - Can change the doctor's rating.
- **doctor**£º
    - None
- **admin**£º
    - Has all the functions of a doctor.
    - Can manage user accounts, including deleting users, changing user roles and statuses.
    - Can perform more comprehensive management and supervision of the entire website.

## Environment Setup and Configuration
  - Install Python environment or a Python virtual environment.
  - Install all packages listed in requirements.txt.
  - Install MySQL environment.
  - Create your own database copy using the database script 'Database.sql'.
  - Modify connect.py to configure the connection details for your local database server.

## Running and Starting the Server:
   - Start the server with the following command: python run.py.
   - Access the website by opening your local browser and entering http://localhost:5000/.

## Deployed Demo Website for Testing

  - Test accounts and passwords for the demo website:
    - User         Password
    ----------------------------
    - admin        123456
    - doctor1      123456
    - doctor2      123456
    - doctor3      123456
    - doctor4      123456
    - doctor5      123456
    - doctor6      123456
    - doctor7      123456
    - doctor8      123456
    - doctor9      123456
    - doctor10     123456
    - doctor11     123456
    - doctor12     123456
    - doctor13     123456
    - doctor14     123456
    - user1        123456
