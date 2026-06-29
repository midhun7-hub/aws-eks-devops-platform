# Exercise 3 - ArgoCD OutOfSync Production Incident

## Objective

Investigate an ArgoCD application reporting:

- Sync Status: OutOfSync
- Health Status: Healthy

## Scenario

Git desired state:

Replicas: 2

Live cluster:

Replicas: 5

A manual kubectl scale command caused configuration drift.

## Investigation

Observed the following:

- ArgoCD detected OutOfSync
- Application remained Healthy
- DIFF view showed:

Git:
replicas: 2

Live:
replicas: 5

## Root Cause

Deployment was manually modified outside Git using:

kubectl scale deployment payment-service --replicas=5 -n payment

## Investigation Steps

- Verified deployment
- Viewed ArgoCD DIFF
- Compared Git vs Live state
- Confirmed configuration drift

## Prevention

- Enable Auto Sync
- Enable Self Heal
- Restrict kubectl access using RBAC
- Use Git as the single source of truth
- Enable Kubernetes Audit Logs

## Outcome

Successfully reproduced and resolved an ArgoCD OutOfSync incident.