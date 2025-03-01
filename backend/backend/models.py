from djongo import models
from django.core.validators import RegexValidator
from django.core.validators import FileExtensionValidator
from django.contrib.auth.hashers import make_password
from django.utils.timezone import now 
from django.db import models
from django.core.exceptions import ValidationError
from django.utils.timezone import now
from django.conf import settings
from pymongo import MongoClient
from bson import ObjectId

from bson.objectid import ObjectId

def generate_object_id():
    return str(ObjectId())

class User(models.Model):
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    password = models.CharField(max_length=255)
    age=models.IntegerField(default=0)
    gender = models.CharField(max_length=25)
    allergies=models.JSONField(default=list)
    diseases=models.JSONField(default=list)
    height=models.FloatField(default=0)
    weight=models.FloatField(default=0)
    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def __str__(self):
        return self.username

    class Meta:
        db_table = 'user'

class Products(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    quantity=models.FloatField(default=0)
    protien = models.FloatField(default=0)
    carbohydrates = models.FloatField(default=0)
    fat = models.FloatField(default=0)
    sodium = models.FloatField(default=0)
    sugar = models.FloatField(default=0)
    fibre = models.FloatField(default=0)
    nutrition_data = models.JSONField(default=dict)
    ingredients = models.JSONField(default=list)
    
    def __str__(self):
        return self.name    
