from apps.accounts.models import StaffInvitation, User
from apps.accounts.services import resolve_or_create_user


def test_staff_invited_by_gerant_is_attached_to_that_manager(db, organization, gerant_user):
    invitation = StaffInvitation.objects.create(
        organization=organization,
        email="staff-chart@example.com",
        role=User.Role.STAFF,
        token="chart-token",
        invited_by=gerant_user,
    )

    staff, created = resolve_or_create_user({
        "email": invitation.email,
        "name": "Staff Organigramme",
        "picture": "https://lh3.googleusercontent.com/staff-chart",
    })

    assert created is True
    assert staff.role == User.Role.STAFF
    assert staff.manager_id == gerant_user.id
