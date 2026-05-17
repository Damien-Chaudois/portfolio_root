# portfolio_root

Infrastructure du portfolio freelance fullstack .NET de Damien Chaudois, accessible sur [damien.chaudois.com](https://damien.chaudois.com).

Ce repo contient uniquement l'**infrastructure** — reverse proxy, TLS, orchestration Docker. Le code des projets eux-mêmes vit dans des repos séparés, chacun déployé comme un container indépendant.

Le but de ce projet est pour moi de monter en compétence tout en démontrant ma maitrise pour d'éventuels recruteurs qui souhaiterais juger mon niveau de maitrise sur du développement fullstack.

J'ai été assisté pour tout ce projet par un LLM.

## Intention

L'objectif est une infrastructure modulaire capable d'héberger N projets indépendants, chacun sur son propre sous-domaine, sans modifier l'infra existante pour en ajouter un nouveau. Ajouter un projet se résume à :

1. Créer un repo GitHub avec son Dockerfile
2. Ajouter un service dans `docker-compose.yml`
3. Ajouter un bloc `server {}` dans `nginx/conf.d/`
4. Pousser — le workflow CI/CD déclenche le déploiement automatiquement

---

## Documentation

- [documentation/architecture.md](documentation/architecture.md) — Diagramme, choix techniques, stack, flux CI/CD, sécurité
- [documentation/configuration.md](documentation/configuration.md) — IPs, utilisateurs, secrets GitHub, chemins de fichiers, setup VPS

---

## Déploiement

### Premier déploiement

```bash
git clone https://github.com/Damien-Chaudois/portfolio_root.git ~/portfolio
cd ~/portfolio
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

4. **Pousser** — le repo projet build et pousse l'image sur ghcr.io, puis déclenche un `repository_dispatch` sur portfolio_root

### Recharger Nginx sans downtime

```bash
docker compose exec nginx nginx -s reload
```
