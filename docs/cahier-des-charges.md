# Cahier des charges — R3S3IGN3M3NT (nom de code de développement : `qr-register-saas`)

| | |
|---|---|
| **Porteur** | AKATech Studio (Elvis) |
| **Statut** | V1.0 — Scope figé, développé et testé. Site vitrine + pages légales livrés. |
| **Version du document** | 1.1 |

> Nom commercial retenu : **R3S3IGN3M3NT**. `qr-register-saas` reste le nom de code utilisé dans le code et les dossiers du projet.

## 1. Contexte & problème

Les entreprises, bureaux, restaurants et établissements recevant du public gèrent encore la prise de renseignements (registre de visiteurs, fiche client, accès à une salle) avec un cahier papier et un stylo. C'est lent à consolider, non confidentiel (chaque visiteur voit les coordonnées des précédents), impossible à analyser, et vulnérable à la perte ou à la détérioration.

Les alternatives existantes ne conviennent pas aux petites structures locales :
- Les solutions de *Visitor Management* internationales (Envoy, SwipedOn) sont facturées en devises fortes, nécessitent du matériel dédié et une connexion internet stable.
- Les développements sur-mesure classiques ont un devis d'entrée trop élevé pour remplacer un simple cahier à 1 000 FCFA.

## 2. Cibles

| Rôle | Besoin |
|---|---|
| **Patron / gérant** | Configurer son propre formulaire, consulter les visiteurs à distance, sans payer un gros devis initial |
| **Agent d'accueil (staff)** | Consulter le registre au quotidien, sans pouvoir modifier le formulaire |
| **Visiteur** | Remplir ses informations en quelques secondes, sans créer de compte, sans imposer sa propre connexion internet |

Secteurs prioritaires : bureaux/cabinets, restaurants, hôtels, accès salle de réunion ou chantier.

## 3. Principe de fonctionnement — le modèle "kiosque"

Point de conception central, précisé en cours de projet : **le visiteur n'a besoin d'aucune connexion internet personnelle.** Le patron met à disposition un téléphone ou une tablette dédiée à l'accueil. Cet appareil :

1. Charge le formulaire une première fois (connexion nécessaire une seule fois, à la mise en place).
2. Fonctionne ensuite indéfiniment hors-ligne : le formulaire reste affiché et chaque visiteur peut le remplir et signer, même si l'appareil reste des jours sans réseau.
3. Synchronise automatiquement tout ce qui est en attente dès que **cet appareil** (pas le patron) retrouve une connexion — sans notification, sans action requise de personne.

```
Visiteur → scanne le QR (ou l'appareil est déjà ouvert dessus)
         → remplit le formulaire, signe du doigt
         → 💾 stocké localement sur l'appareil (IndexedDB), instantanément
         → dès que CET appareil a du réseau → envoi silencieux au serveur
         → le patron voit la donnée au prochain chargement de son dashboard
```

Le patron et l'agent, eux, **ont besoin d'une connexion** pour se connecter (authentification Google) et consulter leur dashboard — comme n'importe quelle application web classique.

## 4. Périmètre fonctionnel (Scope Lock V1.0)

### Doit être livré (MUST HAVE) — ✅ fait

- [x] Authentification Google uniquement (patron et agent), aucun mot de passe
- [x] Création automatique de l'espace (organisation + QR sécurisé) à la première connexion du patron
- [x] Formulaire dynamique configurable par le patron : texte, téléphone, email, nombre, date, liste déroulante, case à cocher, signature
- [x] **5 modèles de formulaire suggérés** (Bureau/Cabinet, Restaurant, Hôtel, Accès salle/Chantier, Vierge) — le patron part d'un modèle ou construit en freestyle, et peut tout modifier ensuite
- [x] Page visiteur "kiosque" : fonctionne hors-ligne indéfiniment après un premier chargement, signature au doigt
- [x] Synchronisation automatique et idempotente (aucun doublon même en cas de coupure réseau)
- [x] Invitation d'un agent par email (rattachement automatique à la connexion Google de l'invité)
- [x] Dashboard : registre en temps réel, export CSV, régénération du QR

### Prévu ensuite (SHOULD HAVE — V1.1/V1.2)

- [ ] Notification WhatsApp au patron à chaque nouvelle arrivée (temps réel)
- [ ] Rafraîchissement automatique (polling) du registre pendant qu'il est ouvert
- [ ] Impression de badge visiteur
- [ ] Statistiques (heures de pointe, motifs fréquents)
- [ ] Renommer/gérer plusieurs formulaires par établissement (aujourd'hui : un seul formulaire actif par organisation)

### Hors périmètre (OUT OF SCOPE)

- Application mobile native (la PWA suffit ; le natif reste une option future une fois le web éprouvé, comme demandé)
- Reconnaissance faciale ou biométrie
- Facturation / paiement intégré

## 5. Architecture technique

```
[ Visiteur ] --scan/ouvre--> [ Page /v/[qr_token] (client-side) ]
                                        │
                              ┌─────────┴─────────┐
                              ▼                   ▼
                     [ IndexedDB local ]   [ tente le réseau ]
                     (formulaire + files)          │
                              │            ┌────────┴────────┐
                              │            ▼ succès           ▼ échec réseau
                              │     [ cache mis à jour ] [ repli sur cache local ]
                              │
                    [ soumissions en attente ]
                              │
                    dès que l'appareil a du réseau
                              ▼
                    [ API Django REST (JWT) ]
                              │
                    [ PostgreSQL — Neon, isolation par organization_id ]
                              ▲
                              │ (connexion Google requise)
                    [ Dashboard Next.js — patron / agent ]
```

| Couche | Choix | Raison |
|---|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS, PWA | SEO pour une éventuelle vitrine, rendu hybride, écosystème React |
| Offline (visiteur) | Dexie.js (IndexedDB) | Le formulaire lui-même *et* les soumissions sont mis en cache côté client — pas seulement les soumissions |
| Backend | Django REST Framework | Admin intégrée, RBAC natif, rapide à sécuriser correctement |
| Base de données | PostgreSQL (Neon, serverless) | Colonnes JSON natives pour les formulaires dynamiques |
| Authentification | Google OAuth + JWT (SimpleJWT) | Zéro mot de passe à gérer ; refresh token en cookie httpOnly (jamais en localStorage) |
| Hébergement prévu | Vercel (front) + Render/Railway (back + DB) | Coût de démarrage quasi nul |

## 6. Modèle de données

| Entité | Champs clés | Notes |
|---|---|---|
| `Organization` | `qr_secure_token` (unique) | Le token est *opaque* : jamais d'ID de base de données exposé au client public |
| `User` | `email`, `role` (BOSS/STAFF), `organization` | Auth Google uniquement (`set_unusable_password`) |
| `StaffInvitation` | `email`, `token`, `accepted_at` | Rattachement réel par correspondance d'email à la connexion Google, pas par le token seul |
| `FormTemplate` | `fields_schema` (JSON), `version` | Un schéma JSON par organisation ; versionné à chaque modification |
| `CheckIn` | `idempotency_key` (unique), `responses` (JSON), `signature_blob` | La clé d'idempotence est générée côté client *avant* tout envoi |

## 7. Sécurité — corrections apportées en cours de conception

Ces points ont été identifiés et corrigés avant la mise en production, pas après :

1. **QR Code sans IDOR** : le visiteur n'envoie jamais d'`organization_id`. Seul le `qr_token` opaque est transmis ; le serveur résout l'organisation lui-même.
2. **Refresh token en cookie httpOnly** : jamais en `localStorage` (accessible en JS = volable par un script malveillant). Distinction erreur transitoire (cold start serveur) / vraie déconnexion, pour ne jamais déconnecter quelqu'un à tort.
3. **Validation serveur systématique** : les champs obligatoires du formulaire sont revérifiés côté serveur (un visiteur malveillant pourrait contourner la validation du navigateur).
4. **Rate limiting** sur les routes publiques (60 req/min anonyme).
5. **RBAC vérifié côté serveur** (`IsBoss`, `IsOrgMember`) — testé automatiquement : un agent (STAFF) ne peut pas modifier le formulaire même en trafiquant le frontend.
6. **Régénération du QR** : si un lien fuite ou qu'un appareil est volé, le patron invalide l'ancien QR en un clic.

**Limite connue et acceptée** : si un QR est régénéré pendant qu'un kiosque reste hors-ligne, cet appareil continuera d'utiliser l'ancien token jusqu'à sa prochaine connexion réseau — compromis nécessaire du modèle "hors-ligne par défaut".

## 8. Design system

| | |
|---|---|
| **Titres** | Plus Jakarta Sans (600–800) |
| **Texte courant** | Geist Sans — auto-hébergée, zéro dépendance réseau externe au build |
| **Fond** | `#FBFBFA` (blanc chaud) / cartes `#FFFFFF` |
| **Texte** | `#2F3437` (jamais noir pur) / secondaire `#787774` |
| **Accent d'action (CTA)** | `#171717`, hover `#333333` |
| **États** | succès `#EDF3EC`/`#346538` · erreur `#FDEBEC`/`#9F2F2D` |
| **Rayons** | 10–12px (cartes), 6px (boutons) — jamais de `rounded-full` sur un gros élément |
| **Icônes** | Phosphor Icons (Bold) |

Direction volontairement sobre plutôt que le style neo-brutaliste/sombre habituel d'AKATech : ce produit est un outil utilitaire consulté par des agents d'accueil peu à l'aise avec la technologie, sur un écran de kiosque potentiellement en plein jour — la lisibilité et la vitesse de chargement priment sur l'effet visuel. Cette direction peut être révisée à la demande (variables CSS centralisées, pas de changement structurel).

## 9. Contrat API (résumé)

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/api/v1/auth/google/` | Public | Connexion/inscription, pose le cookie de refresh |
| POST | `/api/v1/auth/token/refresh/` | Public (cookie) | Renouvelle l'access token |
| POST | `/api/v1/auth/invite/` | BOSS | Invite un agent |
| GET/PUT | `/api/v1/form-template/` | BOSS/STAFF | Consulter/modifier le formulaire actif |
| GET | `/api/v1/public/forms/<qr_token>/` | Public | Formulaire à afficher au scan |
| POST | `/api/v1/checkins/sync/` | Public | Envoi (groupé, idempotent) des fiches visiteurs |
| GET | `/api/v1/checkins/` | BOSS/STAFF | Registre paginé |
| GET | `/api/v1/checkins/export/` | BOSS | Export CSV |
| POST | `/api/v1/org/me/regenerate-qr/` | BOSS | Invalide l'ancien QR |
| GET | `/api/v1/health/` | Public | Sonde de disponibilité |

## 10. Tests automatisés

7 tests d'intégration couvrent les flows critiques (voir `backend/apps/checkins/tests/`) : idempotence anti-doublon, rejet d'un champ obligatoire manquant, non-exploitation d'un `organization_id` fourni par le client, et RBAC (un agent STAFF ne peut pas modifier le formulaire). Tous passent. La couverture n'est pas exhaustive (pas de tests sur l'auth Google, mockée en pratique) : à étoffer en V1.1.

## 12. Site vitrine & pages légales (livrés)

- Landing page (`/`) : palette et polices reprises d'une référence fournie (Playfair Display, Manrope, DM Mono ; vert forêt/crème), animée en GSAP (entrée hero, révélations au scroll, orbite continue).
- Header + footer partagés sur les pages publiques, avec bouton d'installation PWA natif (`beforeinstallprompt`) dans le footer.
- Connexion déplacée sur `/connexion` (la racine est maintenant la vitrine).
- Pages légales : `/aide`, `/cgu`, `/confidentialite`, `/mentions-legales` — rédigées à partir de l'implémentation réelle (aucune information juridique inventée : identité de l'éditeur, hébergeur définitif, coordonnées de contact et durée de conservation restent à compléter par le porteur du projet, marqués `[À COMPLÉTER PAR LE CLIENT]`).

**Validation juridique recommandée avant mise en ligne commerciale**, en particulier sur les CGU (tarification, disponibilité) et la confidentialité (déclaration éventuelle auprès de l'ARTCI pour la collecte de données visiteurs).

## 13. Livrables de cette phase

- Backend Django complet (`/backend`)
- Frontend Next.js complet (`/frontend`) — flow visiteur + dashboard patron/agent
- Ce cahier des charges
- `README.md` — installation et déploiement
