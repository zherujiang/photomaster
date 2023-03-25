from dotenv import load_dotenv
import os
load_dotenv()
DB_NAME = os.environ.get('DB_NAME')
DB_TEST_NAME = os.environ.get('DB_NAME') + '_test'
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')

S3_BUCKET_BASE_URL = os.environ.get('S3_BUCKET_BASE_URL')
UPLOAD_BUCKET_NAME = os.environ.get('UPLOAD_BUCKET_NAME')
S3_REGION = os.environ.get('S3_REGION')
S3_ACCESSKEYID = os.environ.get('S3_ACCESSKEYID')
S3_SECRETACCESSKEY = os.environ.get('S3_SECRETACCESSKEY')
S3_SIGNATUREVERSION = os.environ.get('S3_SIGNATUREVERSION')
# ALLOWED_EXTENSIONS = {'jpg', 'png', 'jpeg'}

AUTH0_DOMAIN = os.environ.get('AUTH0_DOMAIN')
ALGORITHMS = os.environ.get('ALGORITHMS')
API_AUDIENCE = os.environ.get('API_AUDIENCE')

MAILTRAP_USERNAME = os.environ.get('MAILTRAP_USERNAME')
MAILTRAP_PASSWORD = os.environ.get('MAILTRAP_PASSWORD')

# compose database_path
db_user_credentials = DB_USER + ":" + DB_PASSWORD
if DB_USER or DB_PASSWORD:
    DB_PATH = 'postgresql://{}@{}/{}'.format(
        db_user_credentials, 'localhost:5432', DB_NAME)
    DB_TEST_PATH = 'postgresql://{}@{}/{}'.format(
        db_user_credentials, 'localhost:5432', DB_TEST_NAME)
else:
    DB_PATH = 'postgresql://{}/{}'.format('localhost:5432', DB_NAME)
    DB_TEST_PATH = 'postgresql://{}/{}'.format('localhost:5432', DB_TEST_NAME)

ENV_DB_PATH = os.environ.get('DATABASE_URL', None)
if ENV_DB_PATH is not None:
    DB_PATH = ENV_DB_PATH.replace('postgres', 'postgresql', 1)