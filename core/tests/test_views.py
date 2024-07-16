from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from django.contrib.auth.models import User
from core.models import Book, Shelf
from django.test import TestCase


class ShelfListViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="user", password="testpass")
        self.url = reverse(
            "shelf-list-create"
        )  # replace 'shelf-list-create' with your actual URL name
        Shelf.objects.create(
            user=self.user, title="User Shelf 1", description="A description here"
        )

        # Add another user and shelf for completeness of the test
        self.other_user = User.objects.create_user(
            username="otheruser", password="testpass"
        )
        Shelf.objects.create(
            user=self.other_user,
            title="Other User Shelf",
            description="Another description",
        )

    def test_list_shelves_authenticated(self):
        # User should see only their shelf
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            len(response.data), 1
        )  # Assuming the response.data contains the list of shelves
        self.assertEqual(response.data[0]["title"], "User Shelf 1")

    def test_list_shelves_unauthenticated(self):
        # Unauthenticated requests should not be allowed
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_shelf_authenticated(self):
        # Authenticated user creating a new shelf
        self.client.force_authenticate(user=self.user)
        data = {"title": "New Shelf", "description": "New Shelf Description"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Shelf.objects.count(), 3)  # Two initial plus one new
        self.assertEqual(
            Shelf.objects.filter(user=self.user).count(), 2
        )  # User should have two shelves now

    def test_create_shelf_unauthenticated(self):
        # Unauthenticated user should not be able to create a shelf
        data = {"title": "New Shelf", "description": "Should Fail"}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class BookListViewTest(APITestCase):
    @classmethod
    def setUpTestData(cls):
        # Users
        cls.user1 = User.objects.create_user(username="user1", password="password1")
        cls.user2 = User.objects.create_user(username="user2", password="password2")

        # Shelves
        cls.shelf1 = Shelf.objects.create(user=cls.user1, title="Fiction")
        cls.shelf2 = Shelf.objects.create(user=cls.user1, title="Non-fiction")

        # Books
        Book.objects.create(
            user=cls.user1,
            title="Book Title 1",
            author="Author A",
            isbn="1234567890123",
            shelf=cls.shelf1,
            release_year=2020,
        )
        Book.objects.create(
            user=cls.user1,
            title="Book Title 2",
            author="Author B",
            isbn="1234567890124",
            shelf=cls.shelf2,
            release_year=2021,
        )

    def setUp(self):
        self.client = APIClient()
        self.url = reverse("book-list-create")
        self.client.force_authenticate(user=self.user1)

    def test_list_books(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Expecting 2 books for user1

    def test_list_books_with_search(self):
        response = self.client.get(self.url, {"search": "Title 1"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Book Title 1")

    def test_list_books_by_shelf(self):
        response = self.client.get(self.url, {"shelf": self.shelf1.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["shelf"], self.shelf1.id)


class BookDetailViewTest(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user1 = User.objects.create_user(username="user1", password="password1")
        cls.user2 = User.objects.create_user(username="user2", password="password2")

        cls.shelf = Shelf.objects.create(user=cls.user1, title="Fiction")

        cls.book1 = Book.objects.create(
            user=cls.user1,
            title="Book Title 1",
            author="Author A",
            isbn="1234567890123",
            shelf=cls.shelf,
            release_year=2020,
        )
        cls.book2 = Book.objects.create(
            user=cls.user2,
            title="Book Title 2",
            author="Author B",
            isbn="1234567890124",
            shelf=cls.shelf,
            release_year=2021,
        )

    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(user=self.user1)
        self.detail_url = reverse("book-detail", kwargs={"pk": self.book1.id})

    def test_retrieve_book(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Book Title 1")

    def test_retrieve_book(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Book Title 1")

    def test_update_book(self):
        updated_data = {"title": "Updated Book Title"}
        response = self.client.patch(self.detail_url, updated_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.book1.refresh_from_db()
        self.assertEqual(self.book1.title, "Updated Book Title")

    def test_update_book_unauthorized_user(self):
        self.client.force_authenticate(user=self.user2)
        updated_data = {"title": "Unauthorized Update Title"}
        response = self.client.patch(
            reverse("book-detail", kwargs={"pk": self.book1.id}),
            updated_data,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_book(self):
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Book.objects.filter(pk=self.book1.id).exists())

    def test_delete_book_unauthorized_user(self):
        self.client.force_authenticate(user=self.user2)
        response = self.client.delete(
            reverse("book-detail", kwargs={"pk": self.book1.id})
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Book.objects.filter(pk=self.book1.id).exists())
