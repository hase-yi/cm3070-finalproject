import logging

import requests
from django.contrib.auth.models import User
from django.db.models import Q
from django.http import JsonResponse
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.generics import (CreateAPIView, DestroyAPIView,
                                     ListAPIView, RetrieveAPIView,
                                     UpdateAPIView)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import (Activity, Book, Comment, Following, ImageAsset,
                     ReadingProgress, Review, Shelf)
from .serializers import (ActivitySerializer, BookSerializer,
                          CommentSerializer, ImageAssetSerializer,
                          ReadingProgressSerializer, ReviewSerializer,
                          ShelfSerializer, UserListSerializer, UserSerializer)

logger = logging.getLogger(__name__)
OPEN_LIBRARY_SEARCH_URL = "http://openlibrary.org/search.json"


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

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BookDetailView(
    RetrieveAPIView,
    UpdateAPIView,
    DestroyAPIView,
):
    permission_classes = [IsAuthenticated]
    serializer_class = BookSerializer

    def get_queryset(self):
        return Book.objects.filter(
            Q(user=self.request.user)
            | Q(review__shared=True)
            | Q(reading_progress__shared=True)
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def book_search(request):
    title_str = request.query_params.get("title", None)
    isbn_str = request.query_params.get("isbn", None)

    search_results = []

    if not title_str and not isbn_str:
        return Response(search_results, status=status.HTTP_200_OK)

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

            search_results.append(book_data)

    return Response(search_results, status=status.HTTP_200_OK)


class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        search_str = self.request.query_params.get("search", None)
        relationship = self.request.query_params.get("relationship", None)

        if relationship == "followers":
            # Get the User objects from the Following instances
            users = User.objects.filter(following__in=self.request.user.followers.all())
        elif relationship == "followed":
            try:
                users = Following.objects.get(
                    user=self.request.user
                ).followed_users.all()
            except Following.DoesNotExist:
                users = User.objects.none()
        elif relationship is None:
            users = User.objects.all()
        else:
            return Response({"error": "Invalid relationship value."}, status=400)

        if search_str:
            users = users.filter(username__icontains=search_str)

        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data)


class ActivityListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ActivitySerializer

    def get_queryset(self):
        try:
            users = Following.objects.get(user=self.request.user).followed_users.all()
        except Following.DoesNotExist:
            users = User.objects.none()

        limit = self.request.query_params.get("limit", 5)

        return Activity.objects.filter(user__in=users).order_by("-timestamp")[:limit]


@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def follow_user(request, username):
    try:
        target_user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.user == target_user:
        return Response(
            {"error": "Both users are identical"}, status=status.HTTP_400_BAD_REQUEST
        )

    if request.method == "POST":
        # Get or create a Following instance for the authenticated user
        following, _ = Following.objects.get_or_create(user=request.user)

        following.followed_users.add(target_user)
        following.save()

        return Response(
            {"message": "User followed successfully"}, status=status.HTTP_200_OK
        )

    else:
        # Get the Following instance for the authenticated user
        try:
            following = Following.objects.get(user=request.user)
        except Following.DoesNotExist:
            return Response(
                {"message": "User unfollowed successfully"}, status=status.HTTP_200_OK
            )

        following.followed_users.remove(target_user)
        following.save()

        return Response(
            {"message": "User unfollowed successfully"}, status=status.HTTP_200_OK
        )


class ReadingProgressListView(ListAPIView, CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ReadingProgressSerializer

    def get_queryset(self):
        status = self.request.query_params.get("status", None)
        book = self.request.query_params.get("book", None)
        username_filter = self.request.query_params.get("username", None)
        limit = self.request.query_params.get("limit", 5)

        if username_filter:
            reading_progress = ReadingProgress.objects.filter(
                book__user=User.objects.get(username=username_filter)
            )
            if username_filter != self.request.user.username:
                reading_progress = reading_progress.filter(shared=True)

        else:
            if status:
                reading_progress = ReadingProgress.objects.for_user(
                    self.request.user
                ).filter(status=status)
            else:
                reading_progress = ReadingProgress.objects.for_user_and_followed(
                    user=self.request.user
                )

        if book:
            reading_progress.filter(book=book)

        limited = reading_progress.order_by("timestamp")[:limit]
        return limited

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def perform_create(self, serializer):
        progress = serializer.save()

        Activity.objects.create(
            user=self.request.user,
            book=progress.book,
            reading_progress=progress,
            text=f"{self.request.user} tarted tracking their reading status for {progress.book.title}",
            backlink=f"/books/{progress.book.id}",
        )


class ReadingProgressDetailView(
    RetrieveAPIView,
    UpdateAPIView,
    DestroyAPIView,
):
    permission_classes = [IsAuthenticated]
    serializer_class = ReadingProgressSerializer

    def get_queryset(self):
        return ReadingProgress.objects.filter(book__user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def perform_update(self, serializer):
        progress = serializer.save()

        Activity.objects.create(
            user=self.request.user,
            book=progress.book,
            reading_progress=progress,
            text=f"{self.request.user} tarted tracking their reading status for {progress.book.title}",
            backlink=f"/books/{progress.book.id}",
        )


class ReviewListView(ListAPIView, CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ReviewSerializer

    def get_queryset(self):
        username_filter = self.request.query_params.get("username", None)
        limit = self.request.query_params.get("limit", 5)

        if username_filter:
            reviews = Review.objects.filter(
                book__user=User.objects.get(username=username_filter)
            )
            if username_filter != self.request.user.username:
                reviews = reviews.filter(shared=True)
        else:
            reviews = Review.objects.for_user_and_followed(user=self.request.user)

        return reviews.order_by("date")[:limit]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def perform_create(self, serializer):
        review = serializer.save()

        Activity.objects.create(
            user=self.request.user,
            book=review.book,
            review=review,
            text=f"{self.request.user} wrote a review for {review.book.title}",
            backlink=f"/books/{review.book.id}",
        )


class ReviewDetailView(
    RetrieveAPIView,
    UpdateAPIView,
    DestroyAPIView,
):
    permission_classes = [IsAuthenticated]
    serializer_class = ReviewSerializer

    def get_queryset(self):
        return Review.objects.for_user_and_followed(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


class CommentListView(ListAPIView, CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CommentSerializer

    def get_queryset(self):
        review_id = self.kwargs["review_pk"]
        return Comment.objects.for_user_and_followed(user=self.request.user).filter(
            review_id=review_id
        )

    def perform_create(self, serializer):
        review_id = self.kwargs["review_pk"]
        comment = serializer.save(review_id=review_id, user=self.request.user)

        Activity.objects.create(
            user=self.request.user,
            book=comment.book,
            review=comment.review,
            comment=comment,
            text=f"{self.request.user} replied to the review of {comment.book.user.username}'s review of {comment.book.title}",
            backlink=f"/books/{comment.book.id}",
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


class CommentDetailView(
    RetrieveAPIView,
    UpdateAPIView,
    DestroyAPIView,
):
    permission_classes = [IsAuthenticated]
    serializer_class = CommentSerializer

    def get_queryset(self):
        return Comment.objects.for_user_and_followed(
            user=self.request.user
        )  # pragma: no cover

    def get_object(self):
        review_id = self.kwargs["review_pk"]
        comment_id = self.kwargs["comment_pk"]
        return generics.get_object_or_404(Comment, review_id=review_id, id=comment_id)

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


# User Registration View
@api_view(["POST"])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_username(request):
    return JsonResponse({"username": request.user.username})




class ImageAssetListCreateView(generics.ListCreateAPIView):
    queryset = ImageAsset.objects.all()
    serializer_class = ImageAssetSerializer

    def perform_create(self, serializer):
        # Retrieve book and shelf from the validated data
        book = serializer.validated_data.get("book")
        shelf = serializer.validated_data.get("shelf")

        # Ensure only one of book or shelf is set
        if book and shelf:
            raise ValidationError(
                "An image can be associated with either a book or a shelf, not both."
            )
        if not book and not shelf:
            raise ValidationError(
                "An image must be associated with either a book or a shelf."
            )

        # Delete the existing image if a new image is being uploaded
        if book:
            existing_image = ImageAsset.objects.filter(book=book).first()
        elif shelf:
            existing_image = ImageAsset.objects.filter(shelf=shelf).first()

        if existing_image:
            existing_image.delete()

        # Save the new image
        serializer.save()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )
