from rest_framework import serializers
from .models import User
from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist
from django.core.exceptions import ValidationError
from pymongo import MongoClient
from bson import ObjectId


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'gender', 'age','height', 'weight', 'allergies', 'diseases']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password) 
        user.save()
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'height', 'weight', 'age', 'gender', 'allergies', 'diseases']
        read_only_fields = ['email']  





