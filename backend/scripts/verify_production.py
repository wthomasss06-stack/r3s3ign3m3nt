"""Vérifie les invariants de déploiement avant une mise en staging/production.

Usage depuis backend : python scripts/verify_production.py
Le script ne révèle aucune valeur secrète ; il signale uniquement les invariants manquants.
"""
from __future__ import annotations

import os
import sys

import django
from django.core.management import call_command
from django.db import connection


def require(name: str, predicate: bool, message: str) -> None:
    if not predicate:
        raise RuntimeError(f"{name}: {message}")


def main() -> int:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
    os.environ.setdefault("DEBUG", "False")
    django.setup()
    from django.conf import settings

    require("SECRET_KEY", len(settings.SECRET_KEY) >= 32, "clé de 32 caractères minimum")
    require("DEBUG", settings.DEBUG is False, "DEBUG doit être False")
    require("ALLOWED_HOSTS", bool(settings.ALLOWED_HOSTS) and "*" not in settings.ALLOWED_HOSTS, "domaines explicites requis")
    require("CORS_ALLOWED_ORIGINS", bool(settings.CORS_ALLOWED_ORIGINS) and "*" not in settings.CORS_ALLOWED_ORIGINS, "origines explicites requises")
    require("CSRF_TRUSTED_ORIGINS", all(origin.startswith("https://") for origin in settings.CSRF_TRUSTED_ORIGINS), "origines HTTPS requises")
    require("DATABASE_URL", bool(os.environ.get("DATABASE_URL")), "URL PostgreSQL/Neon requise")
    require("PLATFORM_ADMIN_PASSWORD", len(settings.PLATFORM_ADMIN_PASSWORD) >= 20, "mot de passe d’au moins 20 caractères requis")
    require("CLOUDINARY_CLOUD_NAME", bool(settings.CLOUDINARY_CLOUD_NAME), "cloud name Cloudinary requis")
    require("CLOUDINARY_API_KEY", bool(settings.CLOUDINARY_API_KEY), "clé API Cloudinary requise")
    require("CLOUDINARY_API_SECRET", bool(settings.CLOUDINARY_API_SECRET), "secret API Cloudinary requis")

    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
    call_command("check", "--deploy", verbosity=0)
    print("Production configuration checks passed.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # pragma: no cover - CLI failure path
        print(f"Production configuration check failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
