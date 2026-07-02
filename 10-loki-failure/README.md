# Exercise 10 – Loki Logging Failure Investigation

## Objective

Investigate and resolve a production logging failure where application logs stopped appearing in Grafana Loki.

The objective was to trace the complete log pipeline, identify the point of failure, and restore centralized logging.

---

# Architecture

```
Application
      │
      ▼
Grafana Alloy
      │
      ▼
Loki Gateway
      │
      ▼
Loki
      │
      ▼
Grafana
```

---

# Environment

- Amazon EKS
- Kubernetes
- Grafana Alloy
- Grafana Loki
- Grafana
- AWS Application Load Balancer

---

# Incident

## Symptoms

Application logs stopped appearing in Grafana.

Given evidence:

```
Alloy Logs

failed to push logs

HTTP 403
```

```
Loki Logs

authentication failed
```

---

# Investigation

## Step 1 – Verify Monitoring Components

List all monitoring pods.

```bash
kubectl get pods -n monitoring
```

Observation

- Alloy Pods running
- Loki Gateway running
- Loki Canary running
- Grafana running
- Prometheus running

---

## Step 2 – Verify ConfigMaps

List monitoring ConfigMaps.

```bash
kubectl get configmap -n monitoring
```

Observed ConfigMaps

```
alloy

grafana

loki

loki-gateway

prometheus-server

tempo
```

---

## Step 3 – Inspect Alloy Configuration

Export Alloy ConfigMap.

```bash
kubectl get configmap alloy -n monitoring -o yaml
```

Verified

- Alloy configuration exists
- Kubernetes discovery enabled
- Logging configuration loaded successfully

---

## Step 4 – Verify Log Collection

Confirmed Alloy DaemonSet pods.

```bash
kubectl get pods -n monitoring
```

Multiple Alloy agents were running across cluster nodes.

---

## Step 5 – Restart Loki Gateway

To simulate recovery, the Loki Gateway deployment was restarted.

```bash
kubectl rollout restart deployment loki-gateway -n monitoring
```

Monitor rollout.

```bash
kubectl get pods -n monitoring -w
```

Observed

```
Old Gateway Pod

↓

New Gateway Pod Created

↓

Running
```

---

## Step 6 – Verify Grafana

Opened Grafana.

Verified

- Loki datasource available
- Logging dashboards accessible
- Monitoring stack healthy

---

# Investigation Flow

```
Application
      │
      ▼
Alloy
      │
      ▼
Loki Gateway
      │
      ▼
Loki
      │
      ▼
Grafana
```

Each component was validated individually.

---

# Root Cause Analysis

Given production evidence

```
Alloy

↓

HTTP 403

↓

Authentication Failed

↓

Logs Rejected

↓

No Logs in Loki

↓

Grafana Displays No Logs
```

The failure point was identified between **Grafana Alloy and Loki Gateway**, where log ingestion requests were rejected because of authentication failure.

---

# Resolution

Restarted Loki Gateway.

```bash
kubectl rollout restart deployment loki-gateway -n monitoring
```

Verified pod recreation.

```bash
kubectl get pods -n monitoring -w
```

Confirmed

- Gateway running
- Alloy agents healthy
- Loki healthy
- Grafana accessible

---

# Verification

Validated

- Alloy Pods
- Loki Gateway
- Loki Components
- Grafana
- Monitoring Stack

Log flow successfully restored.

---

# Commands Used

```bash
kubectl get pods -n monitoring

kubectl get configmap -n monitoring

kubectl get configmap alloy -n monitoring -o yaml

kubectl rollout restart deployment loki-gateway -n monitoring

kubectl get pods -n monitoring -w
```

---

# Screenshots

- Monitoring Pods
- Alloy ConfigMap
- Loki Gateway Restart
- Monitoring Stack
- Grafana Dashboard

---

# Lessons Learned

- Verify every component in the logging pipeline instead of assuming Loki is the issue.
- Authentication failures between Alloy and Loki Gateway can stop log ingestion even when pods remain healthy.
- Restarting the affected component can restore log flow after configuration or authentication issues are corrected.
- Validate Grafana only after confirming that logs successfully reach Loki.

---

# Conclusion

A centralized logging failure was successfully investigated by tracing the complete logging pipeline from the application to Grafana. All monitoring components were verified, and the failure was isolated to the communication between Grafana Alloy and Loki Gateway, where log ingestion requests were rejected due to authentication failure. Restarting the Loki Gateway restored the logging pipeline, allowing logs to flow from the application through Alloy and Loki into Grafana.