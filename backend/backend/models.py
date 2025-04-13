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

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator, ValidationError
from django.contrib.auth.hashers import make_password
import re

class User(models.Model):
    username = models.CharField(max_length=50)

    email = models.EmailField(
        max_length=100,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^[\w\.-]+@(?:gmail\.com|ves\.ac\.in|[\w-]+\.[\w]{2,})$',
                message='Email must be a valid address ending with @gmail.com, @ves.ac.in, or other valid domain.'
            )
        ]
    )

    password = models.CharField(max_length=255)

    age = models.IntegerField(
        default=0,
        validators=[MinValueValidator(18), MaxValueValidator(75)]
    )

    gender = models.CharField(max_length=25)

    allergies = models.JSONField(default=list)
    diseases = models.JSONField(default=list)

    height = models.FloatField(
        default=0,
        validators=[MinValueValidator(100), MaxValueValidator(250)]  # in cm
    )

    weight = models.FloatField(
        default=0,
        validators=[MinValueValidator(30), MaxValueValidator(250)]  # in kg
    )

    def set_password(self, raw_password):
        if not self.validate_password_strength(raw_password):
            raise ValidationError("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.")
        self.password = make_password(raw_password)

    def validate_password_strength(self, password):
        pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$'
        return bool(re.match(pattern, password))

    def clean(self):
        # You can add any additional model-level validations here
        if self.age and not (18 <= self.age <= 75):
            raise ValidationError({'age': "Age must be between 18 and 75."})
        if self.height and not (50 <= self.height <= 250):
            raise ValidationError({'height': "Height must be between 50cm and 250cm."})
        if self.weight and not (30 <= self.weight <= 250):
            raise ValidationError({'weight': "Weight must be between 30kg and 250kg."})

    def __str__(self):
        return self.username

    class Meta:
        db_table = 'user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'   

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
