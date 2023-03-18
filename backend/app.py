import os
from flask.helpers import send_from_directory
from flask import Flask, request, jsonify, abort, redirect, flash
import requests
from models import setup_db, Photographer, Service, Photo, Price
from flask_cors import CORS
from settings import DB_PATH
from werkzeug.utils import secure_filename
from auth import requires_auth, AuthError
# from flask_mail import Mail, Message
# from settings import MAIL_USERNAME, MAIL_PASSWORD
import smtplib

# send email to photographers using smtplib
def smtplib_send(recipient, email):
    customer_name = email.get('customer_name', 'Anonymous')
    customer_email = email.get('customer_email', 'Not provided')
    customer_phone = email.get('customer_phone', 'Not provided')
    service_name = email.get('service_name', 'Not provided')
    
    sender = "Photomaster <photomaster@cheryl-jiang.com>"
    receiver = f"A Test User <{recipient}>"

    message = f"""\
Subject: A customer is interested in your photography
To: {receiver}
From: {sender}

Congratulations! A customer {customer_name} found you on Photomaster and is interested in working with you!
{customer_name} is interested in your {service_name} photography. You can follow up with them using the provided customer contacts below:
Customer Email: {customer_email}
Cusomter Phone: {customer_phone}"""

    try:
        with smtplib.SMTP("sandbox.smtp.mailtrap.io", 2525) as server:
            server.login("cceaa5b31ffd1d", "1f9fd5996ea273")
            server.sendmail(sender, receiver, message)
    except Exception as e:
        print(e)
        
    return 'Sent'

# helper function to return a city based on the zip code entered
def find_city(location):
    zip_API_url = 'https://api.zippopotam.us/us/'
    if isinstance(location, str):
        if location.isdigit():
            # the location parameter is numeric
            if len(location) == 5:
                # the location parameter looks like a 5-digt zipcode
                request_url = zip_API_url + location
                response = requests.get(request_url)
                places_info = response.json().get('places')
                if places_info:
                    city = places_info[0].get('place name').lower()
                return city
            else:
                # invalid zipcode format
                return None
        else:
            # the location parameter is not numeric
            return location.lower()
    else:
        return None

# helper function to paginate search results based on the No. of results per page and page number
def paginate_search_results(selection, results_per_page, current_page):
    start = int(results_per_page) * (int(current_page) - 1)
    end = start + int(results_per_page)
    current_photographers = selection[start:end]
    return current_photographers

# helper function to access the price values of a photographer
def get_service_price(photographer):
    return photographer['price']['price_value']


def create_app(database_path):
    app = Flask(__name__, static_folder='frontend/build', static_url_path='')
    setup_db(app, database_path)
    CORS(app)
    
    # mail service config (using mailtrap)
    # mail = Mail(app)
    # app.config['MAIL_SERVER']='sandbox.smtp.mailtrap.io'
    # app.config['MAIL_PORT'] = 2525
    # app.config['MAIL_USERNAME'] = MAIL_USERNAME
    # app.config['MAIL_PASSWORD'] = MAIL_PASSWORD
    # app.config['MAIL_USE_TLS'] = True
    # app.config['MAIL_USE_SSL'] = False

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
    def add_services(payload):
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
    def edit_service(payload, service_id):
        service_query = Service.query.filter(
            Service.id == service_id).one_or_none()
        if not service_query:
            abort(404)

        request_data = request.get_json()
        if not request_data:
            abort(400)

        try:
            service_query.name = request_data.get('name').lower()
            service_query.image_link = request_data.get('image_link')
            service_query.update()

            return jsonify({
                'success': True,
                'service': service_query.format()
            })
        except:
            abort(422)

    '''
    delete service category (by service id), administrator only
    requires administrator permission
    '''
    @app.route('/services/<int:service_id>', methods=['DELETE'])
    @requires_auth(permission='delete:services')
    def delete_service(payload, service_id):
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
    @requires_auth()
    def create_photographer(payload):
        request_body = request.get_json()
        name = request_body.get('name')
        email = request_body.get('email')
        
        authenticated_user_email = payload.get('https://photomaster.com/email')       
        if email != authenticated_user_email:
            # authenticated user is not the owner of the email sent with the request body
            raise AuthError(
                {
                    'code': 'unauthorized',
                    'description': 'Resource not found'
                }, 401
            )
        
        existing_photographer = Photographer.query.filter(Photographer.email == email).one_or_none()
        
        if not existing_photographer:
            try:
                # initialize photographer and insert
                new_photographer = Photographer(name, email)
                new_photographer.insert()
                
                # check if the new photographer is successfully inserted and get the new photographer id
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
                abort(400)
        else:
            # photographer account already exists
            abort(403)


    '''
    delete the photographer
    this endpoint requires authentication
    '''
    @app.route('/photographers/<int:photographer_id>', methods=['DELETE'])
    @requires_auth(permission='delete:photographers')
    def delete_photographer(payload, photographer_id):
        photographer_query = Photographer.query.filter(
            Photographer.id == photographer_id).one_or_none()
        if not photographer_query:
            abort(404)

        photographer_email = photographer_query.email
        authenticated_user_email = payload.get('https://photomaster.com/email')
        if photographer_email != authenticated_user_email:
            # authenticated user is not the owner of the requested photographer account
            raise AuthError(
                {
                    'code': 'unauthorized',
                    'description': 'Resource not found'
                }, 404
            )

        deleted_photographer = photographer_query.details()

        try:
            photographer_query.delete()
            return jsonify({
                'success': True,
                'photographer': deleted_photographer
            })
        except:
            abort(422)


    '''
    helper function to check if an email has been registered as a photographer acount
    '''
    @app.route('/photographer-accounts', methods=['GET'])
    @requires_auth()
    def find_photographer_account(payload):        
        authenticated_user_email = payload.get('https://photomaster.com/email')
        
        photographer_query = Photographer.query.filter(Photographer.email == authenticated_user_email).one_or_none()
        
        if not photographer_query:
            return jsonify({
                'success': True,
                'account_registered': False,
                'message': 'can not find account with the matching email'
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
    get photographer profile details for edit
    this endpoint requires authentication
    '''
    @app.route('/photographer-edits/<int:photographer_id>', methods=['GET'])
    @requires_auth(permission='get:photographer-edits')
    def edit_photographer(payload, photographer_id):
        photographer_query = Photographer.query.filter(
            Photographer.id == photographer_id).one_or_none()
        if not photographer_query:
            abort(404)

        # check if the user making the request is the registered photographer
        photographer_email = photographer_query.email
        authenticated_user_email = payload.get('https://photomaster.com/email')
        
        if photographer_email != authenticated_user_email:
            # authenticated user is not the owner of the requested photographer account
            raise AuthError(
                {
                    'code': 'unauthorized',
                    'description': 'Resource not found'
                }, 404
            )

        # get the price information for the current photographer, use query instead of relationship for prices to avoid instrumented list
        price_query = Price.query.filter(Price.photographer_id == photographer_id).one_or_none()
        prices= price_query.format()

        return jsonify({
            'success': True,
            'photographer_details': photographer_query.details(),
            'prices': prices
        })
                
    '''
    edit photographer
    this endpoint requires authentication
    '''
    @app.route('/photographer-edits/<int:photographer_id>', methods=['PATCH'])
    @requires_auth(permission='patch:photographer-edits')
    def update_photographer(payload, photographer_id):
        photographer_query = Photographer.query.filter(
            Photographer.id == photographer_id).one_or_none()
        if not photographer_query:
            abort(404)

        # check if the user making the request is the registered photographer
        photographer_email = photographer_query.email
        authenticated_user_email = payload.get('https://photomaster.com/email')
        
        if photographer_email != authenticated_user_email:
            # authenticated user is not the owner of the requested photographer account
            raise AuthError(
                {
                    'code': 'unauthorized',
                    'description': 'Resource not found'
                }, 404
            )

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
            photographer_query.name = name.lower()
            photographer_query.city = city.lower()
            photographer_query.can_travel = can_travel
            photographer_query.address = address
            photographer_query.services = services
            photographer_query.profile_photo = profile_photo
            photographer_query.portfolio_link = portfolio_link
            photographer_query.bio = bio
            photographer_query.update()

            return jsonify({
                'success': True,
                'photographer_details': photographer_query.details(),
                'prices': prices
            })
        except:
            abort(422)

    '''
    get photos of a photographer
    this endpoint requires authentication
    '''
    @app.route('/photos/<int:photographer_id>', methods=['GET'])
    @requires_auth(permission='get:photos')
    def get_photos(payload, photographer_id):
        photographer_query = Photographer.query.filter(
            Photographer.id == photographer_id).one_or_none()
        if not photographer_query:
            abort(404)

        # check if the user making the request is the registered photographer
        photographer_email = photographer_query.email
        authenticated_user_email = payload.get('https://photomaster.com/email')
        
        if photographer_email != authenticated_user_email:
            # authenticated user is not the owner of the requested photographer account
            raise AuthError(
                {
                    'code': 'unauthorized',
                    'description': 'Resource not found'
                }, 404
            )

        # return existing photos for the requested photographer
        try:
            photo_query = Photo.query.filter(Photo.photographer_id == photographer_query.id).order_by(Photo.id).all()
            photo_urls = [photo.urls() for photo in photo_query]
            
            return jsonify({
                    'success': True,
                    'photo_urls': photo_urls
                })
        except Exception as e:
            print(e)
            abort(422)
            
    '''
    upload photo
    this endpoint requires authentication
    '''
    @app.route('/photos/<int:photographer_id>', methods=['POST'])
    @requires_auth(permission='post:photos')
    def upload_photos(payload, photographer_id):
        photographer_query = Photographer.query.filter(
            Photographer.id == photographer_id).one_or_none()
        if not photographer_query:
            abort(404)

        # check if the user making the request is the registered photographer
        photographer_email = photographer_query.email
        authenticated_user_email = payload.get('https://photomaster.com/email')
        
        if photographer_email != authenticated_user_email:
            # authenticated user is not the owner of the requested photographer account
            raise AuthError(
                {
                    'code': 'unauthorized',
                    'description': 'Resource not found'
                }, 404
            )
        
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
                
        photo_query = Photo.query.filter(Photo.photographer_id == photographer_query.id).order_by(Photo.id).all()
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
    @requires_auth(permission='delete:photos')
    def delete_photos(payload, photographer_id):
        photographer_query = Photographer.query.filter(
            Photographer.id == photographer_id).one_or_none()

        if not photographer_query:
            abort(404)

        # check if the user making the request is the registered photographer
        photographer_email = photographer_query.email
        authenticated_user_email = payload.get('https://photomaster.com/email')
        
        if photographer_email != authenticated_user_email:
            # authenticated user is not the owner of the requested photographer account
            raise AuthError(
                {
                    'code': 'unauthorized',
                    'description': 'Resource not found'
                }, 404
            )
        
        data = request.get_json()
        selected_photos_list = data.get('selected_photos_list')
        
        for photo_url in selected_photos_list:
            try:
                photo_to_delete = Photo.query.filter(Photo.file_location == photo_url).one_or_none()
                photo_to_delete.delete()
            except Exception as e:
                print(e)
                abort(400)
        
        photo_query = Photo.query.filter(Photo.photographer_id == photographer_query.id).order_by(Photo.id).all()
        updated_photo_urls = [photo.urls() for photo in photo_query]
        
        return jsonify({
            'success': True,
            'photo_urls': updated_photo_urls
        })
    

    @app.route('/serve', methods=['GET'])
    def serve():
        # abort(400)
        
        return jsonify({
            'success': True,
            'info': 'aaa'
        })
        # return send_from_directory(app.static_folder, 'index.html')
    
    '''
    send emails to photographers on behalf of customers
    '''
    @app.route('/emails', methods=['POST'])
    def send_email():        
        request_body = request.get_json()
        # print('email request body', request_body)
        
        recipient = request_body.get('recipient')
        email = request_body.get('email_details')
        
        print('recipient', recipient)
        print('email', email)
        
        try:
            smtplib_send(recipient, email)
            return jsonify({
                'success': True,
                'email': 'Sent'
            })
        except:
            abort(400)

        # send email with mailtrap API
        # mailtrap_url = "https://send.api.mailtrap.io/api/send"
        # payload = "{\"from\":{\"email\":\"mailtrap@cheryl-jiang.com\",\"name\":\"Mailtrap Test\"},\"to\":[{\"email\":\"cheryl.zjiang@gmail.com\"}],\"subject\":\"You are awesome!\",\"text\":\"Congrats for sending test email with Mailtrap!\",\"category\":\"Integration Test\"}"
        # headers = {
        # "Authorization": "Bearer 49893c9b5e1ed214906a162219e2b55b",
        # "Content-Type": "application/json"
        # }
        # response = requests.request("POST", mailtrap_url, headers=headers, data=payload)
        
        # send email with Flask-mail
        # msg = Message('A customer is interested in your photography', sender = 'photomaster@cheryl-jiang.com', recipients = [recipient])
        # msg.body = 'Congratulations! A customer found you on Photomaster and is interested in working with you!'
        # print(msg)
        # mail.send(msg)
        # return 'Sent'
        

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
    
    @app.errorhandler(403)
    def unauthorized(error):
        return jsonify({
            'success': False,
            'error': 403,
            'message': 'forbidden'
        }), 403

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
            'message': error.error_message
        }), error.status_code

    return app


app = create_app(database_path=DB_PATH)
if __name__ == '__main__':
    app.run()