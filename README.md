# R3NS3IGN3M3NT

<div align="center">
  <img src="frontend/public/brand/logo-mark.png" alt="Logo R3NS3IGN3M3NT" width="120" />
  <h3>Le registre digital des établissements</h3>
  <p>QR Code, tablette d’accueil, formulaire visiteur, signatures et dashboard par rôles.</p>
  <p><a href="https://akatech.vercel.app/">Conçu par AKATech Studio</a></p>
</div>

> **Note logo AKATech Studio :** le footer utilise `/akatech-studio-logo.webp` pour révéler le logo au survol de « Conçu par AKATech Studio ». Déposer le fichier fourni dans `frontend/public/akatech-studio-logo.webp` avant le déploiement si le fichier n’est pas déjà présent dans l’arborescence.

## Présentation

R3NS3IGN3M3NT est une solution SaaS de registre d’accueil sans contact conçue par **AKATech Studio**, entreprise digitale basée à Abidjan, Côte d’Ivoire. Un établissement configure plusieurs formulaires, crée plusieurs points d’accueil avec leurs QR Codes et tablettes, puis consulte les arrivées dans un dashboard sécurisé.

Le visiteur n’a pas besoin de créer un compte. Le mode kiosque fonctionne offline-first : après un premier chargement avec Internet, chaque appareil conserve le formulaire de son point d’accueil et les soumissions en attente dans IndexedDB, puis synchronise automatiquement dès que le réseau revient.

## Identité du produit

| Élément | Information |
|---|---|
| Produit | R3NS3IGN3M3NT |
| Concepteur et éditeur du produit | AKATech Studio |
| Site AKATech Studio | [akatech.vercel.app](https://akatech.vercel.app/) |
| Contact | wthomasss06@gmail.com · +225 01 42 50 77 50 |
| Localisation déclarée | Abidjan, Côte d’Ivoire |
| Statut | V1.1 fonctionnelle, recette production à maintenir |

## Fonctionnalités livrées

### Accès et onboarding

- Authentification Google uniquement pour les membres de l’établissement.
- Onboarding en quatre étapes : rôle, établissement, formulaire, QR Code et invitation.
- Rattachement d’un invité à une organisation par correspondance avec l’email Google invité.
- Avatar Google ou avatar utilisateur et logo de l’établissement.
- Logo sélectionné par glisser-déposer ou sélecteur fichier, uploadé en direct vers Cloudinary via une signature serveur ; aucune image n’est conservée en base64 dans l’application.

### Rôles et permissions

- **Patron :** configuration complète, invitations, export CSV, régénération du QR, gestion de l’identité de l’établissement.
- **Gérant :** gestion opérationnelle du registre et du formulaire, consultation/export et affichage du QR, sans actions de sécurité critiques.
- **Staff :** consultation du registre, accueil des visiteurs et utilisation de l’interface tablette, sans modification de configuration.
- **Mode staff :** le Patron ou le Gérant peut prendre le relais en cas d’absence de Staff.

### Parcours visiteur

- Scan d’un QR Code opaque ou ouverture directe du lien public.
- Logo de l’établissement au centre du QR.
- Formulaire dynamique : texte, téléphone, email, nombre, date, liste, case à cocher et signature.
- Motifs de visite configurables, bouton d’actualisation et champ libre « Autre ».
- Plusieurs formulaires par établissement, avec formulaire par défaut et affectation par point d’accueil.
- Signature enregistrée en data URI SVG et affichée dans le registre.
- Remise à zéro après enregistrement ; fermeture automatique tentée sur téléphone.

### Accueil et kiosque

- Onglet **Accueil** pour le Staff.
- Onglet **Mode staff** pour le Patron et le Gérant.
- Affichage du QR en grand format pour les visiteurs équipés d’un téléphone.
- Bouton d’ouverture directe du formulaire pour une tablette ou un téléphone d’accueil.
- Plusieurs points d’accueil : nom du lieu, tablette identifiée, QR dédié, formulaire associé et dernière activité.
- Fonctionnement offline-first avec file locale et synchronisation idempotente.

### Dashboard et statistiques

- Registre paginé des visiteurs.
- Rafraîchissement automatique toutes les 30 secondes sans rechargement de page.
- Volume total et volume du jour.
- Heure de pointe et histogramme des visites par heure.
- Motifs de visite les plus fréquents.
- Export CSV.

### Vitrine et conformité

- Landing page marketing responsive et PWA.
- Header/footer avec logo R3NS3IGN3M3NT.
- Logo AKATech Studio révélé au survol du crédit concepteur dans le footer.
- Pages Aide, CGU, Confidentialité et Mentions légales.
- Les informations encore en formalisation juridique sont indiquées dans les pages légales sans être inventées.

### Feedback et administration plateforme

- Widget Feedback flottant sur la landing page et dans l’espace connecté.
- Catégories : amélioration, erreur, observation et autre.
- Association automatique au compte et à l’entreprise lorsque l’utilisateur est connecté.
- Espace `/admin` séparé du dashboard établissement, protégé par `PLATFORM_ADMIN_EMAIL` et `PLATFORM_ADMIN_PASSWORD`.
- Vue globale : nombre d’entreprises, comptes, visites, flux des 30 derniers jours et feedbacks nouveaux.
- Gestion des entreprises : création, modification, suppression et statistiques par entreprise.
- Gestion du personnel : rattachement à une entreprise, rôle, activation/désactivation et suppression.
- Gestion des feedbacks : lecture, classement par statut et suivi des retours utilisateurs.
- Lien **Administration plateforme** visible dans la navigation Patron, y compris sur mobile ; l’espace `/admin` possède sa propre connexion avec les identifiants Render.

## Architecture

```text
qr-register-saas/
├── backend/                         # API Django REST Framework
│   ├── apps/accounts/               # Utilisateurs, Google OAuth, invitations, rôles
│   ├── apps/organizations/          # Établissements, branding, QR et membres
│   ├── apps/checkins/               # Formulaires multiples, points d’accueil, sync, registre
│   ├── apps/feedback/                # Feedback public, admin plateforme et métriques
│   ├── core/                        # Settings, URLs, WSGI
│   ├── manage.py
│   ├── requirements.txt
│   └── requirements-dev.txt
├── frontend/                        # Next.js 14 App Router + Tailwind + PWA
│   ├── src/app/                     # Vitrine, auth, dashboard et page visiteur
│   ├── src/components/              # Logo, loader, navigation, QR, formulaires
│   ├── src/hooks/                   # Auth, cache public, sync offline
│   ├── src/lib/                     # API, IndexedDB/Dexie, export CSV, presets
│   └── public/                      # Logo, images landing, manifest et service worker
├── docs/                            # Cahier des charges, audit et flows SVG
└── README.md
```

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS |
| PWA/offline | Serwist, Dexie/IndexedDB, service worker |
| Backend | Python, Django, Django REST Framework |
| Authentification | Google OAuth, JWT, refresh token httpOnly |
| Base de données | PostgreSQL sur Neon en production, SQLite possible en local |
| Infrastructure | GitHub, Vercel pour le frontend, Render pour le backend, Neon pour PostgreSQL |
| Design | Logo officiel R3NS3IGN3M3NT, Phosphor Icons, Plus Jakarta Sans/Geist et tokens de marque |

## Routes frontend principales

| Route | Usage |
|---|---|
| `/` | Landing page marketing |
| `/connexion` | Connexion Google |
| `/onboarding` | Onboarding public / première configuration |
| `/dashboard` | Registre et statistiques |
| `/dashboard/accueil` | Accueil Staff ou Mode staff Patron/Gérant |
| `/dashboard/qr-code` | Gestion du QR Code |
| `/dashboard/parametres` | Paramètres du compte et de l’établissement |
| `/dashboard/parametres/formulaire` | Configuration du formulaire |
| `/dashboard/parametres/qr-code` | Gestion des QR et points d’accueil/tablettes |
| `/dashboard/parametres/equipe` | Gestion des invitations et de l’équipe |
| `/dashboard/parametres/entreprise` | Branding, suspension et actions de compte |
| `/v/<qr_token>` | Formulaire public visiteur |
| `/aide` | Aide produit |
| `/cgu` | Conditions générales |
| `/confidentialite` | Politique de confidentialité |
| `/mentions-legales` | Mentions légales |
| `/admin` | Administration AKATech Studio : métriques, entreprises, personnel et feedbacks |

## API principale

Toutes les routes API sont préfixées par `/api/v1`.

| Méthode | Route | Accès | Fonction |
|---|---|---|---|
| `POST` | `/auth/google/` | Public | Connexion ou création via Google |
| `POST` | `/auth/token/refresh/` | Cookie | Renouvellement JWT |
| `POST` | `/auth/logout/` | Membre | Déconnexion |
| `GET/PUT` | `/org/me/` | Membre | Lire/modifier l’organisation selon rôle |
| `POST` | `/auth/invite/` | Patron/Gérant selon règle | Inviter un membre |
| `GET/PUT` | `/form-template/` | Membre avec permission | Lire ou modifier le formulaire |
| `GET/POST` | `/form-templates/` | Patron/Gérant | Lister ou créer plusieurs formulaires |
| `PATCH/DELETE` | `/form-templates/<id>/` | Patron/Gérant ou Patron | Modifier, activer, définir par défaut ou supprimer |
| `POST` | `/org/uploads/cloudinary-signature/` | Patron | Obtenir une signature courte pour envoyer une image à Cloudinary |
| `GET/POST` | `/access-points/` | Patron/Gérant | Lister ou créer un point d’accueil/tablette |
| `PATCH/DELETE` | `/access-points/<id>/` | Patron/Gérant ou Patron | Modifier, désactiver ou supprimer un point |
| `GET` | `/public/forms/<qr_token>/` | Public | Charger le formulaire public |
| `POST` | `/checkins/sync/` | Public | Synchroniser les fiches offline, idempotence |
| `POST` | `/feedback/` | Public/authentifié | Envoyer un retour utilisateur |
| `GET` | `/checkins/` | Membre | Registre paginé |
| `GET` | `/checkins/stats/` | Membre | Volume, heures et motifs fréquents |
| `GET` | `/checkins/export/` | Selon permission | Export CSV |
| `POST` | `/org/me/regenerate-qr/` | Patron | Invalider l’ancien QR |
| `GET` | `/health/` | Public | Vérifier la disponibilité backend |
| `POST` | `/admin/login/` | Public avec identifiants Render | Ouvrir une session admin plateforme |
| `GET` | `/admin/overview/` | Admin plateforme | Métriques globales |
| `GET/POST` | `/admin/organizations/` | Admin plateforme | Lister ou créer une entreprise |
| `PATCH/DELETE` | `/admin/organizations/<id>/` | Admin plateforme | Modifier ou supprimer une entreprise |
| `GET` | `/admin/members/` | Admin plateforme | Lister tous les comptes |
| `PATCH/DELETE` | `/admin/members/<id>/` | Admin plateforme | Modifier ou supprimer un membre |
| `GET` | `/admin/feedback/` | Admin plateforme | Lister les retours utilisateurs |
| `PATCH/DELETE` | `/admin/feedback/<id>/` | Admin plateforme | Suivre ou supprimer un feedback |

## Installation locale

### Prérequis

- Python 3.11+ ou 3.12+
- Node.js 18+ (Node 22 recommandé)
- npm
- PostgreSQL/Neon pour reproduire la production, SQLite pour un démarrage local rapide
- Client OAuth Google configuré

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate       # macOS/Linux
# Windows PowerShell : .venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

Variables backend importantes :

```env
SECRET_KEY=une-cle-secrete-longue
DEBUG=True
DATABASE_URL=sqlite:///... ou postgres://...
GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com
FRONTEND_URL=http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000
PLATFORM_ADMIN_EMAIL=admin@example.com
PLATFORM_ADMIN_PASSWORD=mot-de-passe-aleatoire-de-20-caracteres-minimum
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Variables frontend :

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com
```

Le frontend est disponible sur `http://localhost:3000` et l’API sur `http://localhost:8000`.

## Mode tablette / offline

1. Ouvrir `/v/<qr_token>` une première fois avec Internet.
2. Vérifier le logo et les motifs affichés.
3. Ajouter la page à l’écran d’accueil ou activer le mode kiosque du navigateur.
4. Créer un point d’accueil dans Paramètres > QR Code, choisir son formulaire et nommer sa tablette.
5. Laisser la tablette sur le formulaire de son QR.
6. Les visiteurs remplissent et signent sans compte.
7. Les données sont enregistrées localement si le réseau est indisponible.
8. La synchronisation reprend automatiquement dès le retour du réseau, avec le point d’accueil et le formulaire d’origine.

Chaque point d’accueil possède un QR opaque indépendant. Sa désactivation ou sa suppression coupe son parcours. Un appareil complètement offline peut conserver temporairement son ancien cache jusqu’à sa reconnexion.

## Tests et validation

### Backend

```bash
cd backend
pip install -r requirements-dev.txt
pytest -q
```

Les tests couvrent notamment l’idempotence, la validation des champs obligatoires, la protection contre l’IDOR, les invitations, le RBAC et les statistiques.

### Frontend

```bash
cd frontend
npm run type-check
npm run build
```

État de la dernière validation : **21 tests backend passants, type-check frontend OK et build Next.js OK**.

## Déploiement production

- **GitHub :** dépôt et historique du code.
- **Vercel :** déploiement du frontend Next.js.
- **Render :** déploiement de l’API Django.
- **Neon :** base PostgreSQL de production.

Avant chaque mise en production :

1. configurer les variables d’environnement sans les committer ;
2. utiliser une `SECRET_KEY` longue et stable ;
3. positionner `DEBUG=False` côté backend ;
4. vérifier `ALLOWED_HOSTS`, CORS et CSRF ;
5. appliquer les migrations Django sur la base de production ;
6. vérifier le login Google, l’invitation, le QR, le mode offline et les permissions par rôle ;
7. tester le formulaire sur plusieurs téléphones et sur la tablette d’accueil.
8. tester plusieurs formulaires, plusieurs QR et la reprise offline de chaque tablette.
8. définir dans Render `PLATFORM_ADMIN_EMAIL` et un `PLATFORM_ADMIN_PASSWORD` aléatoire d’au moins 20 caractères ; ne jamais les mettre dans Git.

## Sécurité et données

- Le QR public utilise un token opaque, jamais un identifiant de base de données.
- Les données sont isolées par organisation côté backend.
- Les permissions sont vérifiées côté API, pas uniquement dans le frontend.
- Le refresh JWT est conservé dans un cookie httpOnly.
- Les routes publiques sont limitées par throttling.
- Les soumissions offline utilisent une clé d’idempotence client.
- Chaque check-in conserve son formulaire et son point d’accueil d’origine pour les statistiques et l’export.
- L’administration plateforme exige un utilisateur marqué superuser par le login contrôlé côté serveur ; un Patron d’entreprise ne peut pas accéder à `/admin`.
- Ne jamais committer `.env`, `.env.local`, tokens, clés OAuth privées ou secrets de déploiement.

## Documentation complémentaire

- [`docs/cahier-des-charges.md`](docs/cahier-des-charges.md) — périmètre et décisions produit.
- [`docs/audit-etat-projet.md`](docs/audit-etat-projet.md) — audit des implémentations et contrôles production.
- [`docs/flow-tablette-employe.md`](docs/flow-tablette-employe.md) — parcours tablette/kiosque.
- [`docs/flows/`](docs/flows/) — six diagrammes SVG des parcours et permissions.
- [`docs/modele-economique.md`](docs/modele-economique.md) — stratégie gratuit, offres payantes et indicateurs de lancement.

## Limitations et prochaines évolutions

Les fonctions actuellement prévues mais non intégrées dans le périmètre courant sont l’agrégateur de paiement, la facturation récurrente, la notification WhatsApp, l’impression de badges et la gestion avancée de supervision temps réel des tablettes. Les formulaires multiples et les points d’accueil multi-tablettes sont désormais livrés. La forme juridique, le RCCM et l’adresse physique complète d’AKATech Studio seront ajoutés aux pages légales dès finalisation des documents de l’entreprise.

## Licence

## Mise à jour UX — septembre 2026

L’expérience recommande désormais un parcours simple : un seul formulaire est présenté au départ, puis **Paramètres > Formulaire** et **Paramètres > QR Code** proposent chacun une modale d’ajout. La modale permet de nommer le nouveau parcours, de repartir d’un modèle et de visualiser les types de champs inclus avant personnalisation. Chaque QR peut être relié à un formulaire différent et à un point d’accueil identifié.

L’onglet **Entreprise** centralise le nom et le logo de l’établissement. Seul le patron peut modifier le branding, suspendre ou supprimer l’entreprise. Les gérants et membres du staff disposent d’une action de départ volontaire qui désactive leur compte. Les connexions affichent un accueil personnalisé ; la déconnexion est confirmée dans une modale avec une formule adaptée à l’heure. Le rafraîchissement de session utilise le cookie httpOnly de renouvellement et ne déconnecte pas l’utilisateur lors d’une erreur réseau transitoire.

Le logo de référence du projet est [`frontend/public/akatech-studio-logo.webp`](frontend/public/akatech-studio-logo.webp).

Projet propriétaire / SaaS conçu par AKATech Studio. Les conditions d’utilisation et de réutilisation du code doivent être définies avant toute distribution publique.
