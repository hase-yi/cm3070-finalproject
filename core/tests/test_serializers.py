from django.forms import ValidationError
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIRequestFactory
from core.models import ReadingProgress, Shelf
from core.serializers import BookSerializer, ReadingProgressSerializer, ShelfSerializer
from core.models import Book


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
