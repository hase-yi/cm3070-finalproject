from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.request import Request
from django.http import HttpRequest
from core.auth import JWTAuthenticationFromCookie


class JWTAuthenticationFromCookieTests(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username="testuser", password="testpassword"
        )

    def get_jwt_token_for_user(self, user):
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    def test_authenticate_with_cookie(self):
        # Get JWT token for the test user
        jwt_token = self.get_jwt_token_for_user(self.user)

        # Mock a request with the JWT token in the cookie
        request = HttpRequest()
        request.COOKIES["access_token"] = jwt_token
        drf_request = Request(request)

        # Instantiate the custom authentication class
        auth = JWTAuthenticationFromCookie()

        # Authenticate the request
        user, validated_token = auth.authenticate(drf_request)

        # Verify that the authenticated user is the test user
        self.assertEqual(user, self.user)

    def test_authenticate_without_token(self):
        # Mock a request without a token in the cookie
        request = HttpRequest()
        drf_request = Request(request)

        # Instantiate the custom authentication class
        auth = JWTAuthenticationFromCookie()

        # Authenticate the request
        result = auth.authenticate(drf_request)

        # Verify that the result is None
        self.assertIsNone(result)

    def test_authenticate_with_invalid_token(self):
        # Mock a request with an invalid token in the cookie
        request = HttpRequest()
        request.COOKIES["access_token"] = "invalid_token"
        drf_request = Request(request)

        # Instantiate the custom authentication class
        auth = JWTAuthenticationFromCookie()

        # Authenticate the request and expect an InvalidToken exception
        with self.assertRaises(InvalidToken):
            auth.authenticate(drf_request)
