from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.hashers import check_password
from .serializers import UserSerializer, UserProfileSerializer
from .models import User
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

class SignupView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user = User.objects.get(email=email)
            if check_password(password, user.password):  # Check hashed password
                serializer = UserSerializer(user)
                return JsonResponse({
                    'message': 'Login successful',
                    'email': user.email
                }, status=status.HTTP_200_OK)
            return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class UserProfileView(APIView):
    def get(self, request, email):
        try:
            print("reachd")
            user = User.objects.get(email=email)
            return JsonResponse({
                'status': 'success',
                'message': f'Profile found for {email}',
                'data': {
                    'username': user.username,
                    'email': user.email,
                    'age': user.age,
                    'gender': user.gender,
                    'allergies': user.allergies,
                    'diseases': user.diseases,
                    'height': user.height,
                    'weight': user.weight
                }
            })
        except User.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

class UserProfileEditView(APIView):
    def patch(self, request, email):
        try:
            user = User.objects.get(email=email)
            serializer = UserProfileSerializer(user, data=request.data, partial=True)  
            if serializer.is_valid():
                serializer.save()  
                return JsonResponse({
                    'status': 'success',
                    'message': 'Profile updated successfully.',
                    'data': serializer.data
                })
            return JsonResponse({'status': 'error', 'message': 'Invalid data.', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        except User.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
