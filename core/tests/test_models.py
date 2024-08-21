from django.forms import ValidationError
from django.test import TestCase
from django.contrib.auth.models import User
from core.models import Activity, Book, Comment, Following, ImageAsset, ReadingProgress, Review, Shelf
from django.utils import timezone


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


class ActivityModelTest(TestCase):
    
    def setUp(self):
        self.user1 = User.objects.create_user(
            "user1", "user1@example.com", "user1password"
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

        self.review = Review.objects.create(book=self.book1, text="Great book!")
        self.comment = Comment.objects.create(user=self.user1, text="Nice review!", review=self.review)
        self.reading_progress = ReadingProgress.objects.create( book=self.book1, current_page=50)

    def test_activity_creation(self):
        # Test creating an Activity instance
        activity = Activity.objects.create(
            user=self.user1,
            book=self.book1,
            review=self.review,
            comment=self.comment,
            reading_progress=self.reading_progress,
            text='This is a test activity.',
            backlink='http://example.com'
        )
        
        self.assertIsNotNone(activity.id)  # Check if the activity object was saved and has an ID
        self.assertEqual(activity.text, 'This is a test activity.')
        self.assertEqual(activity.backlink, 'http://example.com')
        self.assertIsNotNone(activity.timestamp)  # Ensure timestamp is set
        self.assertAlmostEqual(activity.timestamp, timezone.now(), delta=timezone.timedelta(seconds=1))

    def test_activity_update_timestamp(self):
        # Test that saving the Activity updates the timestamp
        activity = Activity.objects.create(
            user=self.user1,
            book=self.book1,
            review=self.review,
            comment=self.comment,
            reading_progress=self.reading_progress,
            text='This is a test activity.',
            backlink='http://example.com'
        )
        
        initial_timestamp = activity.timestamp
        
        # Update the activity text and save
        activity.text = "Updated activity text."
        activity.save()
        
        # Ensure timestamp is updated on save
        self.assertNotEqual(activity.timestamp, initial_timestamp)
        self.assertAlmostEqual(activity.timestamp, timezone.now(), delta=timezone.timedelta(seconds=1))


class CommentUserAccessManagerTest(TestCase):
    
    def setUp(self):
        # Create users
        self.user1 = User.objects.create_user(username='user1', password='12345')
        self.user2 = User.objects.create_user(username='user2', password='12345')
        self.user3 = User.objects.create_user(username='user3', password='12345')

        # Create books
        self.book1 = Book.objects.create(title='Book 1', author='Author 1', user=self.user1)
        self.book2 = Book.objects.create(title='Book 2', author='Author 2', user=self.user2)
        self.book3 = Book.objects.create(title='Book 3', author='Author 3', user=self.user3)

        # Create reviews
        self.review1 = Review.objects.create(book=self.book1,  text='Review 1', shared=True)
        self.review2 = Review.objects.create(book=self.book2,  text='Review 2', shared=False)
        self.review3 = Review.objects.create(book=self.book3,  text='Review 3', shared=True)

        # Create comments
        self.comment1 = Comment.objects.create(user=self.user1, book=self.book1, review=self.review1, text='Comment 1')
        self.comment2 = Comment.objects.create(user=self.user2, book=self.book2, review=self.review2, text='Comment 2')
        self.comment3 = Comment.objects.create(user=self.user3, book=self.book3, review=self.review3, text='Comment 3')

        # Create a following relationship
        following = Following.objects.create(user=self.user1)
        following.followed_users.add(self.user3)  # Correct way to add to many-to-many relationship

    def test_for_user(self):
        # Test that only the comments for user1's books are returned
        user1_comments = Comment.objects.for_user(self.user1)
        self.assertIn(self.comment1, user1_comments)
        self.assertNotIn(self.comment2, user1_comments)
        self.assertNotIn(self.comment3, user1_comments)

    def test_for_user_and_followed(self):
        # Test that the comments for user1's books and the books of followed users with shared reviews are returned
        comments = Comment.objects.for_user_and_followed(self.user1)
        self.assertIn(self.comment1, comments)  # user1's own comment
        self.assertNotIn(self.comment2, comments)  # user2's comment (not followed by user1)
        self.assertIn(self.comment3, comments)  # user3's comment (followed by user1 and shared review)