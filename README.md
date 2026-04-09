# portfolio_root

Infrastructure du portfolio freelance fullstack .NET de Damien Chaudois, accessible sur [damien.chaudois.com](https://damien.chaudois.com).

Ce repo contient uniquement l'**infrastructure** — reverse proxy, TLS, orchestration Docker. Le code des projets eux-mêmes vit dans des repos séparés, chacun déployé comme un container indépendant.

Le but de ce projet est pour moi de monter en compétence tout en démontrant ma maitrise pour d'éventuels recruteurs qui souhaiterais juger mon niveau de maitrise sur du développement fullstack.

J'ai été assisté pour tout ce projet par un LLM 


## Intention

L'objectif est une infrastructure modulaire capable d'héberger N projets indépendants, chacun sur son propre sous-domaine, sans modifier l'infra existante pour en ajouter un nouveau. Ajouter un projet se résume à :

1. Créer un repo GitHub avec son Dockerfile
2. Ajouter un service dans `docker-compose.yml`
3. Ajouter un bloc `server {}` dans `nginx/conf.d/`
4. Pousser — le webhook déclenche le déploiement automatiquement

---

## Architecture

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
   │   Lint + test + build image + push ghcr.io
   └──▶ Webhook → container adnanh/webhook
                      └──▶ docker compose pull + up -d
```

**Pourquoi Docker directement sur le host et pas Kubernetes ?**
Le CX22 a 4GB de RAM. K8s consomme ~2GB rien que pour le control plane. Docker Compose laisse presque toute la RAM aux projets. Un kata dédié démontrera K3s (Kubernetes léger) pour montrer la maîtrise de l'orchestration sans l'imposer à toute l'infra.

**Pourquoi Nginx configuré à la main et pas Traefik ?**
Traefik et Caddy automatisent la configuration du reverse proxy mais cachent la mécanique. La configuration Nginx explicite démontre la compréhension du routing HTTP, de la terminaison TLS, et des headers de sécurité.

**Pourquoi un wildcard cert et pas un cert par sous-domaine ?**
Un seul certificat `*.damien.chaudois.com` couvre tous les sous-domaines actuels et futurs. La validation DNS-01 via l'API Cloudflare permet de l'obtenir et de le renouveler automatiquement sans exposer de port HTTP au moment du renouvellement.

---

## Structure du routing docker & nginx

```
portfolio_root/
├── docker-compose.yml          # Orchestration de tous les services
└── nginx/
    ├── conf.d/
    │   ├── default.conf        # Redirection HTTP → HTTPS globale
    │   └── damien.conf         # Bloc HTTPS pour damien.chaudois.com
    └── logs/                   # Ignoré par Git — logs runtime Nginx
```

Un fichier de config par projet dans `nginx/conf.d/` — nommé `<projet>.conf`. Nginx charge automatiquement tous les fichiers `*.conf` de ce dossier au démarrage ou au reload. Nginx est donc une image docker et possède 3 volumes : 

- ./nginx/conf.d:/etc/nginx/conf.d:ro
- /etc/letsencrypt:/etc/letsencrypt:ro
- ./nginx/logs:/var/log/nginx 

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
| Webhook | adnanh/webhook | Léger, sans dépendances, configuration explicite |

---

## Prérequis 

### Comptes et accès

- Compte [Hetzner Cloud](https://www.hetzner.com/cloud) — pour provisionner le VPS
- Compte [Cloudflare](https://cloudflare.com) — DNS autoritaire sur le domaine
- Compte [GitHub](https://github.com) — sources, CI/CD, registry d'images
- Un domaine, délégué à Cloudflare

### Outils locaux

- SSH client avec clé ed25519 dédiée au projet
- VS Code + extension Remote SSH (optionnel mais recommandé)
- Git

### Setup du VPS

Le VPS a été préparé selon les étapes suivantes (voir `docs/setup.md`) :

- User non-root avec sudo, login root SSH désactivé, auth par mot de passe désactivée
- UFW : ports 22, 80, 443 ouverts
- Fail2ban sur sshd
- Swap 2Go, swappiness=10
- Docker Engine + Docker Compose plugin
- Certbot + plugin `python3-certbot-dns-cloudflare`
- Certificat wildcard `*.damien.chaudois.com` dans `/etc/letsencrypt/live/`
- Token API Cloudflare dans `/etc/letsencrypt/cloudflare/credentials.ini` (chmod 600)

### Variables d'environnement (todo)

Le fichier `.env` est ignoré par Git — il contient les secrets runtime (token webhook, etc.).

---

## Déploiement

### Premier déploiement

```bash
# Cloner le repo sur le VPS
git clone https://github.com/Damien-Chaudois/portfolio_root.git ~/portfolio
cd ~/portfolio

# Démarrer les services
docker compose up -d
```

### Ajouter un nouveau projet

1. **DNS** — aucune modification nécessaire, le wildcard `*.damien.chaudois.com` couvre tout
2. **docker-compose.yml** — ajouter un service :

```yaml
kata-mon-projet:
  image: ghcr.io/damien-chaudois/kata-mon-projet:latest
  container_name: kata-mon-projet
  restart: unless-stopped
  networks:
    - portfolio
```

3. **nginx/conf.d/kata-mon-projet.conf** — ajouter un bloc server :

```nginx
server {
    listen 443 ssl;
    server_name kata-mon-projet.damien.chaudois.com;

    ssl_certificate     /etc/letsencrypt/live/damien.chaudois.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/damien.chaudois.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://kata-mon-projet:PORT;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

4. **Pousser** — GitHub Actions build l'image, le webhook déclenche `docker compose pull && up -d`

### Recharger Nginx sans downtime

```bash
docker compose exec nginx nginx -s reload
```

---

## Sécurité

- Login root SSH désactivé — accès uniquement via user `damien` avec clé SSH ed25519
- Auth par mot de passe SSH désactivée — uniquement clés SSH
- Fail2ban bannit les IPs après 5 échecs SSH en 10 minutes
- UFW : seuls les ports 22, 80, 443 sont ouverts
- TLS 1.0 et 1.1 désactivés — uniquement TLSv1.2 et TLSv1.3
- Certificats Let's Encrypt renouvelés automatiquement (certbot.timer)
- Token Cloudflare limité à la zone `chaudois.com`, stocké en chmod 600
- Secrets runtime dans `.env`, jamais dans Git
- Images Docker tirées depuis ghcr.io — registry privé, authentification requise

---

## Monitoring et observabilité  (todo)

Dashboard Grafana + Prometheus pour visualiser l'état des services, la charge CPU/RAM, l'uptime, et les métriques Nginx.

---

## Environnements de validation  (todo)

Chaque projet disposera d'un environnement de staging accessible sur `validation.<projet>.damien.chaudois.com`, déployé automatiquement depuis la branche `develop` via GitHub Actions. Ce pattern reproduit les workflows de release standard en entreprise (dev → staging → prod).
