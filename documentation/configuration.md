# Configuration

Référence de toutes les valeurs concrètes : IPs, utilisateurs, noms de secrets, chemins de fichiers, et procédures de setup.

---

## Accès VPS

| Paramètre | Valeur |
|---|---|
| Fournisseur | Hetzner CX22 |
| IP publique | `178.104.116.214` |
| OS | Ubuntu 24.04 LTS |
| Utilisateur SSH | `damien` |
| Port SSH | `22` |
| Chemin du repo | `~/portfolio` |

Connexion locale : `ssh portfolio` (alias configuré dans `~/.ssh/config` en local)

---

## Cloudflare

| Paramètre | Valeur |
|---|---|
| Zone | `chaudois.com` |
| DNS wildcard | `*.damien.chaudois.com → 178.104.116.214` |
| Token API (chemin VPS) | `/etc/letsencrypt/cloudflare/credentials.ini` (chmod 600) |
| Usage du token | Validation DNS-01 pour renouvellement automatique du certificat wildcard |

---

## Certificat TLS

| Paramètre | Valeur |
|---|---|
| Type | Wildcard `*.damien.chaudois.com` |
| Fournisseur | Let's Encrypt via Certbot |
| Plugin Certbot | `python3-certbot-dns-cloudflare` |
| Chemin sur VPS | `/etc/letsencrypt/live/damien.chaudois.com/` |
| Renouvellement | Automatique via `certbot.timer` |

---

## GitHub Actions — Secrets

Secrets à configurer dans `Settings > Secrets and variables > Actions` du repo portfolio_root :

| Secret | Description | Valeur |
|---|---|---|
| `SSH_PRIVATE_KEY` | Clé privée ed25519 dédiée à GitHub Actions | Contenu de `~/.ssh/portfolio_actions` |
| `SSH_HOST` | IP du VPS | `178.104.116.214` |
| `SSH_USER` | Utilisateur SSH de déploiement | `damien` |

Secret à configurer dans chaque repo projet :

| Secret | Description |
|---|---|
| `PORTFOLIO_DISPATCH_TOKEN` | PAT GitHub avec scope `repo` sur portfolio_root |

---

## Préparer la clé SSH GitHub Actions

```bash
# Vérifier si une clé GitHub Actions est déjà autorisée sur le VPS
cat ~/.ssh/authorized_keys

# Si absente — générer une clé dédiée (en local ou sur le VPS)
ssh-keygen -t ed25519 -C "github-actions@portfolio" -f ~/.ssh/portfolio_actions

# Ajouter la clé publique au VPS
ssh-copy-id -i ~/.ssh/portfolio_actions.pub damien@178.104.116.214

# La clé PRIVÉE est la valeur à coller dans le secret SSH_PRIVATE_KEY
cat ~/.ssh/portfolio_actions
```

---

## Variables d'environnement runtime

Le fichier `.env` à la racine est ignoré par Git — il contient les secrets runtime (token webhook, etc.). Aucun secret ne doit apparaître dans le dépôt.

---

## Comptes requis

- [Hetzner Cloud](https://www.hetzner.com/cloud) — pour provisionner le VPS
- [Cloudflare](https://cloudflare.com) — DNS autoritaire sur le domaine
- [GitHub](https://github.com) — sources, CI/CD, registry d'images
- Un domaine, délégué à Cloudflare

---

## Outils locaux requis

- SSH client avec clé ed25519 dédiée au projet
- VS Code + extension Remote SSH (optionnel mais recommandé)
- Git

---

## Setup initial du VPS

Étapes effectuées lors du provisionning initial :

- User non-root `damien` avec sudo, login root SSH désactivé, auth par mot de passe désactivée
- UFW : ports 22, 80, 443 ouverts
- Fail2ban sur sshd
- Swap 2Go, swappiness=10
- Docker Engine + Docker Compose plugin
- Certbot + plugin `python3-certbot-dns-cloudflare`
- Certificat wildcard `*.damien.chaudois.com` généré et stocké dans `/etc/letsencrypt/live/`
- Token API Cloudflare dans `/etc/letsencrypt/cloudflare/credentials.ini` (chmod 600)
