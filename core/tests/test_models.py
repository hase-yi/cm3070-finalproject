from django.test import TestCase
from django.contrib.auth.models import User
from core.models import Shelf


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

