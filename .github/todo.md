# Suivi des taches

Legende:
- `-` = todo
- `o` = en cours
- `x` = termine
- `--` = annule

Taches conversation en cours:

## GitHub Actions — mise en place complète

- x Vérifier le port SSH sur le VPS : port 22 confirmé
- x Vérifier si une clé SSH GitHub Actions existe déjà dans `~/.ssh/authorized_keys` sur le VPS : clé `github-actions-deploy` présente
- x Configurer les 3 secrets dans GitHub (`Settings > Secrets and variables > Actions`) : SSH_HOST, SSH_PRIVATE_KEY, SSH_USER confirmés présents
- o Tester le workflow : pousser un commit sur master et vérifier les logs GitHub Actions
- Vérifier que `docker compose pull` ne bloque pas sur l'auth ghcr.io (si images privées, configurer `docker login ghcr.io` sur le VPS)

