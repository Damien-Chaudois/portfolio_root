# Architecture

## Vue d'ensemble

Infrastructure modulaire pour héberger N projets indépendants, chacun sur son propre sous-domaine. Ajouter un projet ne nécessite pas de modifier l'infra existante.

## Diagramme

```
Internet
   │
   ▼
Cloudflare DNS (*.damien.chaudois.com → 178.104.116.214)
   │
   ▼
VPS Hetzner CX22 — Ubuntu 24.04
   │
   ▼
Nginx (container Docker) — TLS termination
   │
   ├──▶ damien.chaudois.com        → container portfolio-index
   ├──▶ kata-X.damien.chaudois.com → container kata-X
   └──▶ validation.kata-X.damien.chaudois.com → container kata-X (env staging)

GitHub Actions (CI/CD)
   ├──▶ Repos projets : lint + test + build image + push ghcr.io
   │                    └──▶ repository_dispatch → portfolio_root
   └──▶ portfolio_root : SSH → VPS
                              └──▶ git pull + docker compose pull + up -d + nginx reload
```

---

## Choix techniques

### Pourquoi Docker Compose et pas Kubernetes ?

Le CX22 a 4GB de RAM. K8s consomme ~2GB rien que pour le control plane. Docker Compose laisse presque toute la RAM aux projets. Un kata dédié démontrera K3s (Kubernetes léger) pour montrer la maîtrise de l'orchestration sans l'imposer à toute l'infra.

### Pourquoi Nginx configuré à la main et pas Traefik ?

Traefik et Caddy automatisent la configuration du reverse proxy mais cachent la mécanique. La configuration Nginx explicite démontre la compréhension du routing HTTP, de la terminaison TLS, et des headers de sécurité.

### Pourquoi un wildcard cert et pas un cert par sous-domaine ?

Un seul certificat `*.damien.chaudois.com` couvre tous les sous-domaines actuels et futurs. La validation DNS-01 via l'API Cloudflare permet de l'obtenir et de le renouveler automatiquement sans exposer de port HTTP au moment du renouvellement.

---

## Structure des fichiers

```
portfolio_root/
├── docker-compose.yml          # Orchestration de tous les services
└── nginx/
    ├── conf.d/
    │   ├── default.conf        # Redirection HTTP → HTTPS globale
    │   └── damien.conf         # Bloc HTTPS pour damien.chaudois.com
    └── logs/                   # Ignoré par Git — logs runtime Nginx
```

Un fichier de config par projet dans `nginx/conf.d/` — nommé `<projet>.conf`. Nginx charge automatiquement tous les fichiers `*.conf` de ce dossier au démarrage ou au reload.

Nginx est une image Docker avec 3 volumes montés :

- `./nginx/conf.d:/etc/nginx/conf.d:ro`
- `/etc/letsencrypt:/etc/letsencrypt:ro`
- `./nginx/logs:/var/log/nginx`

---

## Stack

| Composant | Choix | Justification |
|---|---|---|
| VPS | Hetzner CX22 | 4,35€/mois, mains dans le cambouie |
| OS | Ubuntu 24.04 LTS | Support 5 ans, base de référence pour Docker |
| Reverse proxy | Nginx (Alpine) | Contrôle explicite, pas de magie |
| TLS | Let's Encrypt + Certbot | Gratuit, renouvellement automatique |
| DNS | Cloudflare | API pour validation DNS-01, protection DDoS optionnelle |
| Orchestration | Docker Compose | Suffisant pour N containers légers, lisible |
| CI/CD | GitHub Actions | Intégré à GitHub, gratuit pour repos publics |
| Registry | GitHub Container Registry (ghcr.io) | Intégré à GitHub, gratuit |

---

## CI/CD — Flux de déploiement

Ce repo est le **point de déploiement central** : il est le seul à exécuter les commandes Docker sur le VPS. Les repos de projets (katas) ne gèrent pas leur propre infra — ils construisent et poussent leur image sur ghcr.io, puis délèguent le redéploiement à ce repo via un `repository_dispatch` GitHub.

**Flux complet :**

1. Le repo projet build son image et la pousse sur `ghcr.io/damien-chaudois/<projet>:latest`
2. Il déclenche un `repository_dispatch` sur portfolio_root via l'API GitHub (`event-type: deploy`)
3. Le workflow `.github/workflows/deploy.yml` se connecte en SSH au VPS
4. Il exécute : `git pull → docker compose pull → docker compose up -d → nginx reload`

Ce même workflow est aussi déclenché sur tout push sur `master` de ce repo (modification de config infra).

**Comment un repo projet déclenche le déploiement :**

Le repo projet doit avoir un secret `PORTFOLIO_DISPATCH_TOKEN` (PAT GitHub avec scope `repo` sur portfolio_root) et appeler :

```yaml
- name: Trigger portfolio deploy
  uses: peter-evans/repository-dispatch@v3
  with:
    token: ${{ secrets.PORTFOLIO_DISPATCH_TOKEN }}
    repository: Damien-Chaudois/portfolio_root
    event-type: deploy
```

---

## Sécurité

- Login root SSH désactivé — accès uniquement via user dédié avec clé SSH ed25519
- Auth par mot de passe SSH désactivée — uniquement clés SSH
- Fail2ban bannit les IPs après 5 échecs SSH en 10 minutes
- UFW : seuls les ports 22, 80, 443 sont ouverts
- TLS 1.0 et 1.1 désactivés — uniquement TLSv1.2 et TLSv1.3
- Certificats Let's Encrypt renouvelés automatiquement (certbot.timer)
- Token Cloudflare limité à la zone `chaudois.com`, stocké en chmod 600
- Secrets runtime dans `.env`, jamais dans Git
- Images Docker tirées depuis ghcr.io — registry privé, authentification requise

---

## Monitoring et observabilité (todo)

Dashboard Grafana + Prometheus pour visualiser l'état des services, la charge CPU/RAM, l'uptime, et les métriques Nginx.

---

## Environnements de validation (todo)

Chaque projet disposera d'un environnement de staging accessible sur `validation.<projet>.damien.chaudois.com`, déployé automatiquement depuis la branche `develop` via GitHub Actions. Ce pattern reproduit les workflows de release standard en entreprise (dev → staging → prod).
