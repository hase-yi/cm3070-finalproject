from rest_framework import generics
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
  queryset = User.objects.all()
  permission_classes = (AllowAny,)
  serializer_class = UserSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
  serializer_class = TokenObtainPairSerializer