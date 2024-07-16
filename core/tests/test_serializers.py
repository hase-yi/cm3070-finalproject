from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIRequestFactory
from core.models import Shelf
from core.serializers import ShelfSerializer
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
