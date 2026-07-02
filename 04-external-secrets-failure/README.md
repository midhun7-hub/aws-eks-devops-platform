# Exercise 4 – External Secrets Failure Investigation

## Objective

Investigate why the application failed to start because the database password could not be retrieved from AWS Secrets Manager through External Secrets.

The goal was to determine whether the issue originated from AWS, Kubernetes, or the secret configuration.

---

# Architecture

```
Application Pod
        │
        ▼
Environment Variable

(DB_PASSWORD)

        │
        ▼
Kubernetes Secret
        │
        ▼
External Secret
        │
        ▼
External Secrets Controller
        │
        ▼
AWS Secrets Manager
```

---

# Environment

- Amazon EKS
- Kubernetes
- External Secrets Operator
- AWS Secrets Manager
- IAM Roles for Service Accounts (IRSA)

---

# Incident

## Symptoms

Application failed during startup.

Application Logs

```
FATAL

Database password not found

Environment Variable

DB_PASSWORD missing
```

---

External Secret Status

```bash
kubectl get externalsecret
```

Output

```
READY=False
```

---

Describe Output

```
SecretSyncedError

AccessDeniedException

User is not authorized to perform

secretsmanager:GetSecretValue
```

---

# Investigation

## Step 1 – Verify External Secret

```bash
kubectl get externalsecret
```

Observed

```
READY=False
```

The External Secret was not successfully synchronized.

---

## Step 2 – Describe External Secret

```bash
kubectl describe externalsecret
```

Observed

```
SecretSyncedError

AccessDeniedException
```

This confirmed that synchronization failed before the Kubernetes Secret could be created.

---

## Step 3 – Inspect External Secrets Controller

```bash
kubectl logs deployment/external-secrets-controller \
-n external-secrets
```

Observed

```
AccessDeniedException

secretsmanager:GetSecretValue
```

The controller was unable to retrieve the secret from AWS Secrets Manager.

---

## Step 4 – Verify Kubernetes Secret

```bash
kubectl get secret
```

Expected

```
database-secret
```

Observed

```
Not Found
```

Since synchronization failed, the Kubernetes Secret was never created.

---

## Step 5 – Verify Application Deployment

```bash
kubectl describe deployment payment-service
```

Application expected

```
DB_PASSWORD
```

from

```
database-secret
```

Because the Secret was missing,

the environment variable was never injected.

---

# Investigation Flow

```
AWS Secrets Manager

↓

External Secrets Controller

↓

External Secret

↓

Kubernetes Secret

↓

Environment Variable

↓

Application Startup
```

Failure occurred between

```
External Secrets Controller

↓

AWS Secrets Manager
```

---

# Root Cause Analysis

Application Startup

↓

DB_PASSWORD Missing

↓

Kubernetes Secret Missing

↓

External Secret Not Synced

↓

AccessDeniedException

↓

External Secrets Controller

↓

AWS IAM Permission Missing

---

The root cause was **AWS IAM permission failure**.

The External Secrets Controller did not have permission to call

```
secretsmanager:GetSecretValue
```

As a result

- External Secret failed
- Kubernetes Secret was not created
- Environment Variable was missing
- Application startup failed

---

# Resolution

## 1. Update IAM Role

Grant permission

```json
secretsmanager:GetSecretValue
```

for the required secret.

---

## 2. Verify IRSA

Ensure the External Secrets Controller ServiceAccount is associated with the correct IAM Role.

---

## 3. Restart External Secrets Controller

```bash
kubectl rollout restart deployment external-secrets-controller \
-n external-secrets
```

---

## 4. Verify External Secret

```bash
kubectl get externalsecret
```

Expected

```
READY=True
```

---

## 5. Verify Kubernetes Secret

```bash
kubectl get secret
```

Expected

```
database-secret
```

---

## 6. Restart Application

```bash
kubectl rollout restart deployment payment-service
```

Application successfully retrieved

```
DB_PASSWORD
```

and started normally.

---

# Root Cause

| Layer | Status |
|--------|--------|
| AWS Secrets Manager | Healthy |
| External Secrets Controller | Permission Denied |
| External Secret | Failed |
| Kubernetes Secret | Missing |
| Application | Startup Failed |

---

# Commands Used

```bash
kubectl get externalsecret

kubectl describe externalsecret

kubectl logs deployment/external-secrets-controller \
-n external-secrets

kubectl get secret

kubectl describe deployment payment-service

kubectl rollout restart deployment external-secrets-controller

kubectl rollout restart deployment payment-service
```

---

# Screenshots

- External Secret Status
- External Secret Describe Output
- External Secrets Controller Logs
- Missing Kubernetes Secret
- Application Logs
- External Secret Healthy
- Application Running

---

# Lessons Learned

- External Secrets depends on both Kubernetes configuration and AWS IAM permissions.
- A missing Kubernetes Secret often indicates that synchronization failed upstream.
- Always inspect the External Secrets Controller logs when an External Secret is not ready.
- IRSA permissions must include `secretsmanager:GetSecretValue` for successful synchronization.
- Application startup failures can originate from secret synchronization issues rather than application code.

---

# Conclusion

The application failed to start because the required `DB_PASSWORD` environment variable was unavailable. Investigation showed that the External Secret could not synchronize with AWS Secrets Manager due to an `AccessDeniedException` on the `secretsmanager:GetSecretValue` API. This prevented the Kubernetes Secret from being created, resulting in a missing environment variable and application startup failure. Updating the IAM permissions for the External Secrets Controller, verifying IRSA configuration, and restarting the controller restored secret synchronization and resolved the issue.