import os
from sqlalchemy import Column, String, Integer, Boolean
from flask_sqlalchemy import SQLAlchemy
import json

db = SQLAlchemy()

def setup_db(app, database_path):
    '''
    setup_db(app)
        binds a flask application and a SQLAlchemy service
    '''
    app.config["SQLALCHEMY_DATABASE_URI"] = database_path
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.app = app
    db.init_app(app)
    with app.app_context():
        db.create_all()
        

class Service(db.Model):
    __tablename__ = 'services'

    id = Column(Integer, primary_key=True)
    name = Column(String(60), nullable=False)
    image_link = Column(String(255))

    # methods
    def init(self, name):
        self.name = name

    def format(self):
        return {
            'id': self.id,
            'name': self.name,
            'image_link': self.image_link,
        }

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def update(self):
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()


class Photographer(db.Model):
    __tablename__ = 'photographers'

    id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)
    email = Column(String(120), nullable=False)
    city = Column(String(120))
    can_travel = Column(Boolean, nullable=False, default=False)
    services = Column(db.ARRAY(Integer, dimensions=1))
    profile_photo = Column(String(255))
    address = Column(String(255))
    portfolio_link = Column(String(255))
    bio = Column(db.Text)

    # relationships
    photos = db.relationship(
        'Photo', back_populates='photographer', cascade='all, delete')
    prices = db.relationship(
        'Price', back_populates='photographer', cascade='all, delete')

    # methods
    def __init__(self, name, email):
        self.name = name
        self.email = email

    def overview(self):
        return {
            'id': self.id,
            'name': self.name,
            'city': self.city,
            'can_travel': self.can_travel,
            'address': self.address,
            'services': self.services,
            'profile_photo': self.profile_photo,
        }

    def details(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'city': self.city,
            'can_travel': self.can_travel, 
            'address': self.address,
            'services': self.services,
            'profile_photo': self.profile_photo,
            'portfolio_link': self.portfolio_link,
            'bio': self.bio
        }

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def update(self):
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()


class Photo(db.Model):
    __tablename__ = 'photos'
    id = Column(Integer, primary_key=True, autoincrement=True)
    photographer_id = Column(db.ForeignKey(
        'photographers.id', ondelete='CASCADE'), primary_key=True)
    filename = Column(String(255), nullable=False)

    # relationships
    photographer = db.relationship('Photographer', back_populates='photos')

    # methods
    def __init__(self, photographer_id, filename):
        self.photographer_id = photographer_id
        self.filename = filename

    def format(self):
        return {
            'id': self.id,
            'photographer_id': self.photographer_id,
            'filename': self.filename,
        }

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()


class Price(db.Model):
    __tablename__ = 'prices'
    photographer_id = Column(db.ForeignKey(
        'photographers.id', ondelete='CASCADE'), primary_key=True)
    prices = Column(db.ARRAY(db.Float, dimensions=1), nullable=False)
    price_types = Column(db.ARRAY(Integer, dimensions=1), nullable=False)

    # relationships
    photographer = db.relationship('Photographer', back_populates='prices')

    # methods
    def __init__(self, photographer_id, prices, price_types):
        self.photographer_id = photographer_id
        self.prices = prices
        self.price = price_types

    def format(self):
        return {
            'photographer_id': self.photographer_id,
            'prices': self.prices,
            'price_types': self.price_types,
        }

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def update(self):
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()
