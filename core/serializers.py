from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Activity, Book, ImageAsset, Review, Shelf, ReadingProgress, Comment


# Custom field to represent related User objects by their username.
class UsernameField(serializers.RelatedField):
    def to_representation(self, value):
        return value.username  # Return the username of the related User object.


# Serializer for the User model, handles user creation and validation.
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)  # Ensure password is write-only.

    class Meta:
        model = User
        fields = ("username", "password", "email")  # Fields to include in serialization.

    def validate_email(self, value):
        # Ensure email is unique.
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

    def validate_username(self, value):
        # Ensure username is unique.
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def validate_password(self, value):
        # Ensure password is at least 8 characters long.
        if len(value) < 8:
            raise serializers.ValidationError(
                "Password must be at least 8 characters long."
            )
        return value

    def create(self, validated_data):
        # Create a new user instance using the validated data.
        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            email=validated_data.get("email"),
        )
        return user


# Simple serializer for ReadingProgress model with all fields.
class ReadingProgressSerializerPlain(serializers.ModelSerializer):
    class Meta:
        model = ReadingProgress
        fields = "__all__"  # Serialize all fields of the model.


# Simple serializer for Review model with all fields.
class ReviewSerializerPlain(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = "__all__"  # Serialize all fields of the model.

    def to_representation(self, instance):
        # Customize the representation to include comments on the review.
        representation = super().to_representation(instance)
        try:
            comments = instance.comments  # Try to get the related comments.
            representation["comments"] = CommentSerializer(comments, many=True).data
        except Comment.DoesNotExist:
            representation["comments"] = None  # If no comments, set to None.
        return representation


# Serializer for the Book model, including related fields for reading progress and review.
class BookSerializer(serializers.ModelSerializer):
    reading_percentage = serializers.ReadOnlyField()  # Read-only field for the calculated reading percentage.
    reading_progress = ReadingProgressSerializerPlain(required=False, allow_null=True)  # Nested serializer for reading progress.
    user = UsernameField(read_only=True)  # Use custom UsernameField for user field.

    class Meta:
        model = Book
        fields = "__all__"  # Serialize all fields of the model.

    def validate(self, data):
        # Set the user field to the current request user.
        request_user = self.context["request"].user
        data["user"] = request_user
        return data

    def to_representation(self, instance):
        # Customize the representation to include review and filter based on user permissions.
        representation = super().to_representation(instance)
        try:
            review = instance.review  # Try to include the related review.
            representation["review"] = ReviewSerializerPlain(review).data
        except Review.DoesNotExist:
            representation["review"] = None

        request_user = self.context["request"].user
        if representation["user"] != str(request_user):
            # Remove fields if the user doesn't have access.
            if representation["review"] and not representation["review"]["shared"]:
                representation["review"] = None
            if representation["reading_progress"] and not representation["reading_progress"]["shared"]:
                representation["reading_progress"] = None

        return representation


# Simplified serializer for Book model with limited fields.
class BookSerializerPlain(serializers.ModelSerializer):
    user = UsernameField(read_only=True)  # Use custom UsernameField for user field.

    class Meta:
        model = Book
        fields = ['id', 'title', 'user', 'author']  # Only include these fields.


# Serializer for search results, representing book objects.
class SearchResultSerializer(serializers.Serializer):
    book = BookSerializer()  # Nested BookSerializer for the book field.
    type = serializers.CharField()  # Type of the search result (e.g., local or external).

    def to_representation(self, instance):
        # Customize the representation to include the book and type.
        book_serializer = self.fields["book"]
        representation = super().to_representation(instance)
        representation["book"] = book_serializer.to_representation(instance["book"])
        representation["type"] = instance.get("type", "local")
        return representation


# Simple serializer for listing users with only the username field.
class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username"]  # Only serialize the username field.


# Serializer for Shelf model, including nested books.
class ShelfSerializer(serializers.ModelSerializer):
    user = UsernameField(read_only=True)  # Use custom UsernameField for user field.
    books = BookSerializer(many=True, read_only=True)  # Nested BookSerializer for books.

    class Meta:
        model = Shelf
        fields = "__all__"  # Serialize all fields of the model.

    def validate(self, data):
        # Set the user field to the current request user.
        request_user = self.context["request"].user
        data["user"] = request_user
        return data


# Serializer for ReadingProgress model with customized representation.
class ReadingProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReadingProgress
        fields = "__all__"  # Serialize all fields of the model.

    def to_representation(self, instance):
        # Customize the representation to include the associated book.
        reading_progress = super().to_representation(instance)
        reading_progress["book"] = BookSerializerPlain(instance.book).data
        return reading_progress


# Serializer for Review model with customized representation.
class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = "__all__"  # Serialize all fields of the model.

    def to_representation(self, instance):
        # Customize the representation to include the associated book.
        review = super().to_representation(instance)
        review["book"] = BookSerializerPlain(instance.book).data
        return review


# Serializer for Comment model, including user field.
class CommentSerializer(serializers.ModelSerializer):
    user = UsernameField(read_only=True)  # Use custom UsernameField for user field.

    class Meta:
        model = Comment
        fields = "__all__"  # Serialize all fields of the model.


# Serializer for ImageAsset model with validation to ensure proper associations.
class ImageAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageAsset
        fields = "__all__"  # Serialize all fields of the model.

    def validate(self, data):
        # Validate that the image is associated with either a book or a shelf, but not both.
        if data.get("book") and data.get("shelf"):
            raise serializers.ValidationError(
                "An image can be associated with either a book or a shelf, not both."
            )
        if not data.get("book") and not data.get("shelf"):
            raise serializers.ValidationError(
                "An image must be associated with either a book or a shelf."
            )
        return data


# Serializer for Activity model, including user and book fields.
class ActivitySerializer(serializers.ModelSerializer):
    user = UsernameField(read_only=True)  # Use custom UsernameField for user field.
    book = BookSerializerPlain()  # Nested BookSerializerPlain for the book field.

    class Meta:
        model = Activity
        fields = "__all__"  # Serialize all fields of the model.
