# Suivi des taches

Legende:
- `-` = todo
- `o` = en cours
- `x` = termine
- `--` = annule

---

## Contexte reprise (23-05-2026)

Migration GitHub → GitLab SaaS effectuée, double push configuré (un `git push` pousse sur les deux).
Beaucoup de fichiers locaux **non-commités** depuis le 17-05 : frontend (Vite + Express + Docker multi-stage),
nouveaux workflows CI (`deploy-frontend.yml`, `deploy-infra.yml`), script VPS (`setup-deploy-user.sh`).

**Stratégie arrêtée :**
- GitLab = centre DevOps (pipeline `.gitlab-ci.yml`, registry `registry.gitlab.com/damien-chaudois/portfolio`, déploiement VPS)
- GitHub = vitrine recruteurs (miroir code, les workflows `.github/workflows/` sont conservés pour la lisibilité mais ne tournent pas — secrets non configurés côté GitHub)

**Infos GitLab :**
- Branche : `master`
- Handle : `Damien-Chaudois` (GitLab normalise en minuscules dans les URLs : `damien-chaudois`)
- Registry image : `registry.gitlab.com/damien-chaudois/portfolio`

**Approche choisie :** commits progressifs — d'abord valider le pipeline GitLab + connexion SSH VPS, ensuite le reste.

---

## Tâches — dans l'ordre

### Étape 1 — Décision de stratégie CI ✓ (arrêtée)
- x **GitLab CI** = centre DevOps (pipeline, registry, déploiement VPS)
- x **GitHub** = vitrine recruteurs (miroir code en lecture seule, pas de CI)
  - Registry : `registry.gitlab.com` remplace `ghcr.io`
  - Les GitHub Actions workflows sont conservés dans `.github/workflows/` pour la lisibilité GitHub, mais ne tournent pas (secrets absents côté GitHub)

### Étape 2 — Créer `.gitlab-ci.yml` (pipeline minimal de test) ✓
- x Créer `.gitlab-ci.yml` : pipeline SSH → git pull → docker compose build → up -d → nginx reload
- x `docker-compose.yml` : ajout de `build: ./frontend` sur `portfolio-index` (requis pour build local VPS)
- x Supprimer les trois workflows GitHub Actions (`deploy.yml`, `deploy-frontend.yml`, `deploy-infra.yml`)
- - Configurer les variables CI/CD dans GitLab Settings : `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` ← **fait par l'utilisateur**
- - Commiter `.gitlab-ci.yml` + `docker-compose.yml` → push → vérifier le pipeline GitLab

### Étape 3 — Setup VPS : utilisateur deploy (état inconnu)
- - Vérifier sur le VPS si `setup-deploy-user.sh` a été exécuté (utilisateur `deploy` existe ?)
- - Si non : l'exécuter pour créer l'utilisateur dédié + configurer sa clé SSH
- - Mettre à jour `VPS_USER` dans les variables GitLab CI si passage `damien` → `deploy`

### Étape 4 — Nettoyer les workflows GitHub Actions
- - Supprimer l'ancien `deploy.yml` (stratégie git pull, obsolète)
- - Garder `deploy-frontend.yml` + `deploy-infra.yml` comme documentation lisible sur GitHub (ils ne tournent pas)

### Étape 5 — Compléter `.gitlab-ci.yml` (déploiement réel)
- - Étendre le pipeline : job infra (rsync `docker-compose.yml` + `nginx/conf.d/`) + job frontend (build image → push registry → SSH pull + restart)

### Étape 6 — Commiter le reste (frontend + infra)
- - Commiter tous les fichiers locaux restants : frontend, nginx, docker-compose, scripts VPS
- - Push → vérifier le pipeline complet de bout en bout

### Étape 7 — Mise à jour documentation
- - `documentation/architecture.md` + `configuration.md` : GitHub Actions → GitLab CI, ghcr.io → registry.gitlab.com
- - `README.md` : procédures de déploiement mises à jour

