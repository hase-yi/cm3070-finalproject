from django.test import TestCase
from django.contrib.auth.models import User
from core.models import Book, Shelf
from django.db.models import QuerySet


class BaseUserAccessManagerTest(TestCase):

    def setUp(self):
        # Create two users
        self.user1 = User.objects.create_user(username="user1", password="password")
        self.user2 = User.objects.create_user(username="user2", password="password")

        # Create shelves for both users
        self.shelf1 = Shelf.objects.create(
            user=self.user1, title="User1 Shelf1", description="Description1"
        )
        self.shelf2 = Shelf.objects.create(
            user=self.user1, title="User1 Shelf2", description="Description2"
        )
        self.shelf3 = Shelf.objects.create(
            user=self.user2, title="User2 Shelf1", description="Description3"
        )

    def test_for_user_method(self):
        # Test that the for_user method returns the correct shelves for user1
        user1_shelves = Shelf.objects.for_user(self.user1)
        self.assertIn(self.shelf1, user1_shelves)
        self.assertIn(self.shelf2, user1_shelves)
        self.assertNotIn(self.shelf3, user1_shelves)

        # Test that the for_user method returns the correct shelves for user2
        user2_shelves = Shelf.objects.for_user(self.user2)
        self.assertNotIn(self.shelf1, user2_shelves)
        self.assertNotIn(self.shelf2, user2_shelves)
        self.assertIn(self.shelf3, user2_shelves)


class BookModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Users
        cls.user1 = User.objects.create_user(username="user1", password="password1")
        cls.user2 = User.objects.create_user(username="user2", password="password2")

        # Shelves associated with users
        cls.shelf1 = Shelf.objects.create(user=cls.user1, title="Fiction Shelf")
        cls.shelf2 = Shelf.objects.create(user=cls.user2, title="Non-Fiction Shelf")

        # Books associated with specific shelves and users
        Book.objects.create(
            user=cls.user1,
            isbn="1234567890123",
            title="Book Title 1",
            author="Author A",
            total_pages=300,
            release_year=2020,
            shelf=cls.shelf1,
        )
        Book.objects.create(
            user=cls.user2,
            isbn="1234567890124",
            title="Book Title 2",
            author="Author B",
            total_pages=250,
            release_year=2021,
            shelf=cls.shelf2,
        )

    def test_get_books_by_shelf(self):
        books_on_shelf1 = Book.objects.get_books_by_shelf(self.shelf1)
        self.assertEqual(books_on_shelf1.count(), 1)
        self.assertEqual(books_on_shelf1.first().title, "Book Title 1")

        books_on_shelf2 = Book.objects.get_books_by_shelf(self.shelf2)
        self.assertEqual(books_on_shelf2.count(), 1)
        self.assertEqual(books_on_shelf2.first().title, "Book Title 2")

    def test_search_local(self):
        # Test search by ISBN
        books_by_isbn = Book.objects.search_local("1234567890123")
        self.assertEqual(books_by_isbn.count(), 1)
        self.assertEqual(books_by_isbn.first().user.username, "user1")

        # Test search by author
        books_by_author = Book.objects.search_local("Author B")
        self.assertEqual(books_by_author.count(), 1)
        self.assertEqual(books_by_author.first().user.username, "user2")

        # Test searching across different attributes
        books_by_title = Book.objects.search_local("Title")
        self.assertEqual(
            books_by_title.count(), 2
        )  # Assuming both titles include the word "Title"
