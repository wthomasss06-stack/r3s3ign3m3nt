# Cahier des charges — R3NS3IGN3M3NT (nom de code de développement : `qr-register-saas`)

| | |
|---|---|
| **Porteur** | AKATech Studio (Elvis) |
| **Statut** | V1.2 — Formulaires multiples, QR par point d’accueil et gestion multi-tablettes livrés. Recette production maintenue comme étape de contrôle. |
| **Version du document** | 1.3 |

> Nom commercial retenu : **R3NS3IGN3M3NT**. `qr-register-saas` reste le nom de code utilisé dans le code et les dossiers du projet.

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
         → le patron voit la donnée après synchronisation, avec rafraîchissement automatique du registre toutes les 30 secondes
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
- [x] Dashboard : registre, export CSV, régénération du QR
- [x] Onboarding en 4 étapes : rôle/profil, établissement, formulaire, QR + invitation avec possibilité de passer
- [x] Marque établissement : nom, logo, motifs de visite et avatar utilisateur
- [x] QR personnalisé avec logo centré
- [x] Mode Accueil / Mode staff : QR grand format et ouverture directe du formulaire visiteur
- [x] Signatures visiteur enregistrées en data URI SVG et visibles dans le registre
- [x] Rafraîchissement automatique du registre sans rechargement de page (polling toutes les 30 secondes)
- [x] Statistiques : volume total, volume du jour, heures de pointe et motifs fréquents
- [x] Plusieurs formulaires par établissement, avec formulaire par défaut et suppression protégée du dernier formulaire
- [x] Plusieurs points d’accueil par établissement, chacun relié à un formulaire et à un QR opaque dédié
- [x] Identification facultative de la tablette/appareil et date de dernière activité du point d’accueil
- [x] Synchronisation offline résolue par le QR du point d’accueil, avec conservation du formulaire et de l’appareil d’origine

### Prévu ensuite (SHOULD HAVE — V1.1/V1.2)

- [ ] Notification WhatsApp au patron à chaque nouvelle arrivée (temps réel)
- [x] Rafraîchissement automatique (polling) du registre pendant qu'il est ouvert
- [ ] Impression de badge visiteur
- [x] Statistiques (heures de pointe, motifs fréquents, volume de visites)
- [x] Renommer/gérer plusieurs formulaires par établissement
- [x] Gérer plusieurs tablettes et points d’accueil par établissement

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
| `Organization` | `qr_secure_token` (unique), `logo_url`, `visit_reasons` | Le token est *opaque* : jamais d'ID de base de données exposé au client public ; la marque et les motifs sont propagés au formulaire public |
| `User` | `email`, `role` (BOSS/STAFF), `organization` | Auth Google uniquement (`set_unusable_password`) |
| `StaffInvitation` | `email`, `token`, `accepted_at` | Rattachement réel par correspondance d'email à la connexion Google, pas par le token seul |
| `FormTemplate` | `organization`, `fields_schema` (JSON), `version`, `is_default` | Plusieurs schémas JSON par organisation ; un formulaire par défaut ; versionné à chaque modification |
| `AccessPoint` | `organization`, `form_template`, `secure_token`, `name`, `device_label`, `last_seen_at` | Un QR opaque et un appareil/lieu par point d’accueil ; le point choisit le formulaire servi |
| `CheckIn` | `organization`, `form_template`, `access_point`, `idempotency_key`, `responses` (JSON), `signature_blob` | La fiche conserve le formulaire et le point d’origine ; la clé d'idempotence est générée côté client |

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
| `GET/PUT` | `/api/v1/form-template/` | BOSS/STAFF | Consulter/modifier le formulaire actif |
| `GET/POST` | `/api/v1/form-templates/` | BOSS/GERANT | Lister ou créer un formulaire |
| `PATCH/DELETE` | `/api/v1/form-templates/<id>/` | BOSS/GERANT ou BOSS | Modifier, activer, définir par défaut ou supprimer un formulaire |
| `GET/POST` | `/api/v1/access-points/` | BOSS/GERANT | Lister ou créer un point d’accueil/tablette |
| `PATCH/DELETE` | `/api/v1/access-points/<id>/` | BOSS/GERANT ou BOSS | Modifier, désactiver ou supprimer un point d’accueil |
| GET | `/api/v1/public/forms/<qr_token>/` | Public | Formulaire à afficher au scan |
| POST | `/api/v1/checkins/sync/` | Public | Envoi (groupé, idempotent) des fiches visiteurs |
| GET | `/api/v1/checkins/` | BOSS/STAFF | Registre paginé |
| GET | `/api/v1/checkins/stats/` | BOSS/GERANT/STAFF | Volume, volume du jour, heures de pointe et motifs fréquents |
| GET | `/api/v1/checkins/export/` | BOSS | Export CSV |
| POST | `/api/v1/org/me/regenerate-qr/` | BOSS | Invalide l'ancien QR |
| GET | `/api/v1/health/` | Public | Sonde de disponibilité |

## 10. Tests automatisés

21 tests d'intégration couvrent les flows critiques (voir `backend/apps/checkins/tests/`) : idempotence anti-doublon, rejet d'un champ obligatoire manquant, non-exploitation d'un `organization_id` fourni par le client, RBAC, agrégation des statistiques, feedback et administration. La migration multi-formulaires et les tests frontend passent en environnement local. La couverture n'est pas exhaustive : l'auth Google réelle, les navigateurs mobiles, plusieurs tablettes offline et la recette production restent des contrôles complémentaires.

## 12. Site vitrine & pages légales (livrés)

- Landing page (`/`) : palette et polices reprises d'une référence fournie (Playfair Display, Manrope, DM Mono ; vert forêt/crème), animée en GSAP (entrée hero, révélations au scroll, orbite continue).
- Header + footer partagés sur les pages publiques, avec bouton d'installation PWA natif (`beforeinstallprompt`) dans le footer.
- Connexion déplacée sur `/connexion` (la racine est maintenant la vitrine).
- Pages légales : `/aide`, `/cgu`, `/confidentialite`, `/mentions-legales` — rédigées à partir de l'implémentation réelle, avec les formulaires multiples, les points d’accueil et les tablettes. La forme juridique, le RCCM et l’adresse physique complète d’AKATech Studio restent à ajouter dès formalisation.

**Validation juridique recommandée avant mise en ligne commerciale**, en particulier sur les CGU (tarification, disponibilité) et la confidentialité (déclaration éventuelle auprès de l'ARTCI pour la collecte de données visiteurs).

## 13. Livrables de cette phase

- Backend Django complet (`/backend`)
- Frontend Next.js complet (`/frontend`) — flow visiteur + dashboard patron/agent
- Ce cahier des charges
- `README.md` — installation et déploiement

## 14. Simplification UX livrée — septembre 2026

La création d’un formulaire ou d’un QR code ne s’impose plus dans le parcours initial. L’utilisateur commence avec un formulaire simple, puis déclenche **Nouveau formulaire** ou **Nouveau QR** depuis les paramètres. Une modale demande le nom, propose un modèle de champs pour le formulaire ou le formulaire cible pour le QR, puis laisse l’utilisateur personnaliser avant déploiement. Le même principe s’applique à chaque ajout successif.

Un onglet **Entreprise** est désormais disponible dans les paramètres. Le patron peut modifier le nom et le logo de l’entreprise, suspendre l’espace ou le supprimer après confirmation. Le gérant et le staff peuvent quitter volontairement leur espace et désactiver leur compte. La suppression d’un membre ou d’une invitation doit rester une action contrôlée par le patron, avec un message d’accès retiré lors d’une prochaine connexion si le compte est désactivé.

Les états de connexion et de déconnexion sont présentés dans des modales contextualisées : bienvenue pour une première connexion, bon retour pour une connexion existante, et formule de départ adaptée à l’heure. La session repose sur le cookie httpOnly de renouvellement et une erreur réseau transitoire ne provoque pas de déconnexion artificielle après actualisation.

Sur mobile, le feedback est accessible par une icône ronde flottante afin de préserver l’espace de navigation. L’administration plateforme expose ses onglets sur desktop et mobile ; le dashboard établissement affiche également le lien d’administration pour le rôle patron lorsque l’accès plateforme est autorisé côté serveur.
