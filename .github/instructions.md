# instructions.md

## Instructions pour les agents

Avant toute action ou analyse, lire les fichiers de documentation suivants :

- `README.md` — Vue d'ensemble du projet, intention, et procédures de déploiement rapide
- `documentation/architecture.md` — Architecture technique, diagramme d'infrastructure, choix de stack et leurs justifications, flux CI/CD complet, politique de sécurité
- `documentation/configuration.md` — (optionel, au besoin) Toutes les valeurs concrètes : IP du VPS, utilisateurs SSH, noms des secrets GitHub, chemins de fichiers sur le VPS, setup initial, comptes requis

Si après avoir lû ces fichiers et la requête il reste des points à éclaircire pour mener à bien la tâche, propose à l'utilisateur de mettre à jour le fichier de documentation concerné de sorte à ce que le prochain agent n'ai pas besoin de poser la même question.

le connexion au vps est possible via ssh en utilisant `ssh portfolio`. l'utilisateur ne te donneras jamais le mot de passe sudo, si tu en as besoin, tu dois notifier l'utilisateur pour qu'il focus le terminal en cours d'utilisation et rentre lui même le mot de passe.

ce projet as un but de formation. Tâche de commenter les commandes linux ou tout code générer pour permettre à l'utilisateur d'apprendre leur fonctionnement, surtout les flags de commande.

## Logs de suivie de progression

l'avancement du projet est suivie dans deux types de fichiers : le fichier TODO principale /.github/todo.md suit l'avancement de la tâche en cours. une fois une tâche terminé, l'ajouter au log du jour dans le dosser /.github/progress_log. ces fichier fonctiont comme suit :
- si le fichier du jour n'existe pas, le créer. Le nom du fichier doit être la date du jour au format dd-mm-yyyy.md
- sinon, ne pas modifier les logs déjà présent, seulement ajouter ce qui as été fait de ton coté
- les logs ne doivent contenir qu'une rapide descrption de l'action effectué avec assez de détail pour qu'un agent qui relit ce log comprenne l'action faite
-  tu peut ajouter des détails qui ne relève pas des actions effectués si tu pense qu'un agent est susceptible de rencontrer des problème s'il n'as pas connaissance de cette information.

le fichier principale devrais être purgé de tous ces items terminé au démarage d'une nouvelle conversation, et ses items terminés rangé dans le fichier log du jour, bien qu'ils devrait déjàs en principe s'y trouvé de par le fonctionnement décrit plus haut. si c'est le cas, ne pas les remplacer, simplement nettoyer le fichier todo.md