# Suivi des taches

Legende:
- `-` = todo
- `o` = en cours
- `x` = termine
- `--` = annule

Taches conversation en cours:

## GitHub Actions — mise en place complète

- Vérifier le port SSH sur le VPS : `sudo sshd -T | grep port` (probablement 22)
- Vérifier si une clé SSH GitHub Actions existe déjà dans `~/.ssh/authorized_keys` sur le VPS
- Si absente : générer une clé ed25519 dédiée et l'ajouter au VPS (voir README section "Préparer la clé SSH GitHub Actions")
- Configurer les 3 secrets dans GitHub (`Settings > Secrets and variables > Actions`) :
  - `SSH_PRIVATE_KEY` — clé privée ed25519 dédiée
  - `SSH_HOST` — `178.104.116.214`
  - `SSH_USER` — `damien`
- Tester le workflow en poussant un commit sur master et vérifier les logs GitHub Actions
- Vérifier que `docker compose pull` ne bloque pas sur l'auth ghcr.io (si images privées, configurer `docker login ghcr.io` sur le VPS)

