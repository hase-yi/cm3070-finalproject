from django.urls import path

from core.views import CookieTokenObtainPairView
from .views import (
    ActivityListView,
    BookListView,
    BookDetailView,
    CommentDetailView,
    CommentListView,
    ImageAssetListCreateView,
    ReadingProgressDetailView,
    ReadingProgressListView,
    ReviewDetailView,
    ShelfListView,
    ShelfDetailView,
    UserListView,
    ReviewListView,
    book_search,
    follow_user,
    get_username,
    register_user,
)

urlpatterns = [
    path("login/", CookieTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("signup/", register_user, name="register_user"),
    path("books/", BookListView.as_view(), name="book-list-create"),
    path("books/<int:pk>/", BookDetailView.as_view(), name="book-detail"),
    path("books/search/", book_search, name="book-search"),
    path("shelves/", ShelfListView.as_view(), name="shelf-list-create"),
    path("shelves/<int:pk>/", ShelfDetailView.as_view(), name="shelf-detail"),
    path("users/", UserListView.as_view(), name="user-list"),
    path("user/",get_username, name="user-name" ),
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
    path("upload/", ImageAssetListCreateView.as_view(), name="upload"),
    path('activities/', ActivityListView.as_view(), name='activity-list')
]
