import logging
from venv import logger
import requests
from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.response import Response
from functools import wraps
from django.http import Http404, HttpResponse, HttpResponseForbidden, JsonResponse
from rest_framework.permissions import IsAuthenticated

from rest_framework.decorators import api_view, permission_classes
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

OPEN_LIBRARY_SEARCH_URL = "http://openlibrary.org/search.json"


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
        books = Book.objects.for_user(user=self.request.user)

        search_str = self.request.query_params.get("search", None)
        if search_str:
            books = books.search_local(search_str)

        shelf = self.request.query_params.get("shelf", None)
        if shelf:
            books = books.get_books_by_shelf(shelf)

        return books

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


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def book_search(request):
    title_str = request.query_params.get("title", None)
    isbn_str = request.query_params.get("isbn", None)

    search_results = []

    if not title_str and not isbn_str:
        return Response(search_results, status=status.HTTP_200_OK)

    # Local search
    local_books = Book.objects.for_user(user=request.user)
    local_str = isbn_str if isbn_str else title_str
    if local_str:
        local_books = list(local_books.search_local(local_str).values())
        for book in local_books:
            search_results.append({"book": book, "type": "local"})

    # Remote search
    remote_params = {"isbn": isbn_str} if isbn_str else {"title": title_str}

    response = requests.get(OPEN_LIBRARY_SEARCH_URL, params=remote_params)
    if response.status_code == 200:
        data = response.json()
        for doc in data.get("docs", []):
            cover = doc.get("cover_i", None)
            book_data = {
                "isbn": isbn_str if isbn_str else doc.get("isbn", [None])[0],
                "title": doc.get("title"),
                "author": ", ".join(doc.get("author_name", [])),
                "total_pages": doc.get("number_of_pages_median", None),
                "release_year": doc.get("first_publish_year"),
                "image": (
                    f"https://covers.openlibrary.org/b/id/{cover}-L.jpg"
                    if cover
                    else None
                ),
            }

            search_results.append({"book": book_data, "type": "external"})

    return Response(search_results, status=status.HTTP_200_OK)


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
