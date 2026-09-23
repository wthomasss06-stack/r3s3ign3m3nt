from apps.accounts.models import User
from apps.accounts.services import resolve_or_create_user


def test_existing_user_gets_google_avatar_when_profile_is_empty(db, organization):
    user = User.objects.create_user(
        email="existing@example.com",
        full_name="",
        avatar_url="",
        role=User.Role.BOSS,
        organization=organization,
    )

    resolved, created = resolve_or_create_user({
        "email": user.email,
        "name": "Existing User",
        "picture": "https://lh3.googleusercontent.com/avatar-existing",
    })

    assert created is False
    assert resolved.id == user.id
    user.refresh_from_db()
    assert user.avatar_url == "https://lh3.googleusercontent.com/avatar-existing"
    assert user.full_name == "Existing User"


def test_existing_custom_avatar_is_not_overwritten_by_google(db, organization):
    user = User.objects.create_user(
        email="custom@example.com",
        full_name="Custom User",
        avatar_url="https://res.cloudinary.com/demo/image/upload/custom.jpg",
        role=User.Role.BOSS,
        organization=organization,
    )

    resolve_or_create_user({
        "email": user.email,
        "name": "Google Name",
        "picture": "https://lh3.googleusercontent.com/avatar-google",
    })

    user.refresh_from_db()
    assert user.avatar_url == "https://res.cloudinary.com/demo/image/upload/custom.jpg"
