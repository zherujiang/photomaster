## About the Stack

### Backend

The backend of this app is written in Python. Developers using this project should already have Python3 and pip installed on their local machines. The specific Python version used in this project is python3.9.15.

- Server: Flask
- Database: PostgreSQL, SQLAlchemy. SQLAlchemy is the Python SQL toolkit and Object Relational Mapper (ORM). The Object Relational Mapper allows classes to be mapped to database models. It provides a generalized interface for creating and executing database-agnostic code without needing to write SQL statements.
- Authentication and Authorization: Auth0, jose-python

### Frontend

- React.js

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

### Running the server

Navigate into the `./backend` directory and run:

```
python app.py
```

## API References
