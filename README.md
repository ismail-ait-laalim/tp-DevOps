# TP DevOps de groupe – Tasks App

Application 3 services : **frontend** (nginx), **backend** (Node/Express), **base de données** (PostgreSQL).

## Environnements
| Env  | Où                         | Branche | Tag image | Accès                      |
|------|----------------------------|---------|-----------|----------------------------|
| Dev  | poste de chaque membre     | `dev`   | `dev`     | `docker compose up` → :8080 |
| Val  | K8s (poste hôte), ns `val` | `val`   | `val`     | `http://<IP_HOTE>:30080`   |
| Prod | K8s (poste hôte), ns `prod`| `main`  | `prod`    | `http://<IP_HOTE>:30081`   |

## Méthodologie (Git flow simplifié)
1. Chaque membre crée `feature/<nom>-<feature>` depuis `dev`, teste en local (`docker compose up --build`).
2. Pull Request → `dev` (CI : tests). Merge → images `:dev` poussées sur Docker Hub.
3. Promotion : PR `dev` → `val` (déploiement auto sur K8s Val), validation, puis PR `val` → `main` (déploiement Prod).
Ordre obligatoire : **Dev → Val → Prod**.

## Pipeline CI/CD (`.github/workflows/ci-cd.yml`)
- `test` : tests backend
- `build-push` : build + push des images sur Docker Hub (un seul compte pour tout le groupe)
- `deploy` : `kubectl apply -k k8s/overlays/<env>` via un runner GitHub **self-hosted** sur le poste qui héberge K8s

Secrets GitHub à créer : `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`.

## Mise en place K8s (sur le poste hôte)
```bash
# cluster local : minikube / kind / k3s / Docker Desktop
# runner : Settings > Actions > Runners > New self-hosted runner
kubectl apply -k k8s/overlays/val
kubectl apply -k k8s/overlays/prod
```
(remplacer `DOCKERHUB_USER` dans `k8s/` par votre compte si déploiement manuel ; le workflow le fait automatiquement.)

## Features individuelles (3 chacun)
- Membre A : supprimer une tâche, marquer comme faite, compteur de tâches
- Membre B : modifier une tâche, filtrer (faites / à faire), date d'échéance
- Membre C : recherche, priorité, tri par date
