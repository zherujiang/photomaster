from dotenv import load_dotenv
import os
load_dotenv()
DB_NAME = os.environ.get('DB_NAME')
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
UPLOAD_FOLDER = '../frontend/assets/photo_gallery'
ALLOWED_EXTENSIONS = {'jpg', 'png', 'jpeg'}

AUTH0_DOMAIN = os.environ.get('AUTH0_DOMAIN')
ALGORITHMS = os.environ.get('ALGORITHMS')
API_AUDIENCE = os.environ.get('API_AUDIENCE')