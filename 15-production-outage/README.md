# Exercise 15 – Complete Production Outage

## Objective

Investigate and resolve a complete production outage where users received **HTTP 503 Service Unavailable** even though Kubernetes infrastructure appeared healthy.

---

# Scenario

## Timeline

| Time | Event |
|------|-------|
| 08:55 | Redis password rotated in AWS Secrets Manager |
| 09:00 | New application deployment completed successfully |
| 09:05 | Users started receiving HTTP 503 |
| 09:06 | Application logs showed Redis connection failures |
| 09:07 | Redis logs showed authentication failures |
| 09:10 | Root cause identified |
| 09:12 | Application restarted |
| 09:13 | Service restored |

---

# Incident

## Symptoms

- HTTP 503 returned to users
- Application unavailable
- Deployment completed successfully
- Kubernetes cluster healthy

---

# Evidence Collected

## 1. Verify Application Pods

```bash
kubectl get pods -A
```

Observation

- All application pods were in **Running** state.
- No CrashLoopBackOff.
- No pod failures.

---

## 2. Verify Services

```bash
kubectl get svc -A
```

Observation

- Kubernetes Services were healthy.
- ClusterIP services were reachable.

---

## 3. Verify Ingress

```bash
kubectl get ingress -A
```

Observation

- AWS ALB Ingress was healthy.
- External endpoint available.
- No Ingress routing issues.

---

## 4. Application Logs

```bash
kubectl logs app-log-demo -n payment
```

Output

```
Connecting to Redis...
ERROR Cannot connect to Redis
Redis authentication failed
```

Observation

Application failed while authenticating with Redis.

---

## 5. Simulate Secret Rotation

Create initial Redis Secret.

```bash
kubectl create secret generic redis-secret \
--from-literal=password=oldpassword \
-n payment
```

Delete existing Secret.

```bash
kubectl delete secret redis-secret -n payment
```

Create rotated Secret.

```bash
kubectl create secret generic redis-secret \
--from-literal=password=newpassword \
-n payment
```

---

## 6. Verify Kubernetes Secret

```bash
kubectl describe secret redis-secret -n payment
```

Observation

```
Type: Opaque

password: 11 bytes
```

The Kubernetes Secret now contains the new password.

---

## 7. Recover Application

Restart deployment.

```bash
kubectl rollout restart deployment payment-service -n payment
```

Verify rollout.

```bash
kubectl rollout status deployment payment-service -n payment
```

Output

```
deployment "payment-service" successfully rolled out
```

---

# Investigation

## ArgoCD

Status

```
Healthy
```

Deployment completed successfully.

No synchronization issues.

---

## Pods

Status

```
Running
```

No crashes observed.

---

## Ingress

Status

```
Healthy
```

Traffic successfully reached the application.

---

## Secret Manager

Redis password rotated successfully at **08:55**.

---

## External Secrets

External Secrets synchronized the updated password to Kubernetes.

---

## Kubernetes Secret

Redis password updated successfully.

---

## Application

Application continued using the old Redis credentials.

Application logs

```
Cannot connect to Redis
```

---

## Redis

Redis rejected incoming connections.

Redis logs

```
Authentication failed
```

---

# Root Cause Analysis

```
AWS Secrets Manager
        │
        ▼
Secret Rotated
        │
        ▼
External Secrets Synced
        │
        ▼
Kubernetes Secret Updated
        │
        ▼
Application Continued Using Old Password
        │
        ▼
Redis Authentication Failed
        │
        ▼
HTTP 503 Returned
```

---

# Root Cause

The Redis password was successfully rotated and synchronized into Kubernetes.

However, the running application continued using the previously loaded credentials because it did not automatically reload the updated Secret.

Redis rejected the outdated credentials, causing the application to fail all Redis connections and return **HTTP 503** responses.

---

# Immediate Fix

Restart the application deployment.

```bash
kubectl rollout restart deployment payment-service -n payment
```

Verify deployment.

```bash
kubectl rollout status deployment payment-service -n payment
```

Application successfully reloaded the updated Secret and resumed normal operation.

---

# Long-Term Prevention

- Enable automatic pod restart after Secret updates.
- Use External Secrets automatic refresh.
- Avoid caching credentials inside the application.
- Implement Redis readiness and liveness checks.
- Validate Secret rotation in staging before production.
- Perform controlled Secret rotations during maintenance windows.

---

# Monitoring Improvements

Create alerts for:

- HTTP 503 error rate
- Redis authentication failures
- Secret rotation events
- External Secret synchronization failures
- Kubernetes Secret update failures
- Pod restart count
- Redis connection failures
- Application health endpoint failures

---

# Commands Used

```bash
kubectl get pods -A

kubectl get svc -A

kubectl get ingress -A

kubectl logs app-log-demo -n payment

kubectl create secret generic redis-secret --from-literal=password=oldpassword -n payment

kubectl delete secret redis-secret -n payment

kubectl create secret generic redis-secret --from-literal=password=newpassword -n payment

kubectl describe secret redis-secret -n payment

kubectl rollout restart deployment payment-service -n payment

kubectl rollout status deployment/payment-service -n payment
```

---

# Screenshots Collected

- Kubernetes Pods
- Kubernetes Services
- Kubernetes Ingress
- Application Logs
- Kubernetes Secret
- Deployment Restart
- Successful Rollout

---

# Conclusion

The production outage was **not caused by Kubernetes infrastructure**. ArgoCD, Pods, Services, and Ingress were all healthy.

The root cause was a **credential mismatch after Redis Secret rotation**. Although the Secret was successfully updated inside Kubernetes, the application continued using the previously loaded password until it was restarted. Restarting the deployment forced the application to reload the updated Secret, restoring Redis connectivity and resolving the HTTP 503 outage.
