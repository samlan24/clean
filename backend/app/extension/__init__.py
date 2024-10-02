from flask import Blueprint


extension = Blueprint('extension', __name__)



from . import routes

