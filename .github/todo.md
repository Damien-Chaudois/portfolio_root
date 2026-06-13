# Suivi des taches

Legende:

- `-` = todo
- `o` = en cours
- `x` = termine
- `--` = annule

---

## Contexte (25-05-2026)

**Stratégie arrêtée :**

- GitLab = centre DevOps (pipeline `.gitlab-ci.yml`, déploiement SSH VPS)
- GitHub = vitrine recruteurs (miroir, aucun CI côté GitHub)
- Frontend = HTML/CSS/JS statique servi directement par Nginx depuis `./frontend/dist` (volume monté) — pas de Node, pas de build

**Infos GitLab :**

- Branche : `master`
- Handle : `Damien-Chaudois` (URLs en minuscules : `damien-chaudois`)

**Constat VPS du 13-06-2026 :**

- Repo actif : `/var/www/portfolio`
- Branche en place : `master`, HEAD `adb87cd` (`add GitHub Actions workflow for SSH deployment`)
- Docker : seul le service `nginx` tourne, aucun container `portfolio-index`
- Nginx : `nginx/conf.d/damien.conf` renvoie encore un texte simple, pas la page portfolio statique
- Utilisateur SSH `deploy` : présent sur la machine

---

## Tâches — dans l'ordre

### Étape 1 — Stratégie CI ✓

- x GitLab CI choisi, GitHub = miroir passif

### Étape 2 — Mise en place CI + frontend statique ✓

- x `.gitlab-ci.yml` : SSH → git pull → nginx reload
- x `docker-compose.yml` : suppression `portfolio-index`, volume `./frontend/dist:/var/www/portfolio:ro`
- x `nginx/conf.d/damien.conf` : `root /var/www/portfolio` + `try_files`
- x `frontend/dist/index.html` + `favicon.svg` : page portfolio statique créée
- x Fichiers Node/Vite/Express supprimés
- x Workflows GitHub Actions supprimés
- x Variables GitLab CI configurées (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`)

### Étape 3 — Premier déploiement ← en cours

- - Commiter et pousser tous les fichiers modifiés
- - Vérifier que le pipeline GitLab passe (SSH + git pull + nginx reload)
- x Vérifier manuellement sur le VPS : `docker compose up -d` pour supprimer l'ancien container `portfolio-index` (constaté : seul `nginx` tourne)
- - Vérifier que `damien.chaudois.com` affiche la page portfolio

### Étape 4 — Setup VPS : utilisateur deploy (confirmé)

- x Vérifier si l'utilisateur `deploy` existe sur le VPS (`id deploy`)
- - Mettre à jour `VPS_USER` dans les variables GitLab CI si passage `damien` → `deploy`

### Étape 5 — Mise à jour documentation

- - `documentation/architecture.md` : GitHub Actions → GitLab CI, supprimer références Docker frontend
- - `documentation/configuration.md` : mettre à jour les secrets (GitHub → GitLab CI variables)
- - `README.md` : procédures de déploiement mises à jour
