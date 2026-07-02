# Exercise 21 – Production ALB Ingress Setup

## Objective

Configure an AWS Application Load Balancer (ALB) to expose multiple applications running in Amazon EKS using path-based routing.

The ALB should support:

- SSL/TLS termination
- Automatic HTTP → HTTPS redirection
- Target Group Health Checks

---

# Architecture

```
                    Internet
                        │
                HTTPS (443)
                        │
        ┌────────────────────────────────┐
        │     AWS Application Load       │
        │          Balancer (ALB)        │
        └────────────────────────────────┘
              │        │          │
              ▼        ▼          ▼
          /api/*   /admin/*   /dashboard/*
              │        │          │
              ▼        ▼          ▼
        API Service  Admin     Dashboard
                     Service      Service
```

---

# Environment

- Amazon EKS
- Kubernetes
- AWS Load Balancer Controller
- AWS Application Load Balancer
- ACM Certificate

---

# Requirements

The ALB should expose three applications.

| Route | Backend Service |
|--------|-----------------|
| /api/* | api-service |
| /admin/* | admin-service |
| /dashboard/* | dashboard-service |

Additional Requirements

- SSL/TLS
- HTTP → HTTPS Redirect
- Target Group Health Checks

---

# Ingress Manifest

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress

metadata:
  name: production-ingress
  namespace: production

  annotations:

    kubernetes.io/ingress.class: alb

    alb.ingress.kubernetes.io/scheme: internet-facing

    alb.ingress.kubernetes.io/target-type: ip

    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:ap-south-1:ACCOUNT_ID:certificate/xxxxxxxx

    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP":80},{"HTTPS":443}]'

    alb.ingress.kubernetes.io/ssl-redirect: '443'

    alb.ingress.kubernetes.io/healthcheck-path: /health

spec:

  rules:

  - http:

      paths:

      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80

      - path: /admin
        pathType: Prefix
        backend:
          service:
            name: admin-service
            port:
              number: 80

      - path: /dashboard
        pathType: Prefix
        backend:
          service:
            name: dashboard-service
            port:
              number: 80
```

---

# Routing Flow

```
Client

↓

HTTPS

↓

AWS ALB

↓

/api

↓

API Service
```

```
Client

↓

HTTPS

↓

AWS ALB

↓

/admin

↓

Admin Service
```

```
Client

↓

HTTPS

↓

AWS ALB

↓

/dashboard

↓

Dashboard Service
```

---

# SSL Configuration

SSL termination is performed by AWS Application Load Balancer using an ACM certificate.

Traffic Flow

```
Client

↓

HTTPS

↓

AWS ALB

↓

HTTP

↓

Kubernetes Services
```

---

# HTTP to HTTPS Redirection

HTTP requests

```
http://example.com
```

Automatically redirect to

```
https://example.com
```

using

```
alb.ingress.kubernetes.io/ssl-redirect: '443'
```

---

# Health Checks

Target Group Health Check

```
Path

/health
```

Healthy targets receive traffic.

Unhealthy targets are automatically removed from the Target Group until they recover.

---

# Validation

## Verify Ingress

```bash
kubectl get ingress
```

---

## Describe Ingress

```bash
kubectl describe ingress production-ingress
```

---

## Verify ALB

```bash
aws elbv2 describe-load-balancers
```

---

## Verify Target Groups

```bash
aws elbv2 describe-target-groups
```

---

## Verify Target Health

```bash
aws elbv2 describe-target-health \
--target-group-arn <TARGET_GROUP_ARN>
```

---

# Components Used

| Component | Purpose |
|------------|---------|
| Amazon EKS | Kubernetes Platform |
| AWS ALB | External Load Balancer |
| AWS Load Balancer Controller | ALB Provisioning |
| Kubernetes Ingress | Routing Rules |
| ACM | SSL Certificate |
| Target Groups | Backend Registration |

---

# Commands Used

```bash
kubectl apply -f ingress.yaml

kubectl get ingress

kubectl describe ingress production-ingress

aws elbv2 describe-load-balancers

aws elbv2 describe-target-groups

aws elbv2 describe-target-health
```

---

# Screenshots

- Ingress Resource
- AWS ALB
- Target Groups
- Target Health
- SSL Certificate
- HTTP Redirect
- Successful Route Validation

---

# Lessons Learned

- AWS ALB supports path-based routing for multiple Kubernetes services.
- SSL termination should be handled using AWS Certificate Manager (ACM).
- Redirecting HTTP traffic to HTTPS improves application security.
- Health checks ensure only healthy backend pods receive traffic.
- AWS Load Balancer Controller automates ALB creation and lifecycle management.

---

# Conclusion

A production-ready AWS Application Load Balancer (ALB) configuration was designed to expose multiple applications running in Amazon EKS using path-based routing. The setup included SSL termination with AWS Certificate Manager, automatic HTTP-to-HTTPS redirection, and Target Group health checks to ensure secure and highly available access to backend services. This configuration follows AWS best practices for deploying production Kubernetes applications.