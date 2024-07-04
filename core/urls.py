from django.urls import path

from core.views import CookieTokenObtainPairView, CookieTokenRefreshView, secured
from .views import (
    BookListCreateView,
    BookDetailView,
    LogoutView,
    ShelfListCreateView,
    ShelfDetailView,
    ReadingProgressListCreateView,
    ReadingProgressDetailView,
    CommentListCreateView,
    CommentDetailView,
    AddBookToShelfView,
    CurrentlyReadingBooksView,
    register_user,
)

urlpatterns = [
    path("secured/", secured, name="requires_jwt"),
    path("logout/", LogoutView.as_view(), name='logout'),
    path("login/", CookieTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("signup/",register_user, name="register_user"),
    path("books/", BookListCreateView.as_view(), name="book-list-create"),
    path("books/<int:pk>/", BookDetailView.as_view(), name="book-detail"),
    path("shelves/", ShelfListCreateView.as_view(), name="shelf-list-create"),
    path("shelves/<int:pk>/", ShelfDetailView.as_view(), name="shelf-detail"),
    path(
        "shelves/<int:pk>/add_book/",
        AddBookToShelfView.as_view(),
        name="add-book-to-shelf",
    ),
    path(
        "reading-progress/",
        ReadingProgressListCreateView.as_view(),
        name="reading-progress-list-create",
    ),
    path(
        "reading-progress/<int:pk>/",
        ReadingProgressDetailView.as_view(),
        name="reading-progress-detail",
    ),
    path("comments/", CommentListCreateView.as_view(), name="comment-list-create"),
    path("comments/<int:pk>/", CommentDetailView.as_view(), name="comment-detail"),
    path(
        "books/currently-reading/",
        CurrentlyReadingBooksView.as_view(),
        name="currently-reading-books",
    ),
]
