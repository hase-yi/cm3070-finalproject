from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Book, Review, Shelf, ReadingProgress, Comment


# Auth
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("username", "password", "email")

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "A user with that username already exists."
            )
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError(
                "Password must be at least 8 characters long."
            )
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            email=validated_data.get("email"),
        )
        return user


# Function
class BookSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), required=False
    )

    reading_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Book
        fields = "__all__"

    def validate(self, data):
        # Ensure the request is available in the serializer context
        request_user = self.context["request"].user
        specified_user = data.get("user")

        if specified_user is None:
            data["user"] = request_user
        elif request_user != specified_user:
            raise serializers.ValidationError(
                "You can only create objects for yourself."
            )

        return data


class SearchResultSerializer(BookSerializer):
    book = BookSerializer()
    type = serializers.CharField()

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["type"] = instance.get("type", "local")
        return representation


class UserListSerializer(BookSerializer):
    class Meta:
        model = User
        fields = ["username"]


class ShelfSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), required=False
    )
    books = BookSerializer(many=True, read_only=True)

    class Meta:
        model = Shelf
        fields = "__all__"

    def validate(self, data):
        # Ensure the request is available in the serializer context
        request_user = self.context["request"].user
        specified_user = data.get("user")

        if specified_user is None:
            data["user"] = request_user
        elif request_user != specified_user:
            raise serializers.ValidationError(
                "You can only create objects for yourself."
            )

        return data


class ReadingProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReadingProgress
        fields = "__all__"

    def to_representation(self, instance):
        reading_progress = super().to_representation(instance)
        reading_progress["book"] = BookSerializer(instance.book).data
        return reading_progress


class ReviewSerializer(serializers.ModelSerializer):

    class Meta:
        model = Review
        fields = "__all__"

    def to_representation(self, instance):
        review = super().to_representation(instance)
        review["book"] = BookSerializer(instance.book).data
        return review


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = "__all__"

    def to_representation(self, instance):
        comment = super().to_representation(instance)
        comment["book"] = BookSerializer(instance.book).data
        return comment
