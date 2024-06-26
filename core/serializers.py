from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Book, Shelf, ReadingProgress, Comment

# Auth
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email')
        )
        return user

# Function
class BookSerializer(serializers.ModelSerializer):
    reading_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Book
        fields = '__all__'

    def validate(self, data):
        if 'title' not in data or not data['title']:
            raise serializers.ValidationError("Title is required")
        if 'author' not in data or not data['author']:
            raise serializers.ValidationError("Author is required")
        if 'shelf' not in data or not data['shelf']:
            raise serializers.ValidationError("Shelf is required")
        return data

class ShelfSerializer(serializers.ModelSerializer):
    books = BookSerializer(many=True, read_only=True)

    class Meta:
        model = Shelf
        fields = '__all__'

class ReadingProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReadingProgress
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'
