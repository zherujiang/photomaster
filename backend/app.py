import os
from flask import Flask, request
from models import setup_db
from flask_cors import CORS


def create_app(test_config=None):

    app = Flask(__name__)
    setup_db(app)
    CORS(app)

    @app.route('/services')
    def get_services():
        return "This API should return a list of all the photography categories"

    def find_city(zip_code):
        return "A helper function to return a city based on the zip code entered"

    # search photographers
    @app.route('/photographers')
    def get_photographers():
        return "This API should return photographers that match the search conditions"

    # add photographer
    @app.route('/photographers', methods=['POST'])
    def create_photographer():
        return "This API should create a new photographer"
    
    # edit photographer
    @app.route('/photographers/<int:photographer_id>', methods=['PATCH'])
    def update_photographer(photographer_id):
        return f"This API should update the photographer {photographer_id}"
    
    @app.route('/photographers/<int:photographer_id>', methods=['DELETE'])
    def delete_photographer(photographer_id):
        return f"The photographer {photographer_id} has been deleted"

    @app.route('/photos/<int:photographer_id>')
    def get_photos(photographer_id):
        return f"This API should return photos by the photographer {photographer_id}"

    @app.route('/photos/<int:photographer_id>', methods=['POST'])
    def add_photos(photographer_id):
        return f"This API should add new photos to the gallery of photographer {photographer_id}"

    @app.route('/photos/<int:photographer_id>/<int:photo_id>', methods=['DELETE'])
    def delete_photos(photographer_id, photo_id):
        return f"This API should delete the photo {photo_id} for the selected photographer {photographer_id}"
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
