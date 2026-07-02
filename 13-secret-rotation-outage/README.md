# Exercise 13 – Secret Rotation Outage Investigation

## Objective

Investigate why the application started returning **401 Unauthorized** responses after a secret rotation in AWS Secrets Manager.

The objective was to determine why the updated secret did not propagate to Kubernetes and identify the cause of the authentication failure.

---

# Architecture

```
AWS Secrets Manager
        │
        ▼
External Secrets Controller
        │
        ▼
Kubernetes Secret
        │
        ▼
Application
        │
        ▼
Token Validation
```

---

# Environment

- Amazon EKS
- Kubernetes
- AWS Secrets Manager
- External Secrets Operator
- Kubernetes Secrets

---

# Incident

## Symptoms

Following a secret rotation in AWS Secrets Manager, users started receiving:

```
401 Unauthorized
```

Application Logs

```
Token validation failed
```

Kubernetes Secret

```bash
kubectl get secret payment-secret
```

Observation

```
Last Updated

2 weeks ago
```

---

# Investigation

## Step 1 – Verify Kubernetes Secret

```bash
kubectl get secret payment-secret
```

Observed

```
Secret Exists

Last Updated

2 weeks ago
```

Although the secret existed, it had not been updated after the rotation in AWS Secrets Manager.

---

## Step 2 – Verify Secret Contents

```bash
kubectl describe secret payment-secret
```

Confirmed that the Kubernetes Secret still contained the previous credentials.

---

## Step 3 – Verify External Secret

```bash
kubectl get externalsecret
```

Check

```
READY

True / False
```

If the External Secret is not synchronizing, the Kubernetes Secret will remain outdated.

---

## Step 4 – Verify External Secrets Controller

```bash
kubectl logs deployment/external-secrets-controller \
-n external-secrets
```

Look for

- Authentication errors
- AccessDeniedException
- Sync failures
- Refresh errors

---

## Step 5 – Verify Application

The application reads the Kubernetes Secret during startup.

Because the Secret still contained the old value,

```
Token Validation

↓

Authentication Failed

↓

401 Unauthorized
```

---

# Investigation Flow

```
AWS Secret Rotated

↓

External Secret Did Not Refresh

↓

Kubernetes Secret Still Old

↓

Application Uses Old Secret

↓

Token Validation Failed

↓

401 Unauthorized
```

---

# Root Cause Analysis

The secret was successfully rotated in AWS Secrets Manager, but the updated value was **never propagated to Kubernetes**.

Possible causes

- External Secrets synchronization failed.
- Refresh interval was too long.
- External Secrets Controller was not running.
- Missing IAM permissions.
- Application was still using an old Kubernetes Secret.

The Kubernetes Secret timestamp clearly indicated

```
Last Updated

2 weeks ago
```

confirming that synchronization never occurred.

---

# Immediate Resolution

## Step 1

Force External Secret synchronization.

```bash
kubectl annotate externalsecret payment-secret \
force-sync=$(date +%s)
```

or restart the controller.

```bash
kubectl rollout restart deployment external-secrets-controller \
-n external-secrets
```

---

## Step 2

Verify the Kubernetes Secret.

```bash
kubectl get secret payment-secret
```

The update timestamp should now reflect the latest synchronization.

---

## Step 3

Restart the application.

```bash
kubectl rollout restart deployment payment-service
```

The application reloads the latest credentials during startup.

---

## Step 4

Verify authentication.

```
HTTP 200 OK

Authentication Successful
```

---

# Root Cause

| Component | Status |
|------------|--------|
| AWS Secrets Manager | Secret Rotated |
| External Secrets | Did Not Synchronize |
| Kubernetes Secret | Outdated |
| Application | Using Old Secret |
| Authentication | Failed |

---

# Why Secret Rotation Did Not Propagate

The rotation occurred successfully in AWS Secrets Manager, but the Kubernetes Secret was **never refreshed**.

Possible reasons include:

- External Secrets Operator failed to synchronize.
- Refresh interval had not yet elapsed.
- IAM/IRSA permissions prevented reading the updated secret.
- Controller was unavailable.
- The application only reads secrets during startup and was never restarted.

As a result, the application continued validating tokens using the **old secret**, causing authentication failures.

---

# Commands Used

```bash
kubectl get secret payment-secret

kubectl describe secret payment-secret

kubectl get externalsecret

kubectl describe externalsecret

kubectl logs deployment/external-secrets-controller \
-n external-secrets

kubectl rollout restart deployment payment-service
```

---

# Screenshots

- Application Logs
- Kubernetes Secret
- Secret Last Updated Timestamp
- External Secret Status
- External Secrets Controller Logs
- Deployment Restart
- Successful Authentication

---

# Lessons Learned

- Rotating a secret in AWS Secrets Manager does not automatically update Kubernetes unless synchronization is functioning correctly.
- Always verify the **Last Updated** timestamp of Kubernetes Secrets after rotation.
- Monitor the External Secrets Controller for synchronization failures.
- Applications that load secrets only during startup require a rollout restart after secret updates.
- Implement alerts for stale Kubernetes Secrets and failed secret synchronizations.

---

# Conclusion

A production authentication outage occurred because a rotated secret in AWS Secrets Manager was **not propagated** to the Kubernetes Secret used by the application. As a result, the application continued using outdated credentials, causing token validation failures and HTTP **401 Unauthorized** responses. Restoring synchronization, updating the Kubernetes Secret, and restarting the application resolved the issue and highlighted the importance of automated secret synchronization and monitoring.