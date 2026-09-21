# Runbook production — QR Register SaaS

## Pré-déploiement staging

Depuis `backend/`, injecter les secrets du gestionnaire de secrets de l’hébergeur puis lancer `python scripts/verify_production.py`. Le contrôle refuse `DEBUG=True`, une clé Django trop courte, `ALLOWED_HOSTS=*`, les origines CORS/CSRF génériques, une absence de `DATABASE_URL`, Cloudinary incomplet ou un mot de passe administrateur trop court. Les garde-fous ne s’exécutent plus à l’import pendant le build Render ; ils restent obligatoires avant le démarrage/staging via ce script, ce qui évite un échec de compilation lorsque Render injecte les secrets uniquement au runtime.

Lancer ensuite `python manage.py migrate`, `python manage.py collectstatic --noinput`, `pytest -q` et une requête HTTPS vers `/api/v1/health/`. Contrôler dans les en-têtes la présence de `X-Request-ID`, `Strict-Transport-Security`, `X-Content-Type-Options` et `X-Frame-Options`.

Définir également `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` et `CLOUDINARY_API_SECRET` dans Render. Les courbes du registre sont rendues côté navigateur avec Recharts à partir de `/checkins/stats/` ; aucune donnée graphique supplémentaire n’est persistée.

## Sauvegarde et restauration

Créer une sauvegarde PostgreSQL custom-format avec `DATABASE_URL=... BACKUP_DIR=./backups ./scripts/backup_postgres.sh`. Le script crée un dump horodaté et son checksum SHA-256. Tester la restauration sur une base temporaire avec `DATABASE_URL=... ./scripts/restore_postgres.sh ./backups/qr-register-YYYYMMDDTHHMMSSZ.dump`. Ne jamais restaurer directement la base de production sans fenêtre de maintenance et validation humaine.

La procédure de restauration doit être exécutée périodiquement sur un environnement isolé ; vérifier ensuite `python manage.py check`, le nombre de migrations, la présence d’une organisation de test et le fonctionnement d’un QR public. Conserver les dumps chiffrés selon la politique de rétention du fournisseur PostgreSQL.

## Monitoring

Configurer le health check de l’hébergeur sur `/api/v1/health/`. Les logs de requêtes contiennent uniquement méthode, chemin, statut, durée et identifiant de corrélation ; ils ne doivent pas recevoir de token, cookie ou réponse formulaire. Configurer `NEXT_PUBLIC_WEB_VITALS_ENDPOINT` vers un collecteur first-party si les Core Web Vitals doivent être persistés ; sans cette variable, les métriques restent uniquement visibles en développement.

## Contrat API

Le schéma versionné est généré dans `docs/openapi.yaml`. Le endpoint staging est `/api/schema/` et l’interface de consultation est `/api/docs/`. Toute modification d’endpoint doit régénérer le fichier et faire passer les tests backend et frontend associés.
