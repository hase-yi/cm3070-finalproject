from django.urls import path

from core.views import CookieTokenObtainPairView, CookieTokenRefreshView
from .views import (
    BookListView,
    BookDetailView,
    LogoutView,
    ReadingProgressListView,
    ShelfListView,
    ShelfDetailView,
    UserListView,
    book_search,
    follow_user,
    register_user,
)

urlpatterns = [
    path("logout/", LogoutView.as_view(), name="logout"),
    path("login/", CookieTokenObtainPairView.as_view(), name="token_obtain_pair"),
    # path("token/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("signup/", register_user, name="register_user"),
    path("books/", BookListView.as_view(), name="book-list-create"),
    path("books/<int:pk>/", BookDetailView.as_view(), name="book-detail"),
    path("books/search/", book_search, name="book-search"),
    path("shelves/", ShelfListView.as_view(), name="shelf-list-create"),
    path("shelves/<int:pk>/", ShelfDetailView.as_view(), name="shelf-detail"),
    path("users/", UserListView.as_view(), name="user-list"),
    path("users/follow/<str:username>", follow_user, name="user-follow"),
    path("reading/", ReadingProgressListView.as_view(), name="reading-list-create")
]
