import logging
from venv import logger
from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.response import Response
from functools import wraps
from django.http import Http404, HttpResponse, HttpResponseForbidden, JsonResponse
from rest_framework.permissions import IsAuthenticated

from rest_framework.decorators import api_view
from rest_framework import mixins, generics
from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    UpdateAPIView,
    DestroyAPIView,
    RetrieveAPIView,
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Book, Shelf, ReadingProgress, Comment
from .serializers import (
    BookSerializer,
    ShelfSerializer,
    ReadingProgressSerializer,
    CommentSerializer,
    UserSerializer,
)


class BookListCreateView(generics.ListCreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer


class BookDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer


import logging
from django.http import Http404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import mixins, generics
from .models import Shelf
from .serializers import ShelfSerializer

logger = logging.getLogger(__name__)


class ShelfListView(ListAPIView, CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ShelfSerializer

    def get_queryset(self):
        return Shelf.objects.for_user(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


class ShelfDetailView(
    RetrieveAPIView,
    UpdateAPIView,
    DestroyAPIView,
):
    permission_classes = [IsAuthenticated]
    serializer_class = ShelfSerializer

    def get_queryset(self):
        return Shelf.objects.for_user(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


class BookListView(ListAPIView, CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookSerializer

    def get_queryset(self):
        shelf = self.request.query_params.get("shelf", None)
        if shelf:
            return Book.objects.get_books_by_shelf(shelf, self.request.user)
        else:
            return Book.objects.for_user(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


class BookDetailView(
    RetrieveAPIView,
    UpdateAPIView,
    DestroyAPIView,
):
    permission_classes = [IsAuthenticated]
    serializer_class = BookSerializer

    def get_queryset(self):
        return Book.objects.for_user(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


class CookieTokenObtainPairView(TokenObtainPairView):
    def finalize_response(self, request, response, *args, **kwargs):
        if response.data.get("access"):
            # Set the access token in a cookie
            response.set_cookie(
                "access_token",
                response.data["access"],
                httponly=True,  # HTTP-only flag
                samesite="None",  # SameSite attribute can be 'Lax' or 'Strict'
                secure=True,  # Only send cookie over HTTPS
                path="/",
            )
            # Remove the access token from the response body
            del response.data["access"]

        if response.data.get("refresh"):
            # Set the refresh token in a cookie
            response.set_cookie(
                "refresh_token",
                response.data["refresh"],
                httponly=True,
                samesite="None",
                secure=True,
                path="/",
            )
            # Remove the refresh token from the response body
            del response.data["refresh"]

        return super().finalize_response(request, response, *args, **kwargs)


class CookieTokenRefreshView(TokenRefreshView):
    def finalize_response(self, request, response, *args, **kwargs):
        if response.data.get("access"):
            response.set_cookie(
                "access_token",
                response.data["access"],
                httponly=True,
                samesite="Lax",
                secure=True,
            )
            del response.data["access"]
        return super().finalize_response(request, response, *args, **kwargs)


# User Registration View
@api_view(["POST"])
def register_user(request):
    print("Request data:", request.data)  # Log the incoming data
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# logout
class LogoutView(APIView):
    def post(self, request):
        response = JsonResponse({"detail": "Successfully logged out."})
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response
