from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Activity, Book, ImageAsset, Review, Shelf, ReadingProgress, Comment


class UsernameField(serializers.RelatedField):
    def to_representation(self, value):
        return value.username


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
            )  # pragma: no cover
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


class ReadingProgressSerializerPlain(serializers.ModelSerializer):
    class Meta:
        model = ReadingProgress
        fields = "__all__"

    def to_representation(self, instance):
        reading_progress = super().to_representation(instance)
        reading_progress["percentage"] = instance.reading_percentage
        return reading_progress


class ReviewSerializerPlain(serializers.ModelSerializer):

    class Meta:
        model = Review
        fields = "__all__"

    def to_representation(self, instance):
        # First, get the original representation from the ModelSerializer
        representation = super().to_representation(instance)

        # Add the review to the representation if it exists
        try:
            comments = instance.comments
            representation["comments"] = CommentSerializer(comments, many=True).data
        except Comment.DoesNotExist:
            representation["comments"] = None

        return representation


class BookSerializer(serializers.ModelSerializer):
    reading_percentage = serializers.ReadOnlyField()
    reading_progress = ReadingProgressSerializerPlain(required=False, allow_null=True)
    user = UsernameField(read_only=True)

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

    def to_representation(self, instance):
        # First, get the original representation from the ModelSerializer
        representation = super().to_representation(instance)

        # Add the review to the representation if it exists
        try:
            review = instance.review
            representation["review"] = ReviewSerializerPlain(review).data
        except Review.DoesNotExist:
            representation["review"] = None

        # Remove fields that are not shared if accessed by different user
        request_user = self.context["request"].user
 
        if representation["user"] != str(request_user):
            if representation["review"]:
                if not representation["review"]["shared"]:
                    representation["review"] = None
            if representation["reading_progress"]:
                if not representation["reading_progress"]["shared"]:
                    representation["reading_progress"] = None

        return representation
    

class BookSerializerPlain(serializers.ModelSerializer):
    user = UsernameField(read_only=True)

    class Meta:
        model = Book
        fields = ['id', 'title', 'user', 'author']


class SearchResultSerializer(serializers.Serializer):
    book = BookSerializer()
    type = serializers.CharField()

    def to_representation(self, instance):
        # Using self.fields to access the serializer field correctly
        book_serializer = self.fields["book"]
        representation = super().to_representation(instance)
        representation["book"] = book_serializer.to_representation(instance["book"])
        representation["type"] = instance.get("type", "local")
        return representation


class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username"]


class ShelfSerializer(serializers.ModelSerializer):
    user = UsernameField(read_only=True)
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
        reading_progress["book"] = BookSerializerPlain(instance.book).data
        return reading_progress


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = "__all__"

    def to_representation(self, instance):
        review = super().to_representation(instance)
        review["book"] = BookSerializerPlain(instance.book).data
        return review


class CommentSerializer(serializers.ModelSerializer):
    user = UsernameField(read_only=True)

    class Meta:
        model = Comment
        fields = "__all__"


class ImageAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageAsset
        fields = "__all__"

    def validate(self, data):
        if data.get("book") and data.get("shelf"):
            raise serializers.ValidationError(
                "An image can be associated with either a book or a shelf, not both."
            )
        if not data.get("book") and not data.get("shelf"):
            raise serializers.ValidationError(
                "An image must be associated with either a book or a shelf."
            )
        return data

class ActivitySerializer(serializers.ModelSerializer):
    user = UsernameField(read_only=True)
    book = BookSerializerPlain()

    class Meta:
        model = Activity
        fields = "__all__"