import json
from flask import request
from functools import wraps
from jose import jwt
from urllib.request import urlopen
from settings import AUTH0_DOMAIN, ALGORITHMS, API_AUDIENCE

# AuthError Exception class, a standard way to communicate auth failure modes
class AuthError(Exception):
    def __init__(self, error, status_code):
        self.error = error
        self.status_code = status_code
 
# get authorization token from request header       
def get_token_auth_header():
    auth_header = request.headers.get('Authorization', None)
    if not auth_header:
        raise AuthError(
            {'code': 'authorization_header_missing',
             'description': 'Authorization header is expected.'
            }, 401
        )
    
    header_parts = auth_header.split['']
    
    if header_parts[0].lower() != 'bearer':
        raise AuthError(
            {
                'code': 'invalid_header',
                'description': 'Authorization header must start with "Bearer".'
            }, 401
        )
    
    if len(header_parts) <=1:
        raise AuthError(
            {
                'code': 'invalid_header',
                'description': 'Token not found'
            }, 401
        )
        
    if len(header_parts) > 2:
        raise AuthError(
            {
                'code': 'invalid_header',
                'description': 'Authorization header must be bearer token'
            }, 401
        )
    
    token = header_parts[1]
    return token

# decode jwt token and verify the token
def decode_verify_jwt(token):
    try:
        token_header = jwt.get_unverified_header(token)
    except:
        raise AuthError(
            {
                'code': 'invalid_token_header',
                'description': 'Invalid token format'
            }, 401
        )
    
    jsonurl = urlopen(f'https://{AUTH0_DOMAIN}/.well-known/jwks.json')
    jwks = json.loads(jsonurl.read())
    rsa_key = dict()
    
    if 'kid' not in token_header:
        raise AuthError(
            {
                'code': 'invalid_token_header',
                'description': 'Authorization malformed'
            }, 401
        )
    
    for key in jwks['keys']:
        if key['kid'] == token_header['kid']:
            rsa_key = {
                'kty': key['kty'],
                'kid': key['kid'],
                'use': key['use'],
                'n': key['n'],
                'e': key['e']
            }
    
    if rsa_key:
        try:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=ALGORITHMS,
                audience=API_AUDIENCE,
                issuer=f'https://{AUTH0_DOMAIN}/'
            )
            return payload
        
        except jwt.ExpiredSignatureError:
            raise AuthError(
                {'code': 'token_expired',
                'description': 'Token expired.'
                }, 401
            )
        except jwt.JWTClaimsError:
            raise AuthError(
                {'code': 'invalid_claims',
                'description': 'Incorrect claims. Please check the audience and issuer.'
                }, 401
            )
        except Exception:
            raise AuthError(
                {'code': 'invalid_header',
                'description': 'Unable to parse authentication token.'
                }, 400
            )
    
    # raise exception when rsa_key is None
    raise AuthError(
        {
            'code': 'invalid_token_header',
            'description': 'Unable to find the appropriate key.'
        }, 400
    )
    
# method to check permissions for endpoints that require permissions
'''
inputs
    permission: a permission as string, that is required to access the API endpoint
    payload: decoded jwt payload
'''
def check_permissions(permission, payload):
    if 'permissions' not in payload:
        raise AuthError(
            {
                'code': 'invalid_claims',
                'description': 'Permission not included in JWT.'
            }, 400
        )
    
    if permission not in payload['permissions']:
        raise AuthError(
            {
                'code': 'unauthorized',
                'description': 'Permission not found'
            }, 403
        )
    return True

def requires_auth(permission=''):
    def requires_auth_decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            token = get_token_auth_header()
            payload = decode_verify_jwt(token)
            check_permissions(permission, payload)
            return f(payload, *args, **kwargs)
        return wrapper
    return requires_auth_decorator
