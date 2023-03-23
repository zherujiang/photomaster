import os
import time
import json
from flask.helpers import send_from_directory
from flask import Flask, request, jsonify, abort
import requests
from models import setup_db, Photographer, Service, Photo, Price
from flask_cors import CORS, cross_origin
from settings import DB_PATH, UPLOAD_BUCKET_NAME, S3_REGION, S3_ACCESSKEYID, S3_SECRETACCESSKEY, S3_SIGNATUREVERSION, S3_BUCKET_BASE_URL
from auth import requires_auth, AuthError
from settings import MAILTRAP_USERNAME, MAILTRAP_PASSWORD
import smtplib
import boto3
from botocore.config import Config
from werkzeug.utils import secure_filename


def create_app(database_path):
    app = Flask(__name__, static_folder='../frontend/build',
                static_url_path='')
    setup_db(app, database_path)
    CORS(app)

    # serve frontend React app
    @app.route('/')
    def serve_react():
        return send_from_directory(app.static_folder, 'index.html')

    # serve frontend React app
    @app.route('/account')
    def serve_callback():
        return send_from_directory(app.static_folder, 'index.html')

    @app.route('/services')
    @cross_origin()
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
        if not service_name:
            abort(400)
        try:
            new_service = Service(name=service_name.lower())
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
            abort(404, description="flask error")

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
            abort(404, description="flask error")

        affected_photographers = Photographer.query.\
            filter(Photographer.services.any(service_id)).all()

        try:
            for photographer in affected_photographers:
                # delete the service from photographers that provide this service
                photographer.services.remove(service_id)
                # delete the service price info for the affected photographers
                price_query = photographer.prices[0]
                del price_query.price_values[service_id - 1]
                del price_query.price_types[service_id - 1]

            # delete the service category
            deleted_service = service_query.format()
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
        can_travel = request.args.get('can_travel')
        max_price = request.args.get('max_price')
        sort_by = request.args.get('sort_by')
        results_per_page = request.args.get('results_per_page')
        current_page = request.args.get('current_page')
        city = find_city(location)
        location_pattern = '%' + city + '%'
        
        if service_id and city:
            try:
                photographer_w_service = Photographer.query.filter(
                    Photographer.services.any(service_id))
                if can_travel.lower() == 'true':
                    photographer_query = photographer_w_service.filter((Photographer.city.like(location_pattern)) | (Photographer.can_travel ==True))\
                        .order_by(Photographer.name).all()
                else:
                    photographer_query = photographer_w_service.filter(Photographer.city.like(location_pattern)).order_by(Photographer.name).all()
            except Exception as e:
                print(e)
                abort(422)

            search_results = []

            for photographer in photographer_query:
                photo_query = photographer.photos[:8]
                price_query = photographer.prices[0]

                # format photographer search results to include overview info, photos, and price of selected service
                current_service_price = price_query.price_values[int(service_id) - 1]
                if current_service_price <= int(max_price):
                    photographer_info = photographer.overview()
                    photographer_info['photos'] = [photo.format() for photo in photo_query]
                    photographer_info['price'] = price_query.format_by_service(service_id)
                    search_results.append(photographer_info)

            # helper function to access the price values of a photographer
            def get_service_price(user):
                return user['price']['price_value']
            
            if sort_by == 'price_up':    
                # sort search_results based on the service price low to high
                search_results.sort(key=get_service_price)
            elif sort_by == 'price_down':
                # sort search_results based on the service price high to low
                search_results.sort(key=get_service_price, reverse=True)

            # paginate search results and return
            photographers = paginate_search_results(
                search_results, results_per_page, current_page)

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
            abort(404, description="flask error")
        else:
            price_query = photographer_query.prices[0]
            prices = price_query.format()

            if photographer_query.photos:
                photos = [photo.format()
                          for photo in photographer_query.photos]
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

        existing_photographer = Photographer.query.filter(
            Photographer.email == email).one_or_none()

        if not existing_photographer:
            try:
                # initialize photographer and insert
                new_photographer = Photographer(name, email)
                new_photographer.profile_photo = S3_BUCKET_BASE_URL + \
                    'fixed_profile_photo_default_800.png'
                new_photographer.insert()

                # check if the new photographer is successfully inserted and get the new photographer id
                photographer_query = Photographer.query.filter(
                    Photographer.email == email).one_or_none()
                photographer_id = photographer_query.id

                # initialize price table for the new photographer
                services_query = Service.query.order_by(Service.id).all()
                num_services = len(services_query)
                new_prices = Price(photographer_id, [
                                   0]*num_services, [0]*num_services)
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
            abort(404, description="flask error")

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
        try:
            authenticated_user_email = payload.get(
                'https://photomaster.com/email')

            photographer_query = Photographer.query.filter(
                Photographer.email == authenticated_user_email).one_or_none()

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
        except Exception as e:
            print(e)

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
            abort(404, description="flask error")

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
        price_query = Price.query.filter(
            Price.photographer_id == photographer_id).one_or_none()
        prices = price_query.format()

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
            abort(404, description="flask error")

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
            request_body = json.loads(request.form['data'])
            name = request_body.get('name')
            city = request_body.get('city')
            can_travel = request_body.get('can_travel')
            address = request_body.get('address')
            services = request_body.get('services')
            profile_photo_url = request_body.get('profile_photo_url')
            portfolio_link = request_body.get('portfolio_link')
            bio = request_body.get('bio')
            price_values = request_body.get('price_values')
            price_types = request_body.get('price_types')

            default_profile_photo = S3_BUCKET_BASE_URL + \
                'fixed_profile_photo_default_800.png'
                
            if profile_photo_url != default_profile_photo and request.files:
                photo = request.files['image']
                cleaned_filename = secure_filename(photo.filename)
                s3_filename = f'{int(time.time())}.{cleaned_filename}'
                if upload_to_s3(filename=s3_filename, file=photo):
                    profile_photo_url = f'{S3_BUCKET_BASE_URL}{s3_filename}'

            # update price for the current photographer
            price_query = Price.query.filter(
                Price.photographer_id == photographer_id).one_or_none()
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
            photographer_query.profile_photo = profile_photo_url
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
            abort(404, description="flask error")

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
            photo_query = Photo.query.filter(
                Photo.photographer_id == photographer_query.id).order_by(Photo.id).all()
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
            abort(404, description="flask error")

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

        # upload files to s3 bucket
        new_photos_list = request.files
        for photo in new_photos_list.getlist('image'):
            # process filename to replace erroneous characters
            cleaned_filename = secure_filename(photo.filename)
            s3_filename = f'{int(time.time())}.{cleaned_filename}'
            
            if upload_to_s3(filename=s3_filename, file=photo):
                try:
                    new_photo = Photo(
                        photographer_id,
                        f'{S3_BUCKET_BASE_URL}{s3_filename}'
                    )
                    new_photo.insert()
                except Exception as e:
                    print(e)
                    abort(400)

        photo_query = Photo.query.filter(
            Photo.photographer_id == photographer_query.id).order_by(Photo.id).all()
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
            abort(404, description="flask error")

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

        # delete photo from s3
        data = request.get_json()
        selected_photos_list = data.get('selected_photos_list')
        for photo_url in selected_photos_list:
            s3_filename = photo_url.replace(S3_BUCKET_BASE_URL, '', 1)
            if delete_from_s3(s3_filename):
                try:
                    photo_to_delete = Photo.query.filter(
                        Photo.file_location == photo_url).one_or_none()
                    photo_to_delete.delete()
                except Exception as e:
                    print(e)
                    abort(400)

        photo_query = Photo.query.filter(
            Photo.photographer_id == photographer_query.id).order_by(Photo.id).all()
        updated_photo_urls = [photo.urls() for photo in photo_query]

        return jsonify({
            'success': True,
            'photo_urls': updated_photo_urls
        })

    '''
    send emails to photographers on behalf of customers
    '''
    @app.route('/emails', methods=['POST'])
    def send_email():
        request_body = request.get_json()

        recipient = request_body.get('recipient')
        recipient_name = request_body.get('recipient_name')
        email = request_body.get('email_details')

        try:
            # send email with smtplib
            delivery_status = smtplib_send(recipient, recipient_name, email)
        except:
            abort(400)
            
        return jsonify({
            'success': True,
            'delivery_status': delivery_status
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

    @app.errorhandler(403)
    def unauthorized(error):
        return jsonify({
            'success': False,
            'error': 403,
            'message': 'forbidden'
        }), 403

    @app.errorhandler(404)
    def not_found(error):
        if error.description == "flask error":
            return jsonify({
                'success': False,
                'error': 404,
                'message': 'resource not found'
            }), 404
        else:
            return send_from_directory(app.static_folder, 'index.html')

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


# send email to photographers using smtplib
def smtplib_send(recipient, recipient_name, email):
    customer_name = email.get('customer_name', 'Anonymous')
    customer_email = email.get('customer_email', 'Not provided')
    customer_phone = email.get('customer_phone', 'Not provided')
    service_name = email.get('service_name', 'Not provided')

    sender = "Photomaster <photomaster@cheryl-jiang.com>"
    receiver = f"{recipient_name} <{recipient}>"

    message = f"""\
Subject: A customer is interested in your photography
To: {receiver}
From: {sender}

Congratulations! A customer {customer_name} found you on Photomaster and is interested in working with you!\r\n
{customer_name} is interested in your {service_name} photography. You can follow up with them using the provided customer contacts below:\r\n
Customer Email: {customer_email}\r\n
Cusomter Phone: {customer_phone}\r\n
Sincerely,\r\n
Photomaster"""
        
    with smtplib.SMTP("live.smtp.mailtrap.io", 2525) as server:
        server.starttls()
        server.login(MAILTRAP_USERNAME, MAILTRAP_PASSWORD)
        server.sendmail(sender, receiver, message)
        
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

def upload_to_s3(filename, file):
    try:
        client = boto3.client('s3',
                              region_name=S3_REGION,
                              aws_access_key_id=S3_ACCESSKEYID,
                              aws_secret_access_key=S3_SECRETACCESSKEY,
                              config=Config(signature_version=S3_SIGNATUREVERSION,))

        client.put_object(Body=file,
                          Bucket=UPLOAD_BUCKET_NAME,
                          Key=filename,)

        return True
    except Exception as e:
        print(e)
        return False


def delete_from_s3(filename):
    try:
        client = boto3.client('s3',
                              region_name=S3_REGION,
                              aws_access_key_id=S3_ACCESSKEYID,
                              aws_secret_access_key=S3_SECRETACCESSKEY,
                              config=Config(signature_version=S3_SIGNATUREVERSION,))

        client.delete_object(Bucket=UPLOAD_BUCKET_NAME, Key=filename)

        return True
    except Exception as e:
        print(e)
        return False


app = create_app(database_path=DB_PATH)
if __name__ == '__main__':
    app.run(debug=True)