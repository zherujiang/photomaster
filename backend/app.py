import os
from flask import Flask, request, jsonify, abort, redirect, flash
from models import setup_db, Photographer, Service, Photo, Price
from flask_cors import CORS
from settings import UPLOAD_FOLDER, ALLOWED_EXTENSIONS, DB_PATH
from werkzeug.utils import secure_filename
from auth import requires_auth, AuthError


def find_city(location):
    # A helper function to return a city based on the zip code entered
    if isinstance(location, str):
        return location
    else:
        return 'placeholder_City'


def paginate_search_results(selection, results_per_page, current_page):
    start = int(results_per_page) * (int(current_page) - 1)
    end = start + int(results_per_page)
    current_photographers = selection[start:end]
    return current_photographers

def get_service_price(photographer):
    return photographer['price']['price_value']


def create_app(database_path):

    app = Flask(__name__)
    setup_db(app, database_path)
    CORS(app)

    @app.route('/services')
    def get_services():
        services_query = Service.query.order_by(Service.id).all()
        services = [service.format() for service in services_query]
        return jsonify({
            'success': True,
            'services': services
        })

    '''
    add service categories, administrator only
    requires administrator permission
    '''
    @app.route('/services', methods=['POST'])
    @requires_auth(permission='post:services')
    def add_services():
        request_data = request.get_json()
        if not request_data:
            abort(400)
        service_name = request_data.get('name')
        service_image = request_data.get('image_link')

        try:
            new_service = Service(name=service_name)
            new_service.insert()
            if service_image:
                new_service.image_link = service_image
                new_service.update()

            return jsonify({
                'success': True,
                'service': new_service.format()
            })
        except Exception as e:
            print(e)
            abort(422)

    '''
    edit service categories, administrator only
    requires administrator permission
    '''
    @app.route('/services/<int:service_id>', methods=['PATCH'])
    @requires_auth(permission='patch:services')
    def edit_service(service_id):
        service_query = Service.query.filter(
            Service.id == service_id).one_or_none()
        if not service_query:
            abort(404)

        request_data = request.get_json()
        if not request_data:
            abort(400)

        try:
            service_query.name = request_data.get('name')
            service_query.image_link = request_data.get('image_link')
            service_query.update()

            return jsonify({
                'success': True,
                'service': service_query.format()
            })
        except:
            abort(422)

    '''
    delete service category (by name), administrator only
    requires administrator permission
    '''
    @app.route('/services/<int:service_id>', methods=['DELETE'])
    @requires_auth(permission='delete:services')
    def delete_service(service_id):
        service_query = Service.query.filter(
            Service.id == service_id).one_or_none()
        if not service_query:
            abort(404)

        deleted_service = service_query.format()
        affected_photographers = Photographer.query.\
            filter(Photographer.services.any(service_id)).all()

        try:
            # delete the service from photographers that provide this service
            for photographer in affected_photographers:
                photographer.services.remove(service_id)

            # delete the service category, related photos and prices will be auto-deleted
            service_query.delete()

            return jsonify({
                'success': True,
                'service': deleted_service,
                'affected_photographers':
                    [photographer.id for photographer in affected_photographers]
            })
        except Exception as e:
            abort(422)

    '''
    search photographers
    '''
    @app.route('/photographers')
    def search_photographers():
        service_id = request.args.get('service')
        location = request.args.get('location')
        city = find_city(location)
        can_travel = request.args.get('can_travel')
        sort_by = request.args.get('sort_by')
        results_per_page = request.args.get('results_per_page')
        current_page = request.args.get('current_page')
        
        if service_id and city:
            try:
                photographer_w_service = Photographer.query.filter(Photographer.services.any(service_id))
                if can_travel:
                    photographer_query = photographer_w_service.filter((Photographer.city == city) | (Photographer.can_travel ==True))\
                        .order_by(Photographer.name).all()
                else:
                    photographer_query = photographer_w_service.filter(Photographer.city == city).order_by(Photographer.name).all()
            except Exception as e:
                print(e)
                abort(422)

            search_results = []
            
            for photographer in photographer_query:
                photo_query = photographer.photos[:8]
                price_query = photographer.prices[0]
                
                # format photographer search results to include overview info, photos, and price of selected service
                photographer_info = photographer.overview()
                photographer_info['photos'] = [photo.format() for photo in photo_query]
                photographer_info['price'] = price_query.format_by_service(service_id)
                search_results.append(photographer_info)
            
            if sort_by == 'price_up':    
                # sort search_results based on the service price low to high
                search_results.sort(key=get_service_price)
            elif sort_by == 'price_down':
                # sort search_results based on the service price high to low
                search_results.sort(key=get_service_price, reverse=True)
                
            # paginate search results and return
            photographers = paginate_search_results(search_results, results_per_page, current_page)
            
            return jsonify({
                'success': True,
                'total_photographers': len(search_results),
                'photographers': photographers
            })

        elif city == None:
            return jsonify({
                'success': False,
                'message': 'invalid city or zip code',
                'error': 400
            })
        else:
            abort(400)

    '''
    get details of a photographer
    '''
    @app.route('/photographers/<int:photographer_id>')
    def view_photographer_details(photographer_id):
        photographer_query = Photographer.query.\
            filter(Photographer.id == photographer_id).one_or_none()

        if not photographer_query:
            abort(404)
        else:
            price_query = photographer_query.prices[0]
            prices = price_query.format()
            
            if photographer_query.photos:
                photos = [photo.format() for photo in photographer_query.photos]
            else:
                photos = []
            
            return jsonify({
                'success': True,
                'photographer_details': photographer_query.details(),
                'prices': prices,
                'photos': photos
            })
            
    '''
    add a photographer
    '''
    @app.route('/photographers', methods=['POST'])
    def create_photographer():
        request_body = request.get_json()
        name = request_body.get('name')
        email = request_body.get('email')
        
        existing_photographer = Photographer.query.filter(Photographer.email == email).one_or_none()
        
        if not existing_photographer:
            # initialize photographer and insert
            try:
                new_photographer = Photographer(name, email)
                print(new_photographer.overview())
                new_photographer.insert()
                print('inserted')
            except Exception as e:
                print(e)
                abort(400)
        else:
            return jsonify({
                'success': False,
                'message': 'Email already registered under an account'
            })
            
        try:
            photographer_query = Photographer.query.filter(Photographer.email == email).one_or_none()
            photographer_id = photographer_query.id
            
            # initialize price table for the new photographer
            services_query = Service.query.order_by(Service.id).all()
            num_services = len(services_query)
            new_prices = Price(photographer_id, [0]*num_services, [0]*num_services)
            new_prices.insert()
            
            return jsonify({
                'success': True,
                'photographer_id': photographer_id,
            })
        except Exception as e:
            print(e)
            print('fail to insert prices')
            abort(422)


    '''
    delete the photographer
    this endpoint requires authentication
    '''
    @app.route('/photographers/<int:photographer_id>', methods=['DELETE'])
    # @requires_auth(permission='delete:photographers')
    def delete_photographer(photographer_id):
        photographer = Photographer.query.filter(
            Photographer.id == photographer_id).one_or_none()
        if not photographer:
            abort(404)

        # check if the user making the request is the registered photographer
        # if payload.get('user_id') != photographer_id:
        #     abort(401)

        deleted_photographer = photographer.overview()

        try:
            photographer.delete()
            return jsonify({
                'success': True,
                'photographer': deleted_photographer
            })
        except:
            abort(422)


    '''
    helper function to check if an email has been registered as a photographer acount
    '''
    @app.route('/photographer-accounts', methods=['POST'])
    def find_photographer_account():
        request_body = request.get_json()
        email = request_body.get('email')
        photographer_query = Photographer.query.filter(Photographer.email == email).one_or_none()
        
        if not photographer_query:
            return jsonify({
                'success': True,
                'account_registered': False,
                'message': 'can not find matching account'
            })
        else:
            photographer_id = photographer_query.id
            photographer_name = photographer_query.name
            
            return jsonify({
                'success': True,
                'account_registered': True,
                'photographer_id': photographer_id,
                'photographer_name': photographer_name
            })

    '''
    edit photographer
    this endpoint requires authentication
    '''
    @app.route('/photographer-edits/<int:photographer_id>', methods=['GET', 'PATCH'])
    # @requires_auth()
    def update_photographer(photographer_id):
        photographer = Photographer.query.filter(
            Photographer.id == photographer_id).one_or_none()
        if not photographer:
            abort(404)

        # check if the user making the request is the registered photographer
        # if payload.get('user_id') != photographer_id:
        #     abort(401)

        if request.method == 'GET':
            # get the price information for the current photographer, use query instead of relationship for prices to avoid instrumented list
            print(request.headers)
            price_query = Price.query.filter(Price.photographer_id == photographer_id).one_or_none()
            prices= price_query.format()

            return jsonify({
                'success': True,
                'photographer_details': photographer.details(),
                'prices': prices
            })
        elif request.method == 'PATCH':
            try:
                # parse data from the request
                request_body = request.get_json()
                name = request_body.get('name')
                city = request_body.get('city')
                can_travel = request_body.get('can_travel')
                address = request_body.get('address')
                services = request_body.get('services')
                profile_photo = request_body.get('profile_photo')
                portfolio_link = request_body.get('portfolio_link')
                bio = request_body.get('bio')
                price_values = request_body.get('price_values')
                price_types = request_body.get('price_types')
                           
                # update price for the current photographer
                price_query = Price.query.filter(Price.photographer_id == photographer_id).one_or_none()
                price_query.price_values = price_values
                price_query.price_types = price_types
                price_query.update()
                prices = price_query.format()

                # update photographer information
                photographer.name = name
                photographer.city = city
                photographer.can_travel = can_travel
                photographer.address = address
                photographer.services = services
                photographer.profile_photo = profile_photo
                photographer.portfolio_link = portfolio_link
                photographer.bio = bio
                photographer.update()

                return jsonify({
                    'success': True,
                    'photographer_details': photographer.details(),
                    'prices': prices
                })
            except:
                abort(422)

    '''
    get photos of a photographer
    this endpoint requires authentication
    '''
    @app.route('/photos/<int:photographer_id>', methods=['GET'])
    def get_photos(photographer_id):
        photographer = Photographer.query.filter(
            Photographer.id == photographer_id).one_or_none()
        if not photographer:
            abort(404)

        # check if the user making the request is the registered photographer
        # if payload.get('user_id') != photographer_id:
        #     abort(401)

        # return existing photos for the requested photographer
        if request.method == 'GET':
            photo_query = Photo.query.filter(Photo.photographer_id == photographer.id).order_by(Photo.id).all()
            photo_urls = [photo.urls() for photo in photo_query]
            
            return jsonify({
                    'success': True,
                    'photo_urls': photo_urls
                })
            
    '''
    upload photo
    this endpoint requires authentication
    '''
    @app.route('/photos/<int:photographer_id>', methods=['POST'])
    def upload_photos(photographer_id):
        photographer = Photographer.query.filter(
            Photographer.id == photographer_id).one_or_none()
        if not photographer:
            abort(404)

        # check if the user making the request is the registered photographer
        # if payload.get('user_id') != photographer_id:
        #     abort(401)
        
        data = request.get_json()
        new_photos_list = data.get('new_photos_list')
        
        for file_location in new_photos_list:
            try:
                new_photo = Photo(
                    photographer_id,
                    file_location
                )
                new_photo.insert()
            except Exception as e:
                print(e)
                abort(400)
                
        photo_query = Photo.query.filter(Photo.photographer_id == photographer.id).order_by(Photo.id).all()
        updated_photo_urls = [photo.urls() for photo in photo_query]
        
        return jsonify({
            'success': True,
            'photo_urls': updated_photo_urls
        })
        

    '''
    delete a photo from a photographers' gallery
    this endpoint requires authentication
    '''
    @app.route('/photos/<int:photographer_id>', methods=['DELETE'])
    # @requires_auth()
    def delete_photos(photographer_id):
        photographer = Photographer.query.filter(
            Photographer.id == photographer_id).one_or_none()

        if not photographer:
            abort(404)

        # check if the user making the request is the registered photographer
        # if payload.get('user_id') != photographer_id:
        #     abort(401)
        
        data = request.get_json()
        selected_photos_list = data.get('selected_photos_list')
        
        for photo_url in selected_photos_list:
            try:
                photo_to_delete = Photo.query.filter(Photo.file_location == photo_url).one_or_none()
                photo_to_delete.delete()
            except Exception as e:
                print(e)
                abort(400)
        
        photo_query = Photo.query.filter(Photo.photographer_id == photographer.id).order_by(Photo.id).all()
        updated_photo_urls = [photo.urls() for photo in photo_query]
        
        return jsonify({
            'success': True,
            'photo_urls': updated_photo_urls
        })
        

    '''
    error handling
    '''
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'success': False,
            'error': 400,
            'message': 'bad request'
        }), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            'success': False,
            'error': 401,
            'message': 'unauthorized user'
        }), 401

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'error': 404,
            'message': 'resource not found'
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            'success': False,
            'message': 'method not allowed',
            'error': 405
        }), 405

    @app.errorhandler(422)
    def unprocessable(error):
        return jsonify({
            'success': False,
            'error': 422,
            'message': 'unprocessable'
        }), 422

    @app.errorhandler(500)
    def server_error(error):
        return jsonify({
            'success': False,
            'error': 500,
            'message': 'internal server error'
        }), 500

    @app.errorhandler(AuthError)
    def authentication_error(error):
        return jsonify({
            'success': False,
            'error': error.status_code,
            'message': error.error
        }), error.status_code

    return app


if __name__ == '__main__':
    app = create_app(database_path=DB_PATH)
    app.run(debug=True)
