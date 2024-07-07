from rest_framework_simplejwt.authentication import JWTAuthentication


# Loosely inspired by https://stackoverflow.com/questions/66247988/how-to-store-jwt-tokens-in-httponly-cookies-with-drf-djangorestframework-simplej
class JWTAuthenticationFromCookie(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)

        if header is None:
            # Try to get the token from the cookie if it's not in the header
            raw_token = request.COOKIES.get("access_token")
        else:
            raw_token = self.get_raw_token(header)

        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        # enforce_csrf(request)
        return self.get_user(validated_token), validated_token
