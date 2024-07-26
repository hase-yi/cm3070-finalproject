from django.db import models
from django.contrib.auth.models import User
from django.forms import ValidationError
from django.utils import timezone
from django.db.models import Q, QuerySet


class UserSettings(models.Model):
    user = models.OneToOneField(User, related_name="settings", on_delete=models.CASCADE)
    share_all_reviews = models.BooleanField(default=False)
    share_all_reading_progress = models.BooleanField(default=False)


class BaseUserAccessManager(models.Manager):
    def for_user(self, user):
        return self.filter(user=user)


class Shelf(models.Model):
    user = models.ForeignKey(User, related_name="shelves", on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    image = models.URLField(max_length=400, blank=True, null=True)

    def __str__(self):
        return self.title

    objects = BaseUserAccessManager()


class BookQuerySet(QuerySet):
    def get_books_by_shelf(self, shelf):
        return self.filter(shelf=shelf)

    def search_local(self, search_str):
        search_str = search_str.strip()

        return self.filter(
            Q(isbn__icontains=search_str)
            | Q(title__contains=search_str)
            | Q(author__contains=search_str)
            | Q(release_year__contains=search_str)
        )


class BookManager(BaseUserAccessManager):
    def get_queryset(self):
        return BookQuerySet(self.model, using=self._db)

    def get_books_by_shelf(self, shelf):
        return self.get_queryset().get_books_by_shelf(shelf)

    def search_local(self, search_str):
        return self.get_queryset().search_local(search_str)


class Book(models.Model):
    user = models.ForeignKey(User, related_name="books", on_delete=models.CASCADE)
    isbn = models.CharField(max_length=13)
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    total_pages = models.PositiveIntegerField(null=True, blank=True)
    release_year = models.PositiveBigIntegerField(blank=True, null=True)
    shelf = models.ForeignKey(
        Shelf, related_name="books", on_delete=models.SET_NULL, null=True
    )
    image = models.URLField(max_length=400, blank=True, null=True)

    def __str__(self):
        return self.title

    objects = BookManager()


class BooksUserAccessManager(models.Manager):
    def for_user(self, user):
        return self.filter(book__user=user)

    def for_user_and_followed(self, user):
        # Get the users that the given user is following
        following = Following.objects.filter(user=user).values_list(
            "followed_users", flat=True
        )

        # Get the reading progress for the user's own books
        user_books = self.for_user(user)

        # Get the reading progress for the books of the followed users, only if shared
        followed_users_books = self.filter(book__user__in=following, shared=True)

        # Combine the two querysets
        combined_query = user_books | followed_users_books

        return combined_query.distinct().select_related("book__user")


class ReadingProgress(models.Model):
    book = models.OneToOneField(
        Book, related_name="reading_progress", on_delete=models.CASCADE, null=True
    )

    STATUS_CHOICES = [
        ("W", "Want to Read"),
        ("R", "Is Reading"),
        ("F", "Finished Reading"),
        ("N", "Not to Finish"),
    ]

    status = models.CharField(max_length=1, choices=STATUS_CHOICES)
    current_page = models.PositiveIntegerField(default=0)
    shared = models.BooleanField(default=False)

    @property
    def reading_percentage(self):
        total_pages = self.book.total_pages
        if total_pages and total_pages > 0:
            return (self.current_page / total_pages) * 100
        return 0

    objects = BooksUserAccessManager()


class Review(models.Model):
    book = models.OneToOneField(
        Book, related_name="review", on_delete=models.CASCADE, null=True
    )
    text = models.TextField()
    shared = models.BooleanField(default=False)
    date = models.DateField(default=timezone.now)

    objects = BooksUserAccessManager()


class CommentUserAccessManager(models.Manager):
    def for_user(self, user):
        return self.filter(book__user=user)

    def for_user_and_followed(self, user):
        # Get the users that the given user is following
        following = Following.objects.filter(user=user).values_list(
            "followed_users", flat=True
        )

        # Get the reading progress for the user's own books
        user_books = self.for_user(user)

        # Get the reading progress for the books of the followed users, only if shared
        followed_users_books = self.filter(
            book__user__in=following, review__shared=True
        )

        # Combine the two querysets
        combined_query = user_books | followed_users_books

        return combined_query.distinct().select_related("book__user")


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    book = models.ForeignKey(Book, on_delete=models.CASCADE, null=True)
    review = models.ForeignKey(
        Review, related_name="comments", on_delete=models.CASCADE
    )
    text = models.TextField()
    date = models.DateField(default=timezone.now)

    objects = CommentUserAccessManager()


class Activity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    review = models.ForeignKey(Review, on_delete=models.CASCADE, null=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True)
    reading_progress = models.ForeignKey(
        ReadingProgress, on_delete=models.CASCADE, null=True
    )
    text = models.CharField(max_length=200)
    backlink = models.URLField()

    objects = BooksUserAccessManager()


class Following(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    followed_users = models.ManyToManyField(User, related_name="followers")


class ImageAsset(models.Model):
    file = models.FileField(upload_to="uploads/")
    book = models.ForeignKey(Book, on_delete=models.CASCADE, null=True)
    shelf = models.ForeignKey(Shelf, on_delete=models.CASCADE, null=True)

    def save(self, *args, **kwargs):
        if self.book and self.shelf:
            raise ValidationError(
                "An image can be associated with either a book or a shelf, not both."
            )
        if not self.book and not self.shelf:
            raise ValidationError(
                "An image must be associated with either a book or a shelf."
            )
        super().save(*args, **kwargs)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["book"], name="unique_book_image"),
            models.UniqueConstraint(fields=["shelf"], name="unique_shelf_image"),
        ]
