# R3S3IGN3M3NT

R3S3IGN3M3NT est une solution de registre d’accès sans contact pour les établissements : un visiteur scanne un QR code, remplit un formulaire, et les données sont centralisées dans un tableau de bord dédié au patron et à son équipe.

Le projet est composé d’un backend Django REST API et d’un frontend Next.js PWA avec un accueil marketing, un dashboard interne et un mode kiosque/offline-first.

## Stack

- Backend: Django + DRF + PostgreSQL (Neon)
- Frontend: Next.js + Tailwind CSS + PWA
- Auth: Google OAuth + JWT
- Stockage local: Dexie / IndexedDB

## Architecture

```text
backend/   Django REST API
frontend/  Next.js app + dashboard + landing page
docs/      Cahier des charges et documents de référence
```

## Prérequis

- Python 3.12+
- Node.js 18+
- PostgreSQL / Neon project
- Compte Google Cloud avec un OAuth Client ID

## 1) Backend

```bash
cd backend
python -m venv venv
./venv/Scripts/Activate.ps1   # PowerShell
# ou : source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

Créer le fichier `.env` à partir de l’exemple fourni :

```bash
copy .env.example .env
```

Puis renseigner les variables nécessaires :

- `DATABASE_URL` : chaîne de connexion Neon
- `GOOGLE_CLIENT_ID` : Client ID OAuth Google
- `FRONTEND_URL` : `http://localhost:3000`
- `CORS_ALLOWED_ORIGINS` : `http://localhost:3000`

Lancer les migrations et le serveur :

```bash
python manage.py migrate
python manage.py runserver
```

Optionnel : créer un superutilisateur Django :

```bash
python manage.py createsuperuser
```

L’API est accessible sur :

```text
http://localhost:8000
```

## 2) Frontend

```bash
cd frontend
npm install
copy .env.local.example .env.local
```

Compléter le fichier `.env.local` avec :

- `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID=<votre_client_id_google>`

Puis démarrer le projet :

```bash
npm run dev
```

Le site est accessible sur :

```text
http://localhost:3000
```

## Routes principales

- `/` : landing page / vitrine
- `/connexion` : page de connexion Google
- `/dashboard` : tableau de bord
- `/dashboard/formulaire` : personnalisation du formulaire
- `/dashboard/qr-code` : gestion des QR codes
- `/dashboard/equipe` : gestion des agents
- `/v/<qr_token>` : formulaire visiteur

## Kiosque / hors ligne

1. Ouvrir une première fois le lien visiteur avec internet.
2. Ajouter la page à l’écran d’accueil du navigateur.
3. Utiliser ensuite le mode kiosk hors ligne.
4. Les données sont synchronisées automatiquement dès qu’une connexion revient.

## Déploiement

- Frontend : Vercel
- Backend : Render ou Railway
- Les variables d’environnement doivent être configurées en production avec `DEBUG=False`
- Pour la prod, utiliser une `SECRET_KEY` longue et fixe

## Sécurité

- Ne jamais committer les fichiers `.env` ou `.env.local`
- Ne jamais publier de clés secrètes ni de tokens dans le dépôt
- Les variables sensibles doivent rester locales ou côté serveur de déploiement

## Tests

Backend :

```bash
cd backend
pip install -r requirements-dev.txt
pytest apps/checkins/tests/ -v
```

## Licence

Projet interne / SaaS de démonstration. À adapter selon le besoin du client ou du dépôt public final.
