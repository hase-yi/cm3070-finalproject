from django.db import models
from django.contrib.auth.models import User
from django.forms import ValidationError
from django.utils import timezone
from django.db.models import Q, QuerySet


# Stores user-specific settings, like whether to share reviews or reading progress publicly.
class UserSettings(models.Model):
    user = models.OneToOneField(User, related_name="settings", on_delete=models.CASCADE)  # Links to the User model (one-to-one relationship).
    share_all_reviews = models.BooleanField(default=False)  # Option to share all reviews publicly.
    share_all_reading_progress = models.BooleanField(default=False)  # Option to share all reading progress publicly.


# Base manager that limits access to objects owned by a specific user.
class BaseUserAccessManager(models.Manager):
    def for_user(self, user):
        return self.filter(user=user)  # Filter objects by the given user.


# Model representing a collection of books (shelf) owned by a user.
class Shelf(models.Model):
    user = models.ForeignKey(User, related_name="shelves", on_delete=models.CASCADE)  # Many shelves can belong to one user.
    title = models.CharField(max_length=200)  # Title of the shelf.
    description = models.TextField(blank=True, null=True)  # Optional description of the shelf.
    image = models.URLField(max_length=400, blank=True, null=True)  # Optional image associated with the shelf.

    def __str__(self):
        return self.title  # Returns the shelf's title as its string representation.

    objects = BaseUserAccessManager()  # Use custom manager for access control.


# Custom QuerySet for Book model with additional methods.
class BookQuerySet(QuerySet):
    def get_books_by_shelf(self, shelf):
        return self.filter(shelf=shelf)  # Filter books by their associated shelf.

    def search_local(self, search_str):
        search_str = search_str.strip()  # Clean up search string.
        return self.filter(
            Q(isbn__icontains=search_str)
            | Q(title__contains=search_str)
            | Q(author__contains=search_str)
            | Q(release_year__contains=search_str)
        )  # Search by ISBN, title, author, or release year.


# Custom manager for Book model to use the BookQuerySet methods.
class BookManager(BaseUserAccessManager):
    def get_queryset(self):
        return BookQuerySet(self.model, using=self._db)  # Return the custom queryset.

    def get_books_by_shelf(self, shelf):
        return self.get_queryset().get_books_by_shelf(shelf)  # Get books by shelf using custom queryset method.

    def search_local(self, search_str):
        return self.get_queryset().search_local(search_str)  # Search books locally using custom queryset method.


# Model representing a book owned by a user.
class Book(models.Model):
    user = models.ForeignKey(User, related_name="books", on_delete=models.CASCADE)  # Many books can belong to one user.
    isbn = models.CharField(max_length=13)  # ISBN number of the book.
    title = models.CharField(max_length=200)  # Title of the book.
    author = models.CharField(max_length=200)  # Author of the book.
    total_pages = models.PositiveIntegerField(null=True, blank=True)  # Total number of pages in the book.
    release_year = models.PositiveBigIntegerField(blank=True, null=True)  # Release year of the book.
    shelf = models.ForeignKey(Shelf, related_name="books", on_delete=models.SET_NULL, null=True)  # Book's associated shelf.
    image = models.URLField(max_length=400, blank=True, null=True)  # Optional image for the book.

    def __str__(self):
        return self.title  # Returns the book's title as its string representation.

    objects = BookManager()  # Use custom manager for access control and querying.


# Manager to access books' data, including followed users' books.
class BooksUserAccessManager(models.Manager):
    def for_user(self, user):
        return self.filter(book__user=user)  # Return books that belong to the given user.

    def for_user_and_followed(self, user):
        following = Following.objects.filter(user=user).values_list(
            "followed_users", flat=True
        )  # Get IDs of users the given user is following.

        user_books = self.for_user(user)  # Books of the user.
        followed_users_books = self.filter(book__user__in=following, shared=True)  # Books of followed users that are shared.

        return (user_books | followed_users_books).distinct().select_related("book__user")  # Return combined queryset of user's and followed users' books.


# Model representing the reading progress of a book.
class ReadingProgress(models.Model):
    book = models.OneToOneField(
        Book, related_name="reading_progress", on_delete=models.CASCADE, null=True
    )  # A book can have one reading progress entry.

    STATUS_CHOICES = [
        ("W", "Want to Read"),
        ("R", "Is Reading"),
        ("F", "Finished Reading"),
        ("N", "Not to Finish"),
    ]  # Possible statuses for the reading progress.

    status = models.CharField(max_length=1, choices=STATUS_CHOICES)  # Current reading status.
    current_page = models.PositiveIntegerField(default=0)  # Current page the user is on.
    shared = models.BooleanField(default=False)  # Whether this reading progress is shared.
    timestamp = models.DateTimeField(null=True)  # Timestamp for the reading progress.

    def save(self, *args, **kwargs):
        self.timestamp = timezone.now()  # Update the timestamp on save.
        super().save(*args, **kwargs)

    @property
    def reading_percentage(self):
        total_pages = self.book.total_pages
        if total_pages and total_pages > 0:
            return (self.current_page / total_pages) * 100  # Calculate reading progress percentage.
        return 0  # Return 0 if total pages is not available.

    objects = BooksUserAccessManager()  # Use custom manager for access control and querying.


# Model representing a review for a book.
class Review(models.Model):
    book = models.OneToOneField(
        Book, related_name="review", on_delete=models.CASCADE, null=True
    )  # A book can have one review.
    text = models.TextField()  # Review text.
    shared = models.BooleanField(default=False)  # Whether the review is shared.
    date = models.DateField(default=timezone.localdate)  # Date of the review.

    objects = BooksUserAccessManager()  # Use custom manager for access control and querying.


# Manager for comments with access to user's and followed users' reviews.
class CommentUserAccessManager(models.Manager):
    def for_user(self, user):
        return self.filter(book__user=user)  # Return comments for the user's books.

    def for_user_and_followed(self, user):
        following = Following.objects.filter(user=user).values_list(
            "followed_users", flat=True
        )  # Get followed users' IDs.

        user_books = self.for_user(user)  # Comments for user's own books.
        followed_users_books = self.filter(book__user__in=following, review__shared=True)  # Comments for followed users' shared reviews.

        return (user_books | followed_users_books).distinct().select_related("book__user")  # Return combined query for user's and followed users' comments.


# Model representing a comment on a book review.
class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)  # Comment author.
    book = models.ForeignKey(Book, on_delete=models.CASCADE, null=True)  # The book the comment relates to.
    review = models.ForeignKey(
        Review, related_name="comments", on_delete=models.CASCADE
    )  # The review the comment relates to.
    text = models.TextField()  # Comment text.
    date = models.DateField(default=timezone.localdate)  # Date of the comment.

    objects = CommentUserAccessManager()  # Use custom manager for access control and querying.


# Model representing an activity (comment, review, or reading progress).
class Activity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # User who created the activity.
    book = models.ForeignKey(Book, on_delete=models.CASCADE)  # The book related to the activity.
    review = models.ForeignKey(Review, on_delete=models.CASCADE, null=True)  # Optional review related to the activity.
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True)  # Optional comment related to the activity.
    reading_progress = models.ForeignKey(
        ReadingProgress, on_delete=models.CASCADE, null=True
    )  # Optional reading progress related to the activity.
    text = models.CharField(max_length=200)  # Activity description.
    backlink = models.URLField()  # Link to the activity.
    timestamp = models.DateTimeField(null=True)  # Timestamp for the activity.

    def save(self, *args, **kwargs):
        self.timestamp = timezone.now()  # Update the timestamp on save.
        super().save(*args, **kwargs)

    objects = BooksUserAccessManager()  # Use custom manager for access control and querying.


# Model representing the relationship where a user follows other users.
class Following(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # The user who follows others.
    followed_users = models.ManyToManyField(User, related_name="followers")  # Users being followed by the given user.


# Model for handling image assets linked to either a book or a shelf.
class ImageAsset(models.Model):
    file = models.FileField(upload_to="uploads/")  # The uploaded image file.
    book = models.ForeignKey(Book, on_delete=models.CASCADE, null=True)  # Optional book associated with the image.
    shelf = models.ForeignKey(Shelf, on_delete=models.CASCADE, null=True)  # Optional shelf associated with the image.

    def save(self, *args, **kwargs):
        if self.book and self.shelf:
            raise ValidationError(
                "An image can be associated with either a book or a shelf, not both."
            )  # Raise error if both book and shelf are set.
        if not self.book and not self.shelf:
            raise ValidationError(
                "An image must be associated with either a book or a shelf."
            )  # Raise error if neither book nor shelf is set.
        super().save(*args, **kwargs)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["book"], name="unique_book_image"),  # Ensure uniqueness of book images.
            models.UniqueConstraint(fields=["shelf"], name="unique_shelf_image"),  # Ensure uniqueness of shelf images.
        ]
