from django.urls import path

from core.views import CookieTokenObtainPairView
from .views import (
    BookListView,
    BookDetailView,
    CommentDetailView,
    CommentListView,
    ImageAssetView,
    ReadingProgressDetailView,
    ReadingProgressListView,
    ReviewDetailView,
    ShelfListView,
    ShelfDetailView,
    UserListView,
    ReviewListView,
    book_search,
    follow_user,
    register_user,
)

urlpatterns = [
    path("login/", CookieTokenObtainPairView.as_view(), name="token_obtain_pair"),
    # path("token/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("signup/", register_user, name="register_user"),
    path("books/", BookListView.as_view(), name="book-list-create"),
    path("books/<int:pk>/", BookDetailView.as_view(), name="book-detail"),
    path("books/search/", book_search, name="book-search"),
    path("shelves/", ShelfListView.as_view(), name="shelf-list-create"),
    path("shelves/<int:pk>/", ShelfDetailView.as_view(), name="shelf-detail"),
    path("users/", UserListView.as_view(), name="user-list"),
    path("users/follow/<str:username>/", follow_user, name="user-follow"),
    path("reading/", ReadingProgressListView.as_view(), name="reading-list-create"),
    path(
        "reading/<int:pk>/", ReadingProgressDetailView.as_view(), name="reading-detail"
    ),
    path("reviews/", ReviewListView.as_view(), name="review-list-create"),
    path("reviews/<int:pk>/", ReviewDetailView.as_view(), name="review-detail"),
    path(
        "reviews/<int:review_pk>/comments/",
        CommentListView.as_view(),
        name="comment-list-create",
    ),
    path(
        "reviews/<int:review_pk>/comments/<int:comment_pk>/",
        CommentDetailView.as_view(),
        name="comment-detail",
    ),
    path("upload/", ImageAssetView.as_view(), name="upload"),
]
