# Book Forest

This repository contains the merged frontend (React) and backend (Django) code for the final project submission.

Please, refer to the respective `frontend` and `backend` directories above.

## Setting up frontend and backend

You will find specific README files in the components directories.

```
frontend/README.md
backend/README.md
```

Follow these instructions and continue with the section below.

## Connecting Django to React Frontend

To enable communication between the Django backend and the React frontend, you need to configure Cross-Origin Resource Sharing (CORS) in your Django settings.

All necessary apps and python requirements should be installed once the backend setup is completed.

### Troubleshooting

If the backend is blocking requests from the frontend check Django's `CORS_ALLOWED_ORIGINS` settings in `backend/bookforest/settings.py`.