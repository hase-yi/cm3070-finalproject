from django.db import models
from django.contrib.auth.models import User


class AppUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.user.username


class Shelf(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    image = models.URLField(max_length=200, blank=True, null=True)

    def __str__(self):
        return self.title

from django.db import models


class Book(models.Model):
    STATUS_CHOICES = [
        ("want_to_read", "Want to Read"),
        ("is_reading", "Is Reading"),
        ("finished_reading", "Finished Reading"),
        ("not_to_finish", "Not to Finish"),
    ]

    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    total_pages = models.PositiveIntegerField(
        null=True, blank=True
    )  # Allow null and blank for total_pages
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    shelf = models.ForeignKey("Shelf", related_name="books", on_delete=models.CASCADE)
    current_page = models.PositiveIntegerField(default=0)
    cover_id = models.CharField(
        max_length=20, null=True, blank=True
    )  # New field for storing cover ID
    open_library_id = models.CharField(
        max_length=20, null=True, blank=True
    )  # New field for storing OpenLibrary ID

    def __str__(self):
        return self.title

    @property
    def reading_percentage(self):
        if self.total_pages > 0:
            return (self.current_page / self.total_pages) * 100
        return 0


class ReadingProgress(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    current_page = models.PositiveIntegerField()


class Comment(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    text = models.TextField()
    parent_comment = models.ForeignKey(
        "self", null=True, blank=True, related_name="replies", on_delete=models.CASCADE
    )
