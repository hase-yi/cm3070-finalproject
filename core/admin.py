from django.contrib import admin
from .models import Book, Shelf, Following, ReadingProgress, Comment, Review, Activity


# Register your models here.
admin.site.register(Book)
admin.site.register(Shelf)
admin.site.register(Following)
admin.site.register(ReadingProgress)
admin.site.register(Comment)
admin.site.register(Review)
admin.site.register(Activity)
