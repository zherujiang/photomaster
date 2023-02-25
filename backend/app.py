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


def allowed_file(filename):
    return '.' in filename and \
        filename.split('.', 1)[1].lower() in ALLOWED_EXTENSIONS


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

    # add service categories, administrator only
    # requires administrator permission
    @app.route('/services', methods=['POST'])
    # @requires_auth(permission='post:services')
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

    # edit service categories, administrator only
    # requires administrator permission
    @app.route('/services/<int:service_id>', methods=['PATCH'])
    # @requires_auth(permission='patch:services')
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

    # delete service category (by name), administrator only
    # requires administrator permission
    @app.route('/services/<int:service_id>', methods=['DELETE'])
    # @requires_auth(permission='delete:services')
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

    # search photographers
    @app.route('/photographers')
    def search_photographers():
        service_id = request.args.get('service')
        location = request.args.get('location')
        city = find_city(location)
        results_per_page = request.args.get('results_per_page')
        current_page = request.args.get('current_page')
        
        if service_id and city:
            try:
                photographer_query = Photographer.query.\
                    filter(Photographer.services.any(service_id)).\
                    filter(Photographer.city == city).order_by(
                        Photographer.name).all()
            except:
                abort(422)

            search_results = []
            
            for photographer in photographer_query:
                photo_preview = photographer.photos[:8]
                photos = [photo.format() for photo in photo_preview]
                photographer_info = photographer.overview()
                photographer_info['photos'] = photos
                search_results.append(photographer_info)
                
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

    # get details of a photographer
    @app.route('/photographer-details/<int:photographer_id>')
    def view_photographer_details(photographer_id):
        photographer_query = Photographer.query.\
            filter(Photographer.id == photographer_id).one_or_none()

        if not photographer_query:
            abort(404)
        else:
            return jsonify({
                'success': True,
                'photographer': photographer_query.details()
            })
            
    # when signing in as a photographer, temporary helper function to find the matching photographer acount
    @app.route('/photographer-accounts', methods=['GET'])
    def find_photographer_account():
        email = request.args.get('email')     
        photographer_query = Photographer.query.filter(Photographer.email == email).one_or_none()
        
        if not photographer_query:
            return jsonify({
                'success': False,
                'message': 'can not find matching account'
            })
        else:
            photographer_id = photographer_query.id
            
            return jsonify({
                'success': True,
                'photographer_id': photographer_id
            })

    # add a photographer, to be completed
    @app.route('/photographers', methods=['POST'])
    def create_photographer():
        request_body = request.get_json()
        name = request_body.get('name')
        email = request_body.get('email')
        new_photographer = Photographer(name, email)
        new_photographer.insert()
        return jsonify({
            'success': True,
            'photographer': new_photographer.overview()
        })

    # edit photographer
    # this endpoint requires authentication
    @app.route('/photographers/<int:photographer_id>', methods=['GET', 'PATCH'])
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
            # load the photographer information and render the form
            # prices_query = Price.query.filter(Price.photographer_id == photographer_id).\
            #     order_by(Price.service_id).all()
            # prices = [price.format() for price in prices_query]

            return jsonify({
                'success': True,
                'photographer': photographer.details(),
                # 'prices': prices
            })
        elif request.method == 'PATCH':
            try:
                # parse data from the submitted form
                request_body = request.get_json()
                name = request_body.get('name')
                city = request_body.get('city')
                can_travel = request_body.get('can_travel')
                address = request_body.get('address')
                services = request_body.get('services')
                profile_photo = request_body.get('profile_photo')
                portfolio_link = request_body.get('portfolio_link')
                bio = request_body.get('bio')
                
                # todo: add price for selected services

                # update photographer with submitted information
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
                    'photographer': photographer.details(),
                })
            except:
                abort(422)

    # delete the photographer
    # this endpoint requires authentication
    @app.route('/photographers/<int:photographer_id>', methods=['DELETE'])
    # @requires_auth()
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

    @app.route('/photographers/<int:photographer_id>/photos')
    def get_photos(photographer_id):
        photographer = Photographer.query.filter(
            Photographer.id == photographer_id).one_or_none()
        print(photographer_id)
        if not photographer:
            abort(404)

        if photographer.photos:
            photos = [photo.format() for photo in photographer.photos]
        else:
            photos = []

        return jsonify({
            'success': True,
            'photos': photos
        })

    # upload photo
    # this endpoint requires authentication
    @app.route('/photos/<int:photographer_id>', methods=['GET', 'POST'])
    def upload_photos(photographer_id):
        app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
        photographer = Photographer.query.filter(
            Photographer.id == photographer_id).one_or_none()
        if not photographer:
            abort(404)

        # check if the user making the request is the registered photographer
        # if payload.get('user_id') != photographer_id:
        #     abort(401)

        if request.method == 'GET':
            return redirect('upload_form.html')
        
        # testing code to test database insersion
        else:
            data = request.get_json()
            file = data.get('file')
            filename = file['filename']
            
            if file and filename:
                try:
                    new_photo = Photo(
                        photographer_id,
                        filename
                    )
                    new_photo.insert()
                    
                    return jsonify({
                        'success': True,
                        'photo': new_photo.format()
                    })
                    
                except Exception as e:
                    print(e)
                    abort(422)
            else:
                abort(400)
                
        # else:
        #     if 'file' not in request.files:
        #         flash('No file part')
        #         return redirect(request.url)

        #     file = request.files['file']

        #     if file.filename == '':
        #         flash('No selected file')
        #         return redirect(request.url)

        #     if file and allowed_file(file.filename):
        #         filename = secure_filename(file.filename)
        #         image_path = os.path.join(
        #             app.config['UPLOAD_FOLDER'], filename)
        #         file.save(image_path)

        #         try:
        #             new_photo = Photo(
        #                 photographer_id,
        #                 image_path
        #             )
        #             new_photo.insert()

        #             return jsonify({
        #                 'success': True,
        #                 'photo': new_photo.format()
        #             })
        #         except:
        #             abort(422)

        #     elif not allowed_file(file.filename):
        #         flash('File name not allowed')
        #         return redirect(request.url)


    # delete a photo from a photographers' gallery
    # this endpoint requires authentication
    @app.route('/photographers/<int:photographer_id>/photos', methods=['DELETE'])
    # @requires_auth()
    def delete_photos(photographer_id):
        photographer = Photographer.query.filter(
            Photographer.id == photographer_id).one_or_none()
        if not photographer:
            abort(404)

        # check if the user making the request is the registered photographer
        # if payload.get('user_id') != photographer_id:
        #     abort(401)

        filename = request.args.get('filename')
        photo_query = Photo.query.filter(
            Photo.filename == filename).one_or_none()
        if photo_query:
            try:
                deleted_photo = photo_query.format()
                photo_query.delete()
                return jsonify({
                    'success': True,
                    'photo': deleted_photo
                })
            except Exception as e:
                print(e)
                abort(422)
        else:
            abort(404)
            
    # error handling

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
