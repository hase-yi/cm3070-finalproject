import json
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from django.contrib.auth.models import User
from core.models import (
    Book,
    Comment,
    Following,
    ImageAsset,
    ReadingProgress,
    Review,
    Shelf,
)
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
import requests_mock


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


class ShelfDetailViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.shelf = Shelf.objects.create(
            user=self.user, title="Test Shelf", description="A shelf for testing"
        )
        self.url = reverse("shelf-detail", args=[self.shelf.id])
        self.client.force_authenticate(user=self.user)

    def test_retrieve_shelf(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Test Shelf")

    def test_update_shelf(self):
        data = {"title": "Updated Shelf", "description": "Updated description"}
        response = self.client.put(
            self.url, data=json.dumps(data), content_type="application/json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.shelf.refresh_from_db()
        self.assertEqual(self.shelf.title, "Updated Shelf")
        self.assertEqual(self.shelf.description, "Updated description")

    def test_destroy_shelf(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        with self.assertRaises(Shelf.DoesNotExist):
            self.shelf.refresh_from_db()

    def test_permission_denied_for_unauthenticated_user(self):
        self.client.logout()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        data = {"title": "New Title"}
        response = self.client.put(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response = self.client.delete(self.url)
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


class BookSearchViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.client.force_authenticate(user=self.user)
        self.url = reverse("book-search")

        self.shelf = Shelf.objects.create(user=self.user, title="Test Shelf")
        self.book = Book.objects.create(
            user=self.user,
            title="Test Book",
            author="Test Author",
            isbn="1234567890123",
            shelf=self.shelf,
        )

    def test_search_without_params(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_search_with_title(self):
        with requests_mock.Mocker() as m:
            m.get(
                "http://openlibrary.org/search.json",
                json={
                    "docs": [
                        {
                            "title": "External Book",
                            "author_name": ["External Author"],
                            "isbn": ["9876543210987"],
                            "number_of_pages_median": 300,
                            "first_publish_year": 2020,
                            "cover_i": 12345,
                        }
                    ]
                },
            )

            response = self.client.get(self.url, {"title": "Test"})
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(len(response.data), 2)  # One local and one external result
            self.assertEqual(response.data[0]["type"], "local")
            self.assertEqual(response.data[1]["type"], "external")

    def test_search_with_isbn(self):
        with requests_mock.Mocker() as m:
            m.get(
                "http://openlibrary.org/search.json",
                json={"docs": []},
            )

            response = self.client.get(self.url, {"isbn": "1234567890123"})
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(len(response.data), 1)  # Only the local result
            self.assertEqual(response.data[0]["type"], "local")

    def test_search_with_title_and_isbn(self):
        with requests_mock.Mocker() as m:
            m.get(
                "http://openlibrary.org/search.json",
                json={
                    "docs": [
                        {
                            "title": "External Book",
                            "author_name": ["External Author"],
                            "isbn": ["9876543210987"],
                            "number_of_pages_median": 300,
                            "first_publish_year": 2020,
                            "cover_i": 12345,
                        }
                    ]
                },
            )

            response = self.client.get(
                self.url, {"title": "Test", "isbn": "1234567890123"}
            )
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(len(response.data), 2)  # One local and one external result
            self.assertEqual(response.data[0]["type"], "local")
            self.assertEqual(response.data[1]["type"], "external")

    def test_permission_denied_for_unauthenticated_user(self):
        self.client.logout()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class FollowUserViewTests(APITestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(username="user1", password="testpass1")
        self.user2 = User.objects.create_user(username="user2", password="testpass2")
        self.user3 = User.objects.create_user(username="user3", password="testpass3")
        self.client.force_authenticate(user=self.user1)
        self.url_follow_user2 = reverse("user-follow", args=[self.user2.username])
        self.url_follow_user3 = reverse("user-follow", args=[self.user3.username])

    def test_unfollow_user_if_not_following(self):
        response = self.client.delete(self.url_follow_user2)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"message": "User unfollowed successfully"})

    def test_follow_user(self):
        response = self.client.post(self.url_follow_user2)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"message": "User followed successfully"})
        following = Following.objects.get(user=self.user1)
        self.assertIn(self.user2, following.followed_users.all())

    def test_unfollow_user(self):
        Following.objects.create(user=self.user1).followed_users.add(self.user2)
        response = self.client.delete(self.url_follow_user2)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"message": "User unfollowed successfully"})
        following = Following.objects.get(user=self.user1)
        self.assertNotIn(self.user2, following.followed_users.all())

    def test_follow_non_existent_user(self):
        response = self.client.post(reverse("user-follow", args=["nonexistent"]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data, {"error": "User not found"})

    def test_unfollow_non_existent_user(self):
        response = self.client.delete(reverse("user-follow", args=["nonexistent"]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data, {"error": "User not found"})

    def test_follow_self(self):
        response = self.client.post(reverse("user-follow", args=[self.user1.username]))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {"error": "Both users are identical"})

    def test_permission_denied_for_unauthenticated_user(self):
        self.client.logout()
        response = self.client.post(self.url_follow_user2)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.delete(self.url_follow_user2)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ReadingProgressListViewTests(APITestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(username="user1", password="testpass1")
        self.user2 = User.objects.create_user(username="user2", password="testpass2")
        self.book1 = Book.objects.create(
            user=self.user1,
            title="Test Book 1",
            author="Test Author",
            isbn="1234567890123",
            total_pages=100,
        )
        self.book2 = Book.objects.create(
            user=self.user2,
            title="Test Book 2",
            author="Test Author",
            isbn="9876543210987",
            total_pages=200,
        )
        self.reading_progress1 = ReadingProgress.objects.create(
            book=self.book1, status="R", current_page=50
        )
        self.client.force_authenticate(user=self.user1)
        self.url = reverse("reading-list-create")

    def test_list_reading_progress(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # user1 can see their own progress
        self.assertEqual(response.data[0]["book"]["id"], self.book1.id)

    def test_create_reading_progress(self):
        data = {
            "book": self.book2.id,
            "status": "F",
            "current_page": 100,
            "shared": True,
        }
        response = self.client.post(
            self.url, data=json.dumps(data), content_type="application/json"
        )
        if response.status_code != status.HTTP_201_CREATED:
            print(f"Response Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ReadingProgress.objects.count(), 2)
        new_progress = ReadingProgress.objects.get(book=self.book2, status="F")
        self.assertEqual(new_progress.current_page, 100)

    def test_filter_reading_progress_by_status(self):
        response = self.client.get(self.url, {"status": "W"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)  # user1 has no 'Want to Read' progress

    def test_permission_denied_for_unauthenticated_user(self):
        self.client.logout()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ReadingProgressDetailViewTests(APITestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(username="user1", password="testpass1")
        self.user2 = User.objects.create_user(username="user2", password="testpass2")
        self.book1 = Book.objects.create(
            user=self.user1,
            title="Test Book 1",
            author="Test Author",
            isbn="1234567890123",
            total_pages=100,
        )
        self.reading_progress1 = ReadingProgress.objects.create(
            book=self.book1, status="R", current_page=50
        )
        self.client.force_authenticate(user=self.user1)
        self.url = reverse("reading-detail", args=[self.reading_progress1.id])

    def test_retrieve_reading_progress(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["book"]["id"], self.book1.id)
        self.assertEqual(response.data["status"], "R")
        self.assertEqual(response.data["current_page"], 50)

    def test_update_reading_progress(self):
        data = {"status": "F", "current_page": 100, "shared": True}
        response = self.client.put(
            self.url, data=json.dumps(data), content_type="application/json"
        )
        if response.status_code != status.HTTP_200_OK:
            print(f"Response Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.reading_progress1.refresh_from_db()
        self.assertEqual(self.reading_progress1.status, "F")
        self.assertEqual(self.reading_progress1.current_page, 100)

    def test_delete_reading_progress(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        with self.assertRaises(ReadingProgress.DoesNotExist):
            self.reading_progress1.refresh_from_db()

    def test_permission_denied_for_unauthenticated_user(self):
        self.client.logout()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.put(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ReviewListViewTests(APITestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(username="user1", password="testpass1")
        self.user2 = User.objects.create_user(username="user2", password="testpass2")
        self.book1 = Book.objects.create(
            user=self.user1,
            title="Test Book 1",
            author="Test Author",
            isbn="1234567890123",
            total_pages=100,
        )
        self.book2 = Book.objects.create(
            user=self.user1,
            title="Test Book 2",
            author="Test Author",
            isbn="1234567890123",
            total_pages=100,
        )
        self.review1 = Review.objects.create(
            book=self.book1,
            text="This is a test review.",
            shared=True,
            date="2024-01-01",
        )

        self.client.force_authenticate(user=self.user1)
        self.url = reverse("review-list-create")

    def test_list_reviews(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["book"]["id"], self.book1.id)
        self.assertEqual(response.data[0]["text"], "This is a test review.")

    def test_create_review(self):
        data = {
            "book": self.book2.id,
            "text": "A new review for the test book.",
            "shared": True,
            "date": "2024-01-02",
        }
        response = self.client.post(
            self.url, data=json.dumps(data), content_type="application/json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Review.objects.count(), 2)
        new_review = Review.objects.get(
            book=self.book2, text="A new review for the test book."
        )
        self.assertEqual(new_review.shared, True)

    def test_permission_denied_for_unauthenticated_user(self):
        self.client.logout()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ReviewDetailViewTests(APITestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(username="user1", password="testpass1")
        self.user2 = User.objects.create_user(username="user2", password="testpass2")
        self.book1 = Book.objects.create(
            user=self.user1,
            title="Test Book 1",
            author="Test Author",
            isbn="1234567890123",
            total_pages=100,
        )
        self.review1 = Review.objects.create(
            book=self.book1,
            text="This is a test review.",
            shared=True,
            date="2024-01-01",
        )
        self.client.force_authenticate(user=self.user1)
        self.url = reverse("review-detail", args=[self.review1.id])

    def test_retrieve_review(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["book"]["id"], self.book1.id)
        self.assertEqual(response.data["text"], "This is a test review.")

    def test_update_review(self):
        data = {
            "text": "An updated review text.",
            "shared": False,
            "date": "2024-01-02",
        }
        response = self.client.put(
            self.url, data=json.dumps(data), content_type="application/json"
        )
        if response.status_code != status.HTTP_200_OK:
            print(f"Response Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.review1.refresh_from_db()
        self.assertEqual(self.review1.text, "An updated review text.")
        self.assertEqual(self.review1.shared, False)

    def test_delete_review(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        with self.assertRaises(Review.DoesNotExist):
            self.review1.refresh_from_db()

    def test_permission_denied_for_unauthenticated_user(self):
        self.client.logout()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.put(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class CommentListViewTests(APITestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(username="user1", password="testpass1")
        self.user2 = User.objects.create_user(username="user2", password="testpass2")
        self.book1 = Book.objects.create(
            user=self.user1,
            title="Test Book 1",
            author="Test Author",
            isbn="1234567890123",
            total_pages=100,
        )
        self.review1 = Review.objects.create(
            book=self.book1,
            text="This is a test review.",
            shared=True,
            date="2024-01-01",
        )
        self.comment1 = Comment.objects.create(
            review=self.review1,
            text="This is a test comment.",
            book=self.book1,
            user=self.user1,
            date="2024-01-01",
        )
        self.client.force_authenticate(user=self.user1)
        self.url = reverse("comment-list-create", kwargs={"review_pk": self.review1.id})

    def test_list_comments(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # user1 can see their own comment
        self.assertEqual(response.data[0]["review"], self.review1.id)
        self.assertEqual(response.data[0]["text"], "This is a test comment.")

    def test_create_comment(self):
        data = {
            "text": "A new comment for the test review.",
            "review": self.review1.id,
            "book": self.book1.id,
            "date": "2024-01-01",
        }
        response = self.client.post(
            self.url, data=json.dumps(data), content_type="application/json"
        )
        if response.status_code != status.HTTP_201_CREATED:
            print(f"Response Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Comment.objects.count(), 2)
        new_comment = Comment.objects.get(text="A new comment for the test review.")
        self.assertEqual(new_comment.review, self.review1)

    def test_permission_denied_for_unauthenticated_user(self):
        self.client.logout()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class CommentDetailViewTests(APITestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(username="user1", password="testpass1")
        self.user2 = User.objects.create_user(username="user2", password="testpass2")
        self.book1 = Book.objects.create(
            user=self.user1,
            title="Test Book 1",
            author="Test Author",
            isbn="1234567890123",
            total_pages=100,
        )
        self.review1 = Review.objects.create(
            book=self.book1,
            text="This is a test review.",
            shared=True,
            date="2024-01-01",
        )
        self.comment1 = Comment.objects.create(
            review=self.review1,
            text="This is a test comment.",
            user=self.user1,
            date="2024-01-01",
        )
        self.client.force_authenticate(user=self.user1)
        self.url = reverse(
            "comment-detail",
            kwargs={"review_pk": self.review1.id, "comment_pk": self.comment1.id},
        )

    def test_retrieve_comment(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["review"], self.review1.id)
        self.assertEqual(response.data["text"], "This is a test comment.")

    def test_update_comment(self):
        data = {
            "text": "An updated comment text.",
            "review": self.review1.id,
        }
        response = self.client.put(
            self.url, data=json.dumps(data), content_type="application/json"
        )
        if response.status_code != status.HTTP_200_OK:
            print(f"Response Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.comment1.refresh_from_db()
        self.assertEqual(self.comment1.text, "An updated comment text.")

    def test_delete_comment(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        with self.assertRaises(Comment.DoesNotExist):
            self.comment1.refresh_from_db()

    def test_permission_denied_for_unauthenticated_user(self):
        self.client.logout()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.put(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ImageAssetViewTests(APITestCase):
    def setUp(self):
        # Create user
        self.user = User.objects.create_user(username="user", password="password")
        # Create instances of Shelf and Book
        self.shelf = Shelf.objects.create(
            user=self.user,
            title="Fantasy Shelf",
            description="A collection of fantasy books",
        )
        self.book = Book.objects.create(
            user=self.user,
            isbn="1234567890123",
            title="Fantasy Book",
            author="Author Name",
        )

        self.client.force_authenticate(user=self.user)
        self.url = reverse("upload")

    def test_create_image_asset_with_book(self):
        image_file = SimpleUploadedFile(
            "image.jpg", b"file_content", content_type="image/jpeg"
        )
        data = {"file": image_file, "book": self.book.id}
        response = self.client.post(self.url, data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ImageAsset.objects.count(), 1)
        self.assertIsNotNone(ImageAsset.objects.get(book=self.book))

    def test_create_image_asset_invalid_with_both_book_and_shelf(self):
        image_file = SimpleUploadedFile(
            "image.jpg", b"file_content", content_type="image/jpeg"
        )
        data = {"file": image_file, "book": self.book.id, "shelf": self.shelf.id}
        response = self.client.post(self.url, data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_image_asset_invalid_with_neither_book_nor_shelf(self):
        image_file = SimpleUploadedFile(
            "image.jpg", b"file_content", content_type="image/jpeg"
        )
        data = {"file": image_file}
        response = self.client.post(self.url, data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TestCookieTokenObtainPairView(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="user@test.com", password="testpass123"
        )
        self.url = reverse("token_obtain_pair")

    def test_token_in_cookie(self):
        """
        Ensure access and refresh tokens are set in cookies correctly and removed from the response.
        """
        response = self.client.post(
            self.url, {"username": "testuser", "password": "testpass123"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check cookies for tokens
        self.assertIn("access_token", response.cookies)
        self.assertIn("refresh_token", response.cookies)

        # Check the cookie properties
        self.assertTrue(response.cookies["access_token"]["httponly"])
        self.assertEqual(response.cookies["access_token"]["samesite"], "None")
        self.assertTrue(response.cookies["access_token"]["secure"])

        self.assertTrue(response.cookies["refresh_token"]["httponly"])
        self.assertEqual(response.cookies["refresh_token"]["samesite"], "None")
        self.assertTrue(response.cookies["refresh_token"]["secure"])

        # Check response body does not have tokens
        self.assertNotIn("access", response.data)
        self.assertNotIn("refresh", response.data)


class UserRegistrationTest(APITestCase):
    def setUp(self):
        self.url = reverse("register_user")

    def test_user_registration_success(self):
        data = {
            "username": "newuser",
            "email": "user@example.com",
            "password": "testpass123",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().username, "newuser")

    def test_user_registration_failure(self):
        data = {
            "username": "",  # Invalid username
            "email": "user@example.com",
            "password": "testpass123",
        }
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 0)
