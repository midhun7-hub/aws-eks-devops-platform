# Exercise 23 – Build CI/CD Pipeline

## Objective

Build a production-ready CI/CD pipeline that automatically builds, tests, secures, and deploys the application to Amazon EKS using GitHub Actions, Amazon ECR, and ArgoCD.

The pipeline should automatically stop deployment if:

- Unit tests fail
- Security scan detects critical vulnerabilities

---

# Architecture

```
Developer
     │
     ▼
GitHub Push
     │
     ▼
GitHub Actions
     │
     ├────────► Unit Tests
     │
     ├────────► Security Scan
     │
     ├────────► Docker Build
     │
     └────────► Push Image to Amazon ECR
                         │
                         ▼
               Update GitOps Repository
                         │
                         ▼
                     ArgoCD
                         │
                         ▼
                  Amazon EKS Cluster
```

---

# Environment

- GitHub
- GitHub Actions
- Docker
- Amazon ECR
- Amazon EKS
- ArgoCD
- Maven
- JUnit

---

# CI/CD Workflow

```
Git Push

↓

GitHub Actions

↓

Unit Tests

↓

Security Scan

↓

Docker Build

↓

Push Image to Amazon ECR

↓

Update Kubernetes Manifest

↓

Git Push

↓

ArgoCD Auto Sync

↓

Deploy to Amazon EKS
```

---

# Pipeline Stages

## Stage 1 – Source Code Checkout

The workflow starts when code is pushed to GitHub.

```yaml
on:
  push:
    branches:
      - main
```

---

## Stage 2 – Unit Testing

The application is tested using Maven and JUnit.

```bash
mvn test
```

If any test fails,

the pipeline stops immediately.

---

## Stage 3 – Security Scan

The Docker image (or source code) is scanned for vulnerabilities.

Example tools

- Trivy
- GitHub CodeQL

If critical vulnerabilities are detected,

the deployment is blocked.

---

## Stage 4 – Docker Build

Build the application image.

```bash
docker build -t payment-service .
```

---

## Stage 5 – Push Image to Amazon ECR

Authenticate with Amazon ECR.

Push the latest image.

```bash
docker push <ECR_IMAGE>
```

---

## Stage 6 – GitOps Update

Update the Kubernetes deployment manifest or Helm values with the new image tag.

Commit the changes to the GitOps repository.

---

## Stage 7 – ArgoCD Deployment

ArgoCD detects the Git repository change.

Auto Sync deploys the new version to Amazon EKS.

Application rollout begins automatically.

---

# Validation

## Verify GitHub Actions

Workflow completes successfully.

All stages pass.

---

## Verify Docker Image

Confirm the image exists in Amazon ECR.

---

## Verify ArgoCD

Application status

```
Healthy

Synced
```

---

## Verify Kubernetes

```bash
kubectl get pods
```

New application version is running successfully.

---

# Failure Scenarios

## Unit Test Failure

```
Git Push

↓

Unit Tests

↓

FAILED

↓

Pipeline Stops
```

No Docker image is built.

No deployment occurs.

---

## Security Scan Failure

```
Git Push

↓

Security Scan

↓

Critical Vulnerability Found

↓

Pipeline Stops
```

Image is not pushed to Amazon ECR.

Application is not deployed.

---

# Commands Used

```bash
mvn test

docker build -t payment-service .

docker push <ECR_IMAGE>

kubectl get pods

kubectl rollout status deployment/payment-service
```

---

# Components Used

| Component | Purpose |
|-----------|---------|
| GitHub | Source Code Repository |
| GitHub Actions | CI/CD Automation |
| Maven | Build Tool |
| JUnit | Unit Testing |
| Docker | Containerization |
| Amazon ECR | Image Registry |
| ArgoCD | GitOps Deployment |
| Amazon EKS | Kubernetes Platform |

---

# Screenshots

- GitHub Repository
- GitHub Actions Workflow
- Unit Test Results
- Docker Build
- Amazon ECR Repository
- ArgoCD Application
- Running Pods

---

# Lessons Learned

- Automated CI/CD pipelines reduce manual deployment effort.
- Unit testing prevents faulty code from reaching production.
- Security scanning helps identify vulnerabilities before deployment.
- GitOps ensures Kubernetes deployments remain synchronized with Git.
- ArgoCD provides continuous reconciliation and automated deployments.

---

# Conclusion

A production-ready CI/CD pipeline was designed using GitHub Actions, Docker, Amazon ECR, and ArgoCD. The pipeline automates source code validation, unit testing, container image creation, image publishing, and GitOps-based deployment to Amazon EKS. The pipeline is designed to fail immediately if unit tests fail or if critical security vulnerabilities are detected, ensuring that only validated and secure application versions are deployed to the Kubernetes cluster.