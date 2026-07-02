# Exercise 11 – CrashLoopBackOff Investigation

## Objective

Investigate a Kubernetes pod entering the **CrashLoopBackOff** state, identify the root cause, and recover the application safely.

This exercise demonstrates how to troubleshoot application startup failures using Kubernetes logs, events, pod descriptions, and deployment configuration.

---

# Environment

- Amazon EKS
- Kubernetes
- Docker
- kubectl

---

# Incident

## Symptoms

Application pod entered the **CrashLoopBackOff** state.

Evidence provided:

```
kubectl get pods

payment-service

CrashLoopBackOff
```

Application logs

```
panic:
dial tcp 10.20.0.15:5432

connection refused
```

Pod Events

```
Back-off restarting failed container
```

---

# Investigation Checklist

The following possible causes were investigated.

- DNS Issue
- Database Issue
- Kubernetes Secret Issue
- Application Startup Failure

---

# Investigation

## Step 1 – Verify Pod Status

```bash
kubectl get pods -n payment
```

Initially, the payment service was healthy.

To simulate the incident, a dedicated CrashLoopBackOff demonstration deployment was created.

---

## Step 2 – Simulate CrashLoopBackOff

A deployment named **crashloop-demo** was created using the BusyBox image.

The container intentionally exited with status code **1** after printing an application panic message.

Container Command

```bash
echo "panic: dial tcp 10.20.0.15:5432: connection refused"

exit 1
```

This forced Kubernetes to continuously restart the container.

---

## Step 3 – Observe Pod Status

```bash
kubectl get pods -n payment -w
```

Observed

```
Running

↓

Error

↓

Restarting

↓

CrashLoopBackOff
```

Restart count increased after every failed startup.

---

## Step 4 – Describe the Pod

```bash
kubectl describe pod crashloop-demo-xxxxx -n payment
```

Important observations

Container State

```
Terminated

Reason

Error

Exit Code

1
```

Restart Count

```
Restart Count: 5
```

Events

```
Back-off restarting failed container
```

---

## Step 5 – Inspect Container Logs

```bash
kubectl logs crashloop-demo-xxxxx -n payment
```

Application output

```
panic:
dial tcp 10.20.0.15:5432

connection refused
```

The application failed immediately during startup because it could not establish a database connection.

---

## Step 6 – Verify Deployment Configuration

Deployment configuration was inspected.

```bash
kubectl describe deployment crashloop-demo -n payment
```

Verified

- Container image
- Startup command
- Resources
- Restart policy

The failure was caused by the intentionally configured startup command.

---

# Investigation Flow

```
Application

↓

Startup

↓

Database Connection Attempt

↓

Connection Refused

↓

Container Exit

↓

Kubernetes Restart

↓

CrashLoopBackOff
```

---

# Root Cause Analysis

The simulated application exited immediately during startup.

```
Database Connection Failed

↓

Application Panic

↓

Exit Code 1

↓

Container Terminated

↓

Automatic Restart

↓

CrashLoopBackOff
```

The issue was **not caused by**

- Kubernetes DNS
- Kubernetes Secret
- Kubernetes Networking

The failure originated inside the application startup process.

---

# Resolution

The CrashLoopBackOff demonstration deployment was removed after the investigation.

```bash
kubectl delete deployment crashloop-demo -n payment
```

Verification

```bash
kubectl get pods -n payment
```

Observed

- CrashLoop demo removed
- Payment service healthy
- Cluster returned to normal state

---

# Commands Used

```bash
kubectl get pods -n payment

kubectl get pods -n payment -w

kubectl describe pod crashloop-demo-xxxxx -n payment

kubectl logs crashloop-demo-xxxxx -n payment

kubectl describe deployment crashloop-demo -n payment

kubectl delete deployment crashloop-demo -n payment
```

---

# Screenshots

- CrashLoopBackOff Pod
- Pod Description
- Container Logs
- Restart Count
- Back-off Events
- Pod Recovery
- Deployment Deleted

---

# Lessons Learned

- Always inspect pod status before making changes.
- Use **kubectl describe pod** to understand restart reasons and events.
- Review application logs to identify startup failures.
- CrashLoopBackOff is a symptom, not the root cause.
- Application errors, configuration issues, missing dependencies, or failed database connections are common reasons for CrashLoopBackOff.

---

# Conclusion

A CrashLoopBackOff scenario was successfully simulated and investigated in Amazon EKS. The pod repeatedly restarted because the application intentionally exited with an error after failing to connect to the database. The investigation included pod status, logs, events, and deployment configuration, allowing the failure to be traced to the application startup process. After completing the investigation, the demonstration deployment was removed, restoring the cluster to a healthy state.