from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.response import Response
from functools import wraps
from django.http import HttpResponse, HttpResponseForbidden

from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Book, Shelf, ReadingProgress, Comment
from .serializers import BookSerializer, ShelfSerializer, ReadingProgressSerializer, CommentSerializer

class BookListCreateView(generics.ListCreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

class BookDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

class ShelfListCreateView(generics.ListCreateAPIView):
    queryset = Shelf.objects.all()
    serializer_class = ShelfSerializer

class ShelfDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Shelf.objects.all()
    serializer_class = ShelfSerializer

class ReadingProgressListCreateView(generics.ListCreateAPIView):
    queryset = ReadingProgress.objects.all()
    serializer_class = ReadingProgressSerializer

class ReadingProgressDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ReadingProgress.objects.all()
    serializer_class = ReadingProgressSerializer

class CommentListCreateView(generics.ListCreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer


class AddBookToShelfView(APIView):
    def post(self, request, pk):
        try:
            shelf = Shelf.objects.get(pk=pk)
        except Shelf.DoesNotExist:
            return Response({"error": "Shelf not found"}, status=status.HTTP_404_NOT_FOUND)

        book_data = request.data
        book_data['shelf'] = shelf.id  # Assign the shelf ID to the book data
        book_serializer = BookSerializer(data=book_data)

        if book_serializer.is_valid():
            book_serializer.save()
            return Response(book_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(book_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentlyReadingBooksView(generics.ListAPIView):
    serializer_class = BookSerializer

    def get_queryset(self):
        return Book.objects.filter(status='is_reading')


# Auth

def require_cookie(cookie_name):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if cookie_name in request.COOKIES:
                # Cookie is present, proceed with the view function
                return view_func(request, *args, **kwargs)
            else:
                # Cookie is missing, return a forbidden response or redirect
                return HttpResponseForbidden("This action requires authentication.")

        return _wrapped_view

    return decorator


@require_cookie("access_token")
def secured(request):
    return HttpResponse("You have access to this view.")


class CookieTokenObtainPairView(TokenObtainPairView):
    def finalize_response(self, request, response, *args, **kwargs):
        if response.data.get("access"):
            # Set the access token in a cookie
            response.set_cookie(
                "access_token",
                response.data["access"],
                httponly=True,  # HTTP-only flag
                samesite="Lax",  # SameSite attribute can be 'Lax' or 'Strict'
                secure=True,  # Only send cookie over HTTPS
            )
            # Remove the access token from the response body
            del response.data["access"]

        if response.data.get("refresh"):
            # Set the refresh token in a cookie
            response.set_cookie(
                "refresh_token",
                response.data["refresh"],
                httponly=True,
                samesite="Lax",
                secure=True,
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
