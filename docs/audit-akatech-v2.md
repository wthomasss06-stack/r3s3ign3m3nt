# Audit AKATech v2 — QR Register SaaS

**Date :** 21 septembre 2026  
**Périmètre :** backend Django/DRF, frontend Next.js/PWA, sécurité, UX, documentation et release gate.  
**Skills utilisés :** `akatech-backend-architect`, `akatech-frontend-architect`, `akatech-qa-release-gate`, `akatech-documentation-expert`, `akatech-readme`.

## Verdict

### Statut : PASS AVEC RÉSERVES — release technique non recommandée avant correction des dépendances critiques

Le projet compile et ses tests fonctionnels passent. Un défaut de sécurité lié à la suspension des entreprises a été trouvé pendant l’audit et corrigé : les permissions d’organisation, les QR publics et la synchronisation offline refusent désormais une entreprise suspendue. La couverture reste insuffisante sur les parcours navigateur réels et les dépendances frontend présentent huit vulnérabilités de production, dont une critique signalée sur Next.js ; ce point doit être traité avant une mise en production commerciale.

## Vérifications exécutées

| Domaine | Résultat | Preuve |
|---|---:|---|
| Migrations Django | Pass | `python manage.py makemigrations --check` : aucune modification détectée |
| Backend | Pass | **24 tests passants** |
| Frontend TypeScript | Pass | `npm run type-check` |
| Build Next.js | Pass | `npm run build`, 22 routes générées |
| Skills AKATech | Pass | 16 skills installés et validés par `quick_validate.py` |
| Secret réel dans le code | Aucun trouvé | Les valeurs repérées sont des exemples/documentation |
| RBAC organisation suspendue | Corrigé | Permission serveur, QR public et sync offline couverts par test |

## Blocants avant production

### 1. Vulnérabilités npm de production

`npm audit --omit=dev` remonte **8 vulnérabilités** : 1 critique, 6 élevées et 1 modérée. La chaîne est principalement liée à `next@14.2.35`, `next-pwa`/Workbox, PostCSS, Rollup Terser, `serialize-javascript` et `uuid`. Le build fonctionne mais le release gate sécurité reste bloqué tant que les versions compatibles et la stratégie PWA n’ont pas été mises à jour puis retestées.

**Action recommandée :** créer une branche de mise à jour, vérifier la compatibilité Next.js/App Router, remplacer ou mettre à jour `next-pwa` si nécessaire, relancer `npm audit`, le build et les tests de parcours offline avant déploiement.

### 2. Recette sécurité et navigateur encore manuelle

Les tests backend couvrent le RBAC et l’IDOR, mais la recette QA exige encore des tentatives réelles avec plusieurs rôles, organisations, appareils et refresh de session dans un navigateur staging. Il faut notamment vérifier qu’un gérant, un staff ou un QR d’une entreprise suspendue reçoit bien une réponse contrôlée et ne conserve pas un accès via cache/service worker.

### 3. Configuration de production non prouvée

Les variables Render/Vercel/Neon ne sont pas auditables depuis l’archive. Il faut confirmer `DEBUG=False`, `SECRET_KEY` d’au moins 32 octets, `ALLOWED_HOSTS`, CORS/CSRF, cookies Secure/SameSite, les migrations de production, les backups et les domaines HTTPS.

## Erreurs et risques corrigés pendant cet audit

- Une entreprise suspendue pouvait encore résoudre son QR public et recevoir une fiche offline. Les requêtes filtrent maintenant `is_suspended=False`.
- `IsOrgMember` ne tenait pas compte de la suspension. Le contrôle serveur l’intègre désormais.
- `IsBossOrGerant` pouvait encore autoriser des opérations courantes pendant une suspension. Le contrôle est désormais refusé.
- Une non-régression couvre l’accès public et la synchronisation d’une entreprise suspendue.
- Quatre frontmatters de skills fournis étaient invalides ; les metadata ont été normalisées et les 16 skills passent maintenant la validation.

## Fonctionnalités encore incomplètes par rapport au besoin produit

| Sujet | État | Travail restant |
|---|---|---|
| Formulaires multiples | Implémenté | Ajouter tests E2E création/modification/suppression sur mobile |
| QR multiples | Implémenté | Tester expiration/suppression/caches offline sur vrais appareils |
| Onglet Entreprise | Implémenté | Remplacer le champ URL du logo par un upload validé et stocké, si l’upload est requis |
| Suppression d’un membre/invitation | Partiel | Ajouter endpoints Patron pour révoquer une invitation ou retirer un membre avec raison et audit |
| Message « plus membre du staff » | Non livré | Ajouter un état de révocation et un écran de refus explicite à la prochaine connexion |
| Déconnexion/accueil | Implémenté UI | Vérifier les textes et le refresh sur navigateur réel |
| Persistance session | Implémentée par refresh cookie | Ajouter un test E2E multi-onglet, expiration et reprise après cold start |
| Admin plateforme | Implémenté | Vérifier la persistance réelle de session admin et séparer clairement le rôle BOSS entreprise de l’accès plateforme |
| API contract/OpenAPI | Partiel | Générer et versionner un schéma OpenAPI synchronisé avec le frontend |
| Observabilité | Partiel | Ajouter logs structurés, corrélation de requêtes, monitoring et alertes |
| Sauvegardes | Non prouvé | Documenter et tester restauration PostgreSQL/Neon |
| A11y/responsive | Non prouvé | Recette clavier, lecteurs d’écran, contrastes et viewport 320/375 px |
| Performance | Non prouvé | Mesurer Core Web Vitals sur staging et poids réellement servi des images |

## Réserves techniques

- Les tests affichent un avertissement de clé JWT de développement trop courte ; utiliser une clé d’au moins 32 octets en production.
- Django signale l’absence de `backend/staticfiles/` dans l’environnement de test ; lancer `collectstatic` dans le pipeline et vérifier le déploiement WhiteNoise.
- Le frontend utilise encore `navigator.onLine` pour déclencher la synchronisation offline ; un vrai `NetworkMonitor` avec ping API serait plus fiable selon le guide frontend.
- L’administration plateforme utilise un indicateur `localStorage` comme marqueur UX. Ce n’est pas la preuve d’autorisation, mais le parcours doit être testé après refresh, expiration et ouverture d’un nouvel onglet.
- Les pages légales indiquent encore que la forme juridique, le RCCM et l’adresse complète d’AKATech Studio sont à formaliser. Une validation juridique reste nécessaire.

## Plan d’action priorisé

1. **P0 — sécurité :** mettre à niveau Next.js/PostCSS/Workbox et supprimer les vulnérabilités npm de production.
2. **P0 — production :** vérifier secrets, HTTPS, cookies, CORS/CSRF, migrations et backups sur staging.
3. **P1 — accès équipe :** implémenter révocation d’invitation/membre, message de prochaine connexion et journal d’audit.
4. **P1 — qualité :** ajouter E2E Playwright pour login, refresh, formulaires, QR, suspension et mobile.
5. **P1 — contrat :** générer OpenAPI et vérifier les réponses d’erreur standardisées avec le frontend.
6. **P2 — robustesse :** NetworkMonitor, logs structurés, monitoring, restauration testée et mesure Core Web Vitals.
7. **P2 — contenu :** finaliser les informations juridiques et refaire une revue légale avant commercialisation.

## Fichiers modifiés dans ce cycle d’audit

- `backend/apps/common/permissions.py`
- `backend/apps/checkins/services.py`
- `backend/apps/checkins/views.py`
- `backend/apps/checkins/tests/test_sync.py`
- `docs/audit-akatech-v2.md`

Le zip livré pour ce cycle ne contient que ces fichiers, en conservant leurs chemins relatifs dans le projet.
