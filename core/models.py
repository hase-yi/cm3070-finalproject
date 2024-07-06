from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


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


class BookManager(BaseUserAccessManager):
    def get_books_by_shelf(self, shelf, user):
        return self.for_user(user).filter(shelf=shelf)


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
        if total_pages > 0:
            return (self.current_page / total_pages) * 100
        return 0


class Review(models.Model):
    book = models.OneToOneField(
        Book, related_name="review", on_delete=models.CASCADE, null=True
    )
    text = models.TextField()
    shared = models.BooleanField(default=False)
    date = models.DateField(default=timezone.now)


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    review = models.ForeignKey(
        Review, related_name="comments", on_delete=models.CASCADE
    )
    text = models.TextField()
    date = models.DateField(default=timezone.now)


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


class Following(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    followed_users = models.ManyToManyField(User, related_name="followers")
