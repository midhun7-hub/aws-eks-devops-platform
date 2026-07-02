# Exercise 20 – External Secrets Integration

## Objective

Integrate **AWS Secrets Manager** with **Amazon EKS** using the **External Secrets Operator** to automatically synchronize application secrets into Kubernetes.

The following secrets should be managed securely:

- DB_USERNAME
- DB_PASSWORD
- JWT_SECRET

The Kubernetes Secret should be created automatically without manually creating secrets inside the cluster.

---

# Architecture

```
AWS Secrets Manager
        │
        ▼
External Secrets Operator
        │
        ▼
External Secret
        │
        ▼
Kubernetes Secret
        │
        ▼
Application Pod
```

---

# Environment

- Amazon EKS
- Kubernetes
- AWS Secrets Manager
- External Secrets Operator
- IAM Roles for Service Accounts (IRSA)

---

# Objective

The integration enables Kubernetes applications to retrieve secrets securely from AWS Secrets Manager without manually creating Kubernetes Secrets.

Secrets stored in AWS:

```
DB_USERNAME

DB_PASSWORD

JWT_SECRET
```

These values are synchronized automatically into Kubernetes.

---

# Workflow

```
Store Secret

↓

AWS Secrets Manager

↓

External Secrets Operator

↓

External Secret

↓

Kubernetes Secret

↓

Application
```

---

# Implementation

## Step 1 – Store Secrets in AWS Secrets Manager

Create a secret containing

```
DB_USERNAME

DB_PASSWORD

JWT_SECRET
```

Example

```json
{
  "DB_USERNAME": "admin",
  "DB_PASSWORD": "password123",
  "JWT_SECRET": "my-secret-key"
}
```

---

## Step 2 – Configure Secret Store

Create a SecretStore (or ClusterSecretStore) that connects Kubernetes to AWS Secrets Manager.

Example

```yaml
provider:
  aws:
    service: SecretsManager
    region: ap-south-1
```

---

## Step 3 – Create External Secret

Example

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret

metadata:
  name: payment-secret

spec:

  refreshInterval: 1h

  secretStoreRef:
    name: aws-secret-store

  target:
    name: payment-secret

  dataFrom:
    - extract:
        key: payment-service-secret
```

The External Secrets Operator continuously synchronizes data from AWS Secrets Manager.

---

## Step 4 – Kubernetes Secret Creation

After synchronization

```bash
kubectl get secret
```

Expected

```
payment-secret
```

The Secret is created automatically.

---

## Step 5 – Application

The application consumes the Kubernetes Secret using environment variables.

Example

```yaml
envFrom:

- secretRef:
    name: payment-secret
```

---

# Validation

## Verify External Secret

```bash
kubectl get externalsecret
```

Expected

```
READY

True
```

---

## Verify Kubernetes Secret

```bash
kubectl get secret
```

Expected

```
payment-secret
```

---

## Describe External Secret

```bash
kubectl describe externalsecret payment-secret
```

Verify

```
SecretSynced

True
```

---

## Verify Secret Contents

```bash
kubectl describe secret payment-secret
```

The Kubernetes Secret should contain

- DB_USERNAME
- DB_PASSWORD
- JWT_SECRET

---

# Synchronization Flow

```
AWS Secret Updated

↓

External Secrets Operator

↓

Kubernetes Secret Updated

↓

Application Restart (if required)

↓

Latest Credentials Available
```

---

# Components Used

| Component | Purpose |
|-----------|---------|
| Amazon EKS | Kubernetes Platform |
| AWS Secrets Manager | Secret Storage |
| External Secrets Operator | Secret Synchronization |
| SecretStore | AWS Connection |
| External Secret | Secret Mapping |
| Kubernetes Secret | Application Secret |
| IRSA | Secure AWS Authentication |

---

# Commands Used

```bash
kubectl get externalsecret

kubectl describe externalsecret payment-secret

kubectl get secret

kubectl describe secret payment-secret
```

---

# Screenshots

- AWS Secrets Manager Secret
- SecretStore Configuration
- External Secret
- External Secret Status (READY=True)
- Kubernetes Secret
- Application Using Secret

---

# Lessons Learned

- AWS Secrets Manager provides centralized and secure secret management.
- External Secrets Operator eliminates manual Kubernetes Secret creation.
- Secret synchronization reduces operational overhead and improves security.
- IRSA should be used to grant the External Secrets Operator permission to access AWS Secrets Manager.
- Automatic synchronization ensures Kubernetes stays aligned with the latest secret values.

---

# Conclusion

AWS Secrets Manager was integrated with Amazon EKS using the External Secrets Operator to provide centralized secret management. The application secrets (`DB_USERNAME`, `DB_PASSWORD`, and `JWT_SECRET`) were stored in AWS Secrets Manager and synchronized automatically into a Kubernetes Secret. This approach eliminates manual secret management, improves security, and enables applications to consume secrets directly from Kubernetes while maintaining AWS as the source of truth.