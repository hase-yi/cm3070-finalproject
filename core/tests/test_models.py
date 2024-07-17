from django.forms import ValidationError
from django.test import TestCase
from django.contrib.auth.models import User
from core.models import Book, Following, ImageAsset, ReadingProgress, Shelf
from django.db.models import QuerySet


class BaseUserAccessManagerAndShelfModelTest(TestCase):

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


class ReadingProgressModelTest(TestCase):
    def setUp(self):
        # Setup test data
        self.user1 = User.objects.create_user(
            "user1", "user1@example.com", "user1password"
        )
        self.user2 = User.objects.create_user(
            "user2", "user2@example.com", "user2password"
        )
        self.shelf1 = Shelf.objects.create(
            user=self.user1, title="User1 Shelf1", description="Description1"
        )

        self.book1 = Book.objects.create(
            user=self.user1,
            isbn="1234567890123",
            title="Test Book 1",
            author="Author 1",
            total_pages=300,
            release_year=2020,
            shelf=self.shelf1,
        )

        self.book2 = Book.objects.create(
            user=self.user2,
            isbn="1234567890124",
            title="Test Book 2",
            author="Author 2",
            total_pages=150,
            release_year=2021,
            shelf=self.shelf1,
        )

        self.book3 = Book.objects.create(
            user=self.user2,
            isbn="1234567890124",
            title="Test Book 2",
            author="Author 2",
            total_pages=0,
            release_year=2021,
            shelf=self.shelf1,
        )

        self.reading_progress1 = ReadingProgress.objects.create(
            book=self.book1, status="R", current_page=150, shared=True
        )

        self.reading_progress2 = ReadingProgress.objects.create(
            book=self.book2, status="F", current_page=150, shared=False
        )

        self.reading_progress3 = ReadingProgress.objects.create(
            book=self.book3, status="F", current_page=150, shared=False
        )

        # Setting up following relationship
        following = Following.objects.create(user=self.user1)
        following.followed_users.add(self.user2)

    def test_reading_percentage(self):
        # Test reading percentage calculation
        percentage = self.reading_progress1.reading_percentage
        self.assertEqual(percentage, 50.0)

        percentage = self.reading_progress3.reading_percentage
        self.assertEqual(percentage, 0)

    def test_for_user(self):
        # Test that only books for user1 are returned
        user_books = ReadingProgress.objects.for_user(self.user1)
        self.assertTrue(self.reading_progress1 in user_books)

    def test_for_user_and_followed(self):
        # Ensure shared is True for this test
        self.reading_progress2.shared = True
        self.reading_progress2.save()

        # Test that books for both the user and followed users are returned
        accessible_books = ReadingProgress.objects.for_user_and_followed(self.user1)
        self.assertIn(self.reading_progress1, accessible_books)
        self.assertIn(self.reading_progress2, accessible_books)


class ImageAssetModelTest(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            "user1", "user1@example.com", "user1password"
        )

        self.book = Book.objects.create(
            user=self.user1,
            title="Sample Book",
            author="Author",
            isbn="1234567890123",
            total_pages=100,
        )

        self.shelf = Shelf.objects.create(
            user=self.user1, title="User1 Shelf1", description="Description1"
        )

    def test_image_with_both_book_and_shelf(self):
        # Test that an error is raised if an image is associated with both a book and a shelf
        with self.assertRaises(ValidationError):
            ImageAsset.objects.create(
                file="path/to/image.jpg",
                book=self.book,
                shelf=self.shelf,
            )

    def test_image_with_neither_book_nor_shelf(self):
        # Test that an error is raised if an image is not associated with either a book or a shelf
        with self.assertRaises(ValidationError):
            ImageAsset.objects.create(file="path/to/image.jpg")

    def test_image_with_just_book(self):
        # Test that an image can be saved with just a book and no shelf
        image = ImageAsset.objects.create(file="path/to/book_image.jpg", book=self.book)
        self.assertEqual(image.book, self.book)
        self.assertIsNone(image.shelf)
