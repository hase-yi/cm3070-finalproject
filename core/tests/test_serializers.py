from django.forms import ValidationError
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIRequestFactory
from core.models import Comment, ReadingProgress, Review, Shelf
from core.serializers import (
    BookSerializer,
    CommentSerializer,
    ImageAssetSerializer,
    ReadingProgressSerializer,
    ReviewSerializer,
    SearchResultSerializer,
    ShelfSerializer,
    UserListSerializer,
    UserSerializer,
)
from core.models import Book
from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile


class ShelfSerializerTest(TestCase):

    def setUp(self):
        # Create users
        self.user1 = User.objects.create_user(username="user1", password="password")
        self.user2 = User.objects.create_user(username="user2", password="password")

        # Create shelves for testing
        self.shelf1 = Shelf.objects.create(
            user=self.user1, title="User1 Shelf1", description="Description1"
        )

        # Create a book and associate with the shelf and user if Book model is present
        self.book1 = Book.objects.create(
            title="Book1", author="Author1", shelf=self.shelf1, user=self.user1
        )

        # Set up request factory
        self.factory = APIRequestFactory()

    def test_validate_with_no_specified_user(self):
        request = self.factory.post("/shelves/", {}, format="json")
        request.user = self.user1

        data = {"title": "New Shelf", "description": "New Description"}

        serializer = ShelfSerializer(data=data, context={"request": request})
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data["user"], self.user1)

    def test_validate_with_specified_user(self):
        request = self.factory.post("/shelves/", {}, format="json")
        request.user = self.user1

        data = {
            "title": "New Shelf",
            "description": "New Description",
            "user": self.user1.id,
        }

        serializer = ShelfSerializer(data=data, context={"request": request})
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data["user"], self.user1)

    def test_validate_with_invalid_user(self):
        request = self.factory.post("/shelves/", {}, format="json")
        request.user = self.user1

        data = {
            "title": "New Shelf",
            "description": "New Description",
            "user": self.user2.id,
        }

        serializer = ShelfSerializer(data=data, context={"request": request})
        self.assertFalse(serializer.is_valid())
        self.assertEqual(
            serializer.errors["non_field_errors"][0],
            "You can only create objects for yourself.",
        )

    def test_serialize_shelf(self):
        request = self.factory.get("/shelves/", {}, format="json")
        serializer = ShelfSerializer(self.shelf1, context={"request": request})

        expected_data = {
            "id": self.shelf1.id,
            "user": self.user1.id,
            "title": "User1 Shelf1",
            "description": "Description1",
            "image": None,
            "books": [
                {
                    "id": self.book1.id,
                    "user": self.user1.id,
                    "isbn": "",
                    "title": "Book1",
                    "author": "Author1",
                    "total_pages": None,
                    "release_year": None,
                    "image": None,
                    "shelf": 1,
                }
            ],
        }

        self.assertEqual(serializer.data, expected_data)

    def test_deserialize_shelf(self):
        request = self.factory.post("/shelves/", {}, format="json")
        request.user = self.user1

        data = {
            "title": "User1 Shelf1",
            "description": "Description1",
            "image": None,
        }

        serializer = ShelfSerializer(data=data, context={"request": request})
        self.assertTrue(serializer.is_valid())
        shelf = serializer.save()
        self.assertEqual(shelf.user, self.user1)
        self.assertEqual(shelf.title, "User1 Shelf1")
        self.assertEqual(shelf.description, "Description1")


class BookSerializerTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user1 = User.objects.create_user(username="user1", password="password1")
        cls.user2 = User.objects.create_user(username="user2", password="password2")
        cls.shelf = Shelf.objects.create(user=cls.user1, title="Mystery Shelf")

        cls.book = Book.objects.create(
            user=cls.user1,
            title="Mystery Book",
            author="Author A",
            isbn="9781234567897",
            shelf=cls.shelf,
            release_year=2018,
        )

    def setUp(self):
        # Simulate a request context for the serializer
        self.context = {"request": type("Request", (object,), {"user": self.user1})}

    def test_serialize_book(self):
        serializer = BookSerializer(instance=self.book)
        data = serializer.data

        self.assertEqual(data["id"], self.book.id)
        self.assertEqual(data["title"], "Mystery Book")
        self.assertEqual(data["author"], "Author A")
        self.assertEqual(data["isbn"], "9781234567897")
        self.assertEqual(data["user"], self.user1.id)

    def test_deserialize_and_validate_book_data(self):
        book_data = {
            "title": "New Mystery",
            "author": "Author B",
            "isbn": "9781234567800",
            "shelf": self.shelf.id,
            "release_year": 2020,
            "user": self.user2.id,  # wrong user scenario
        }
        serializer = BookSerializer(data=book_data, context=self.context)
        if not serializer.is_valid():
            error_msg = serializer.errors.get("non_field_errors")[
                0
            ]  # Accessing the first non-field error
            self.assertEqual(
                str(error_msg), "You can only create objects for yourself."
            )
        else:
            self.fail("ValidationError expected but not raised.")

    def test_deserialize_with_no_user(self):
        book_data = {
            "title": "Self Assign Test",
            "author": "Self Author",
            "isbn": "9780000000000",
            "shelf": self.shelf.id,
            "release_year": 2021,
        }
        serializer = BookSerializer(data=book_data, context=self.context)
        self.assertTrue(serializer.is_valid())
        book = serializer.save()
        self.assertEqual(book.user, self.user1)  # Should default to context's user


class ReadingProgressSerializerTest(TestCase):
    def setUp(self):
        # Setup test data
        self.user = User.objects.create_user("user", "user@example.com", "password123")
        self.book = Book.objects.create(
            user=self.user,
            isbn="1234567890123",
            title="Test Book",
            author="Author",
            total_pages=300,
            release_year=2021,
        )
        self.reading_progress = ReadingProgress.objects.create(
            book=self.book, status="R", current_page=120, shared=True
        )

    def test_reading_progress_serialization(self):
        # Serialize the reading progress
        serializer = ReadingProgressSerializer(self.reading_progress)

        # Expected serialized data
        expected_data = {
            "id": self.reading_progress.id,
            "book": {
                "id": self.book.id,
                "isbn": "1234567890123",
                "title": "Test Book",
                "author": "Author",
                "total_pages": 300,
                "release_year": 2021,
                "user": self.user.id,
                "shelf": None,
                "image": None,
            },
            "status": "R",
            "current_page": 120,
            "shared": True,
        }

        # Check if the serialized data matches the expected data
        self.assertEqual(serializer.data, expected_data)

    def test_book_serialization_within_reading_progress(self):
        # Serialize the reading progress
        serializer = ReadingProgressSerializer(self.reading_progress)
        book_serializer = BookSerializer(self.book)

        # Compare the book part of the serialized data
        self.assertEqual(serializer.data["book"], book_serializer.data)


class UserSerializerTestCase(TestCase):
    def setUp(self):
        # Create a user to test duplicate entries
        User.objects.create_user(
            username="testuser", email="test@example.com", password="testpassword123"
        )

    def test_valid_data(self):
        """Test serializer with valid data"""
        serializer_data = {
            "username": "newuser",
            "password": "newpassword123",
            "email": "new@example.com",
        }
        serializer = UserSerializer(data=serializer_data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.username, "newuser")
        self.assertEqual(user.email, "new@example.com")
        self.assertTrue(user.check_password("newpassword123"))

    def test_invalid_data_duplicate_username(self):
        """Test serializer with a duplicate username"""
        serializer_data = {
            "username": "testuser",
            "password": "newpassword123",
            "email": "new@example.com",
        }
        serializer = UserSerializer(data=serializer_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("username", serializer.errors)
        self.assertEqual(
            str(serializer.errors["username"][0]),
            "A user with that username already exists.",
        )

    def test_invalid_data_duplicate_email(self):
        """Test serializer with a duplicate email"""
        serializer_data = {
            "username": "newuser",
            "password": "newpassword123",
            "email": "test@example.com",
        }
        serializer = UserSerializer(data=serializer_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)
        self.assertEqual(
            str(serializer.errors["email"][0]), "A user with that email already exists."
        )

    def test_invalid_password(self):
        """Test serializer with a short password"""
        serializer_data = {
            "username": "newuser",
            "password": "short",
            "email": "new@example.com",
        }
        serializer = UserSerializer(data=serializer_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("password", serializer.errors)
        self.assertEqual(
            str(serializer.errors["password"][0]),
            "Password must be at least 8 characters long.",
        )


class UserListSerializerTestCase(TestCase):
    def setUp(self):
        # Create a user to test serialization
        self.user = User.objects.create_user(
            username="testuser", password="testpassword123", email="test@example.com"
        )

    def test_serialize_username(self):
        """Test that the username field is correctly serialized"""
        user = User.objects.get(username="testuser")
        serializer = UserListSerializer(user)
        # Check that all fields specified are correctly serialized
        self.assertEqual(serializer.data, {"username": "testuser"})

    def test_does_not_serialize_other_fields(self):
        """Test that no other fields are serialized"""
        user = User.objects.get(username="testuser")
        serializer = UserListSerializer(user)
        # Check that the serializer data only contains the username field
        self.assertEqual(set(serializer.data.keys()), {"username"})


class SearchResultSerializerTestCase(TestCase):
    def setUp(self):
        # Set up user and shelf
        self.user = User.objects.create_user(
            username="testuser", password="testpassword123", email="test@example.com"
        )
        self.shelf = Shelf.objects.create(
            user=self.user, title="User1 Shelf1", description="Description1"
        )

        # Create a book instance
        self.book = Book.objects.create(
            user=self.user,
            isbn="9783161484100",
            title="Example Book",
            author="Author Name",
            total_pages=300,
            release_year=2021,
            shelf=self.shelf,
            image="http://example.com/image.jpg",
        )

    def test_serialization(self):
        """Test that the SearchResultSerializer correctly serializes data including the 'type' field"""
        book_instance = {"book": self.book, "type": "local"}
        serializer = SearchResultSerializer(instance=book_instance)
        data = serializer.data

        self.assertEqual(data["book"]["isbn"], "9783161484100")
        self.assertEqual(data["book"]["title"], "Example Book")
        self.assertEqual(data["type"], "local")

    def test_custom_type(self):
        book_instance = {"book": self.book, "type": "external"}
        serializer = SearchResultSerializer(instance=book_instance)
        data = serializer.data

        self.assertEqual(data["type"], "external")


class ReviewSerializerTestCase(TestCase):
    def setUp(self):
        # Create necessary models
        self.user = User.objects.create_user(
            username="testuser", password="testpassword123", email="test@example.com"
        )
        self.shelf = Shelf.objects.create(
            user=self.user, title="User1 Shelf1", description="Description1"
        )
        self.book = Book.objects.create(
            user=self.user,
            isbn="9783161484100",
            title="Example Book",
            author="Author Name",
            total_pages=300,
            release_year=2021,
            shelf=self.shelf,
            image="http://example.com/image.jpg",
        )
        self.review = Review.objects.create(
            book=self.book, text="Great read!", shared=True, date=timezone.now().date()
        )

    def test_review_serialization(self):
        """Test the serialization of the Review model, including nested Book serialization"""
        serializer = ReviewSerializer(self.review)
        data = serializer.data

        self.assertEqual(data["text"], "Great read!")
        self.assertTrue(data["shared"])
        self.assertIsNotNone(data["date"])
        self.assertIsNotNone(data["book"])
        self.assertEqual(data["book"]["title"], "Example Book")
        self.assertEqual(data["book"]["isbn"], "9783161484100")

    def test_review_fields(self):
        """Test that all expected fields are present in the serialized output"""
        serializer = ReviewSerializer(self.review)
        data = serializer.data
        expected_fields = {"id", "book", "text", "shared", "date"}
        self.assertTrue(set(data.keys()).issuperset(expected_fields))


class CommentSerializerTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpassword123", email="test@example.com"
        )
        self.shelf = Shelf.objects.create(
            user=self.user, title="User1 Shelf1", description="Description1"
        )
        self.book = Book.objects.create(
            user=self.user,
            isbn="9783161484100",
            title="Example Book",
            author="Author Name",
            total_pages=300,
            release_year=2021,
            shelf=self.shelf,
            image="http://example.com/image.jpg",
        )
        self.review = Review.objects.create(
            book=self.book, text="Great read!", shared=True, date=timezone.now().date()
        )
        self.comment = Comment.objects.create(
            user=self.user,
            review=self.review,
            text="Insightful commentary.",
            date=timezone.now().date(),
        )

    def test_comment_serialization(self):
        """Test the serialization of the Comment model"""
        serializer = CommentSerializer(self.comment)
        data = serializer.data

        self.assertEqual(data["text"], "Insightful commentary.")
        self.assertIsNotNone(data["date"])
        self.assertEqual(data["user"], self.user.id)
        self.assertEqual(data["review"], self.review.id)

    def test_comment_fields(self):
        """Test that all expected fields are present in the serialized output"""
        serializer = CommentSerializer(self.comment)
        data = serializer.data
        expected_fields = {"id", "user", "review", "text", "date"}
        self.assertTrue(set(data.keys()).issuperset(expected_fields))


class ImageAssetSerializerTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpassword123"
        )
        self.shelf = Shelf.objects.create(
            user=self.user, title="User1 Shelf1", description="Description1"
        )
        self.book = Book.objects.create(
            user=self.user,
            isbn="1234567890123",
            title="Example Book",
            author="Author Name",
            total_pages=100,
            release_year=2021,
            shelf=self.shelf,
            image="http://example.com/image.jpg",
        )

    def test_serializer_with_both_book_and_shelf(self):
        """Image cannot be associated with both a book and a shelf"""
        image_file = SimpleUploadedFile(
            "image.jpg", b"file_content", content_type="image/jpeg"
        )
        image_data = {"file": image_file, "book": self.book.id, "shelf": self.shelf.id}
        serializer = ImageAssetSerializer(data=image_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)
        self.assertEqual(
            serializer.errors["non_field_errors"][0],
            "An image can be associated with either a book or a shelf, not both.",
        )

    def test_serializer_without_book_and_shelf(self):
        """Image must be associated with either a book or a shelf"""
        image_file = SimpleUploadedFile(
            "image.jpg", b"file_content", content_type="image/jpeg"
        )
        image_data = {
            "file": image_file,
        }
        serializer = ImageAssetSerializer(data=image_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)
        self.assertEqual(
            serializer.errors["non_field_errors"][0],
            "An image must be associated with either a book or a shelf.",
        )

    def test_serializer_with_valid_data(self):
        """Test serializer with valid data: associated with only a book"""
        image_file = SimpleUploadedFile(
            "image.jpg", b"file_content", content_type="image/jpeg"
        )
        image_data = {"file": image_file, "book": self.book.id}
        serializer = ImageAssetSerializer(data=image_data)
        self.assertTrue(serializer.is_valid())
        image = serializer.save()
        self.assertEqual(image.book, self.book)
        self.assertIsNone(image.shelf)
