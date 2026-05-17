# Suivi des taches

Legende:
- `-` = todo
- `o` = en cours
- `x` = termine
- `--` = annule

Taches conversation en cours:

## Isolation du user de déploiement

- x Adapter le REPO_URL dans `.github/scripts/setup-deploy-user.sh` (remplacer `<GITHUB_USER>`)
- x Exécuter `.github/scripts/setup-deploy-user.sh` sur le VPS (git clone remplacé par cp depuis ~/portfolio)
- x Générer une nouvelle paire de clés SSH dédiée à `deploy` (ancienne clé github_actions supprimée de damien)
- x Supprimer les fichiers `github_actions` et `github_actions.pub` de `/home/damien/.ssh/`
- x Mettre à jour le secret `SSH_PRIVATE_KEY` dans GitHub avec la nouvelle clé privée
- x Mettre à jour le secret `SSH_USER` dans GitHub → valeur : `deploy`
- x Tester le workflow (push sur master, vérifier les logs GitHub Actions)
- x Optionnel : supprimer `~/portfolio` de l'utilisateur `damien` (`rm -rf ~/portfolio`)

