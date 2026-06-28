# Exercise 18 – GitOps Platform Using ArgoCD

## Objective

Deploy Kubernetes applications using GitOps.

```
Git Commit
     ↓
GitHub Repository
     ↓
ArgoCD
     ↓
Kubernetes Cluster (EKS)
```

## Repository Structure

```
gitops/
├── dev
├── qa
└── prod
```

## Features

- GitOps deployment
- ArgoCD Application
- Auto Sync
- Self Heal
- Pruning
- Separate Dev, QA and Production environments

## Workflow

Developer updates Deployment YAML

↓

Pushes code to GitHub

↓

ArgoCD detects Git changes

↓

ArgoCD synchronizes the cluster

↓

Application is updated automatically

## Auto Sync

Automatically deploys Git changes.

## Self Heal

If someone manually changes Kubernetes resources, ArgoCD restores them to match Git.

## Pruning

Deletes Kubernetes resources that were removed from Git.