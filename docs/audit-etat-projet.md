# Audit d’état du projet — 21 septembre 2026

## État de l’implémentation

| Domaine | État | Constat |
|---|---|---|
| Authentification Google réelle | Déclaré validé en production par le porteur | Le code utilise Google OAuth côté frontend et vérifie le credential côté Django. Les tests automatisés utilisent des fixtures et ne remplacent pas une recette navigateur réelle. |
| Invitation Google d’un utilisateur | Déclaré validé en production par le porteur | Le rattachement se fait par correspondance d’email à la connexion Google, avec rôle et organisation. |
| Upload du logo | Implémenté | Le logo est sélectionné côté client, contrôlé en taille/type, stocké dans `logo_url` et propagé à la sidebar, au formulaire et au QR. Une migration vers un stockage objet dédié pourra être faite plus tard si nécessaire. |
| QR sur plusieurs téléphones | À confirmer par recette multi-appareils | Le lien public est sans session et le QR est généré avec correction d’erreur élevée et logo central. Il reste à tester sur les navigateurs et tailles d’écran cibles. |
| Signatures sur mobile | Implémenté côté code | La signature est convertie en data URI SVG et affichée dans le registre. Une vérification sur appareils iOS/Android réels reste recommandée. |
| Permissions Patron/Gérant/Staff | Implémenté et testé côté API | Les permissions sont contrôlées par les classes DRF et couvertes par les tests RBAC existants. Une recette manuelle par rôle reste recommandée. |
| Migration base de données production | Déclaré appliqué en production par le porteur | Les migrations locales passent, notamment branding et compatibilité SQLite. L’état de la base distante doit rester vérifié dans l’outil d’hébergement. |
| Variables d’environnement | À confirmer sur les environnements déployés | Le code lit `DATABASE_URL`, `SECRET_KEY`, `GOOGLE_CLIENT_ID`, `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS` et `CSRF_TRUSTED_ORIGINS`. Les valeurs ne sont pas présentes dans l’archive et doivent être contrôlées dans Vercel/Render/Railway. |
| Rafraîchissement du registre | Implémenté | Le dashboard recharge formulaire, registre et statistiques toutes les 30 secondes sans rechargement de page. |
| Statistiques | Implémenté | Volume total, volume du jour, heure de pointe, histogramme horaire et motifs fréquents sont exposés par `/api/v1/checkins/stats/`. |

## Points restant à faire

Les éléments suivants ne bloquent pas la V1.1 fonctionnelle, mais doivent être traités avant une ouverture commerciale large : recette navigateur mobile réelle, vérification des variables de production, contrôle de la migration distante, tests multi-tablettes, stratégie de stockage long terme des signatures et logos, validation juridique des pages légales et définition d’une durée de conservation des données visiteurs.

Les améliorations produit encore prévues sont la notification WhatsApp, l’impression de badge visiteur et la gestion de plusieurs formulaires par établissement. Elles restent hors de l’implémentation courante.

## Mise à jour de l’audit — 21 septembre 2026

La gestion de plusieurs formulaires et QR codes est maintenant présentée par des modales d’ajout guidé. Le branding de l’entreprise est réservé au patron côté API ; des endpoints dédiés permettent la suspension/suppression contrôlée de l’entreprise et la désactivation volontaire d’un gérant ou d’un membre du staff. L’onglet Entreprise, les confirmations d’actions sensibles et les états de connexion/déconnexion sont intégrés au frontend. Le feedback mobile est réduit à une pastille icône. Une migration Django ajoute `Organization.is_suspended`.


## Mise à jour de l’audit — 22 septembre 2026

La priorité 3 de sécurité est implémentée : CSP frontend, headers `X-Content-Type-Options`, `Referrer-Policy` et `Permissions-Policy`, durée de vie du JWT d’accès ramenée à 10 minutes, rotation et révocation par appareil des refresh tokens, et journalisation des connexions/déconnexions dans `AuditEvent`. Le refresh token brut n’est jamais stocké en base ; seul son JTI est associé à `RefreshSession`. Un refresh déjà consommé est refusé.

La pagination du registre est désormais serveur. Le dashboard charge 20 visites par page sur desktop et 10 sur mobile ; le total et les liens de navigation viennent de l’API. La couverture backend vérifie le parcours au-delà de 100 enregistrements et le plafonnement de la taille de page.

Les contrôles restant à exécuter en staging sont l’audit de dépendances npm (`npm audit`), la recette CSP avec le vrai domaine Google OAuth et le test multi-appareils des sessions rotatives.
