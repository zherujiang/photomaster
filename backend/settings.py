from dotenv import load_dotenv
import os
load_dotenv()
DB_NAME = os.environ.get('DB_NAME')
DB_TEST_NAME = os.environ.get('DB_NAME') + '_test'
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')

UPLOAD_FOLDER = '../frontend/assets/photo_gallery'
UPLOAD_BUCKET_NAME = os.environ.get('UPLOAD_BUCKET_NAME')
ALLOWED_EXTENSIONS = {'jpg', 'png', 'jpeg'}

AUTH0_DOMAIN = os.environ.get('AUTH0_DOMAIN')
ALGORITHMS = os.environ.get('ALGORITHMS')
API_AUDIENCE = os.environ.get('API_AUDIENCE')

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