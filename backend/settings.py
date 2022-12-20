from dotenv import load_dotenv
import os
load_dotenv()
DB_NAME = os.environ.get('DB_NAME')
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
UPLOAD_FOLDER = '../frontend/assets/photo_gallery'
ALLOWED_EXTENSIONS = {'jpg', 'png', 'jpeg'}