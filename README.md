# Photomaster

An application that helps customers find photographers based on their desired photography service type and location. It:
1. Allows public users to search and view photographers.
2. Allows public users to sign up and become a registered photographer in the app.
3. Allows photographers to sign in, edit their profile information, and upload photos.
4. Allows public users to send an email to contact the photographer for their desired photography service.

The app requires authentication and uses role-based access management strategy to control different types of user behavior in the app.

## About the Stack

### Backend

The backend of this app is built in Python. Python version: 3.9.15.

- Server: Python 3, Flask
- Database:PostgreSQL, SQLAlchemy.
    SQLAlchemy is the Python SQL toolkit and Object Relational Mapper (ORM). The Object Relational Mapper allows classes to be mapped to database models. It provides a generalized interface for creating and executing database-agnostic code without needing to write SQL statements.
- Authentication and Authorization: Auth0.
    Auth0 provides authentication and authrization services. Our app uses Auth0 as a light-weight third-part solution to avoid the cost, time, and risk in building our own solution to authenticate and authorize users.
- Cloud Storage: AWS S3.
    The app uses Amazon Web Service S3 to handle the upload, upload, and deletion of photos.

### Frontend

- React and Node Package Manager (NPM)

## Getting Started

### Create virtual environment

```bash
conda create --name [project name] python=3.9.15
conda activate [project name]
```

### Install python dependencies

```bash
cd backend
pip install -r requirements.txt
```
This will install all the rquired packages we selected within the `requirements.txt` file

### Install frontend dependencies

This project uses NPM to manage software dependencies. NPM Relies on the package.json file located in the frontend directory. Navigate into the `./frontend` directory and run:

```bash
nmp install
```

### Set up Postgresql database

This app uses Postgresql as database and SQLAlchemy python package to interact with the database. If you use a local database, go to the terminal and create a new database using:

```bash
createdb [database name]
```

Then try the following command to see if the database is successfully created. Enter username and password if required.

```bash
psql [database name]
```

If the database is successfully created, you should be connected to the database and are able to use `psql` commands to directly interact with the local database.

#### Configure environment variables

Go to the `.env` file (should be added in the .gitignore) located in the root directly of `/backend` folder and update the database user credenssials. You may skip this if you are not using a local database.


### Start the backend server

Navigate into the `./backend` directory and run:

```bash
python app.py
```
This will run the backend as well as create tables in the database if those tables did not exist.

### Stand up the app

Navigate into the `./frontend` directory and run:

```bash
npm start
```
This will stand up the app in development mode.

If you need to start the app in the production environment, instead of running `npm start`, use:
```bash
npm run build
```
This will create a production build inside the `./frontend/build` folder.

## Authentication and Authorization

### Set up Auth0

The authentication system used for this app is Auth0. Steps to create and connect the Photomaster app:
1. Register a Auth0 account.
    - Select a unique tenant domain. (This might be assigned by default if using a free account)
2. Create a new single page web application.
3. Go to the application settings, fill out all required information.
    - Callback urls
    - Logout urls that matches the frontend app design.
    - Allowed web origins
4. Create an API for the new application.
    - Enable Role-based Access Control
    - Enable Add Permission in the Access Token
5. In the API settings, create permissions for the backend endpoints where permissions are required.
6. Go to User Management to create roles. Assign permissions to roles.

### Configure environment variables

Configure environment variables in the `./backend/env` file to match the Auth0 domain and API settings.
Open the `./frontend/src/App.js` file and ensure the app urls match the urls in the application settings.

### AWS S3

### Set up AWS S3 service

1. Create an AWS account.
2. Go to S3 service and create a new bucket.
3. In the S3 settings, create a new access key pair and take note of the key pair before closing it.

### Configure environment variables

Configure environment variables in the `./backend/env` file to match the S3 bucket.