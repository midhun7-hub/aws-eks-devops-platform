# Exercise 1 – EKS Application Deployment via GitOps

## Objective

Deploy the **payment-service** application to an Amazon EKS cluster using a complete GitOps workflow.

The deployment pipeline integrates GitHub Actions, Amazon ECR, ArgoCD, Helm, AWS Secrets Manager, IAM Roles for Service Accounts (IRSA), AWS ALB Ingress Controller, Prometheus, and Grafana.

---

# Architecture

```
Developer
     │
     ▼
GitHub Repository
     │
     ▼
GitHub Actions
(Build & Push Docker Image)
     │
     ▼
Amazon ECR
     │
     ▼
ArgoCD (Auto Sync)
     │
     ▼
Amazon EKS
     │
     ▼
Helm Deployment
     │
     ├────────► AWS Secrets Manager
     │              │
     │              ▼
     │            IRSA
     │
     ▼
Payment Service
     │
     ▼
AWS ALB Ingress
     │
     ▼
Users

Metrics
Payment Service
     │
     ▼
Prometheus
     │
     ▼
Grafana
```

---

# Environment

- Amazon EKS
- Kubernetes
- Docker
- GitHub
- GitHub Actions
- Amazon ECR
- ArgoCD
- Helm
- AWS Secrets Manager
- IAM Roles for Service Accounts (IRSA)
- AWS Load Balancer Controller
- Prometheus
- Grafana

---

# Deployment Workflow

```
Code Commit

        │

GitHub Actions

        │

Build Docker Image

        │

Push Image to Amazon ECR

        │

ArgoCD Detects Git Changes

        │

Helm Chart Deployment

        │

Deploy to Amazon EKS

        │

Application Available Through ALB

        │

Metrics Collected by Prometheus

        │

Dashboards Available in Grafana
```

---

# Implementation

## Step 1 – Build Docker Image

The payment-service application was containerized using Docker.

Docker image was built and tagged.

```bash
docker build -t payment-service .
```

---

## Step 2 – Push Image to Amazon ECR

The Docker image was pushed to Amazon Elastic Container Registry.

Example image

```
payment-service:dashboard-v4
```

---

## Step 3 – Configure GitHub Actions

GitHub Actions was configured to automate the CI pipeline.

Pipeline responsibilities

- Checkout source code
- Build Docker image
- Authenticate with Amazon ECR
- Push Docker image
- Update deployment manifests

---

## Step 4 – Helm Deployment

Application deployment was managed using a Helm Chart.

Helm managed

- Deployment
- Service
- Ingress
- Configurations
- Resource limits

This enabled repeatable and version-controlled deployments.

---

## Step 5 – GitOps Deployment Using ArgoCD

ArgoCD monitored the Git repository.

Auto Sync was enabled.

Whenever changes were committed to GitHub,

```
Git Commit

↓

ArgoCD Detects Change

↓

Automatically Deploys

↓

Cluster Updated
```

No manual kubectl deployment was required.

---

## Step 6 – AWS Secrets Manager

Application secrets were stored securely in AWS Secrets Manager.

Sensitive information such as

- Database credentials
- API Keys
- Redis Passwords

were managed outside Kubernetes manifests.

---

## Step 7 – IAM Roles for Service Accounts (IRSA)

IRSA was configured to allow Kubernetes workloads to securely access AWS services.

Benefits

- No hardcoded AWS credentials
- Least privilege access
- Secure communication with AWS Secrets Manager

---

## Step 8 – AWS ALB Ingress

AWS Load Balancer Controller automatically provisioned an Application Load Balancer.

Traffic flow

```
Internet

↓

AWS ALB

↓

Kubernetes Ingress

↓

Payment Service
```

Application became accessible through the ALB endpoint.

---

## Step 9 – Monitoring

Application metrics were exposed.

Prometheus collected metrics from the payment service.

Grafana displayed

- CPU Usage
- Memory Usage
- Request Rate
- Response Time
- Custom Application Metrics

---

# Validation

The following components were verified during deployment.

## Verify Pods

```bash
kubectl get pods
```

Pods reached the **Running** state.

---

## Verify Services

```bash
kubectl get svc
```

Service exposed the payment application.

---

## Verify Ingress

```bash
kubectl get ingress
```

AWS ALB endpoint was successfully created.

---

## Verify ArgoCD

Application status

```
Healthy

Synced
```

---

## Verify Metrics

Grafana dashboards displayed application metrics collected by Prometheus.

---

# Commands Used

```bash
docker build -t payment-service .

docker push <ECR_IMAGE>

kubectl get pods

kubectl get svc

kubectl get ingress

kubectl rollout status deployment/payment-service

helm install payment-service

argocd app sync payment-service
```

---

# Components Used

| Component | Purpose |
|------------|---------|
| GitHub | Source Code Repository |
| GitHub Actions | CI Pipeline |
| Amazon ECR | Docker Image Registry |
| Helm | Kubernetes Package Management |
| ArgoCD | GitOps Deployment |
| Amazon EKS | Kubernetes Cluster |
| AWS Secrets Manager | Secret Storage |
| IRSA | Secure AWS Authentication |
| AWS ALB | External Application Access |
| Prometheus | Metrics Collection |
| Grafana | Monitoring Dashboard |

---

# Screenshots

- GitHub Repository
- GitHub Actions Workflow
- Amazon ECR Repository
- ArgoCD Application (Healthy & Synced)
- Running Kubernetes Pods
- Kubernetes Service
- ALB Ingress
- Grafana Dashboard

---

# Lessons Learned

- GitOps enables fully automated Kubernetes deployments.
- Helm simplifies application packaging and version management.
- ArgoCD continuously reconciles cluster state with Git.
- AWS Secrets Manager removes the need for hardcoded secrets.
- IRSA provides secure access to AWS resources without storing credentials.
- Prometheus and Grafana provide complete application observability.

---

# Conclusion

The **payment-service** was successfully deployed to Amazon EKS using a complete GitOps workflow. GitHub Actions automated the container build and image push to Amazon ECR, while ArgoCD synchronized the Helm deployment to the Kubernetes cluster. AWS Secrets Manager and IRSA ensured secure secret management, the AWS ALB Ingress exposed the application externally, and Prometheus with Grafana provided real-time monitoring. This exercise demonstrated an end-to-end production-ready deployment pipeline following modern DevOps and GitOps best practices.