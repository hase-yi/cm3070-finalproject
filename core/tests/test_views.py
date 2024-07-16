from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from core.models import Shelf
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
