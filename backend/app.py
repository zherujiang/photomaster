import os
from flask import Flask, request, jsonify, abort, redirect, flash
from models import setup_db, Photographer, Service, Photo, Price
from flask_cors import CORS
from settings import UPLOAD_FOLDER, ALLOWED_EXTENSIONS
from werkzeug.utils import secure_filename

def find_city(zip_code):
    return "A helper function to return a city based on the zip code entered"

def paginate_photographers(selection, page):
    RESULTS_PER_PAGE = 10
    photographers = [photographer.format() for photographer in selection]
    start = RESULTS_PER_PAGE * page + 1
    end = start + RESULTS_PER_PAGE
    current_photographers = photographers[start:end]
    return current_photographers

def allowed_file(filename):
    return '.' in filename and \
        filename.split('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def create_app(test_config=None):

    app = Flask(__name__)
    setup_db(app)
    CORS(app)
    
    @app.route('/services')
    def get_services():
        services_query = Service.query.order_by(Service.id).all()
        services = [service.format() for service in services_query]
        print('service categories: ', services)
        return jsonify({
            'success': True,
            'services': services
        })

    # search photographers
    @app.route('/photographers')
    def get_photographers():
        service_type = request.args.get('service')
        location = request.args.get('location')
        city = find_city(location)
        current_page = request.args.get('page')
        if service_type and city:
            try:
                photographer_query = Photographer.query.\
                    filter(Photographer.services.contains(service_type)).\
                    filter(Photographer.city==city).order_by(Photographer.name).all()
            except:
                abort(422)
                
            photographers = paginate_photographers(photographer_query, current_page)
            return jsonify({
                'success': True,
                'photographer': photographers
            })
            
        elif city == None:
            return jsonify({
                'success': False,
                'message': 'city or zip code not valid',
                'error': 400
            })
        else:
            abort(400)        


    # add a photographer
    @app.route('/photographers', methods=['POST'])
    def create_photographer():
        new_photographer = Photographer(name = 'nametest', email = 'emailtest')
        new_photographer.insert()
        return "This API should create a new photographer via third party quthentication service"
    
    # edit photographer
    # this endpoint requires authentication
    @app.route('/photographers/<int:photographer_id>', methods=['GET', 'PATCH'])
    def update_photographer(photographer_id):
        photographer = Photographer.query.filter(Photographer.id==photographer_id).one_or_none()
        if not photographer:
            abort(404)
            
        if request.method == 'GET':
            # load the photographer information and render the form
            photos_query = Photo.query.filter(Photo.photographer_id==photographer_id).\
                order_by(Photo.service_id).all()
            prices_query = Price.query.filter(Price.photographer_id==photographer_id).\
                order_by(Price.service_id).all()
            photos = [photo.format() for photo in photos_query]
            prices = [price.format() for price in prices_query]
            
            return jsonify({
                'success': True,
                'photographer': photographer.format(),
                'photos': photos,
                'prices': prices
            })
        else:
            try:
                # parse data from the submitted form
                request_body = request.get_json()
                city = request_body.get('city')
                services = request_body.get('services')
                address = request_body.get('address')
                profile_photo = request_body.get('profile_photo')
                portfolio_link = request_body.get('portfolio_link')
                social_media = request_body.get('social_media')
                bio = request_body.get('bio')
                
                photographer.city = city
                photographer.services = services
                photographer.address = address
                photographer.profile_photo = profile_photo
                photographer.portfolio_link = portfolio_link
                photographer.social_media = social_media
                photographer.bio = bio
                
                photographer.update()
                
                return jsonify({
                    'success': True,
                    'photographer updated': photographer.format()
                })
            except:
                abort(422)
        
    # delete the photographer
    # this endpoint requires authentication
    @app.route('/photographers/<int:photographer_id>', methods=['DELETE'])
    def delete_photographer(photographer_id):
        photographer = Photographer.query.filter(Photographer.id==photographer_id).one_or_none()
        if not photographer:
            abort(404)
        else:
            try:
                photographer.delete()
                return jsonify({
                    'success': True,
                    'photograhper deleted': photographer.id
                })
            except:
                abort(422)

    @app.route('/photos/<int:photographer_id>')
    def get_photos(photographer_id):
        photographer = Photographer.query.filter(Photographer.id==photographer_id).one_or_none()
        if not photographer:
            abort(404)
        try:
            photos_query = Photo.query.filter(Photo.photographer_id==photographer_id).\
                order_by(Photo.service_id).all()
            if photos_query:
                photos = [photo.format() for photo in photos_query]
            else:
                photos = []
            return jsonify({
                'success': True,
                'photos': photos
            })
        except:
            abort(500)

    # add photos for a photographer
    # this endpoint requires authentication
    @app.route('/photos/<int:photographer_id>', methods=['POST'])
    def add_photos(photographer_id):
        app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
        photographer = Photographer.query.filter(Photographer.id==photographer_id).one_or_none()
        if not photographer:
            abort(404)
        
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        
        file = request.files['file']
        
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        
        service_tag = request.form.get('service_tag')
        service_id = Service.query.filter(Service.name==service_tag).one_or_none().id
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(image_path)
            
            try:
                new_photo = Photo(
                    photographer_id,
                    service_id,
                    image_path
                    )
                new_photo.insert()
                
                return jsonify({
                    'success': True,
                    'image': new_photo.format()
                })
            except:
                abort(422)
            
        elif not allowed_file(file.filename):
            flash('File name not allowed')
            return redirect(request.url)
 
    # delete a photo from a photographers' gallery
    # this endpoint requires authentication
    @app.route('/photos/<int:photographer_id>', methods=['DELETE'])
    def delete_photos(photographer_id):
        photographer = Photographer.query.filter(Photographer.id==photographer_id).one_or_none()
        if not photographer:
            abort(404)
        image_path = request.args('image_path')
        photo_query = Photo.query.filter(Photo.image_path==image_path).one_or_none()
        
        try:
            photo_query.delete()
            return jsonify({
                'success': True,
                'photo_deleted': photo_query.format()
            })
        except:
            abort(422)
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
