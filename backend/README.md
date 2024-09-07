# Book Forest Django Backend

This README will set up the Django backend for Book Forest.

## Prerequisites

Before getting started, ensure you have the following installed on your machine:

- Python (>=3.9)
- pip (Python package manager)
- Virtualenv (Optional but recommended)
- PostgreSQL or SQLite (depending on your database choice)

## 1. Setting Up a Virtual Environment

It is recommended to create a virtual environment for managing dependencies.

```
# Install virtualenv if you don't have it
pip install virtualenv

# Create a virtual environment
virtualenv venv

# Activate the virtual environment
# On macOS/Linux
source venv/bin/activate

# On Windows
venv\Scripts\activate
```

## 2. Installing Dependencies

Install the project dependencies from the requirements.txt file.

```
pip install -r requirements.txt
```

## 3. Running Migrations

```
python manage.py migrate
```

## 4. Create at least one super user

```
python manage.py createsuperuser
```

## 5. Start the server

```
python manage.py runserver
```