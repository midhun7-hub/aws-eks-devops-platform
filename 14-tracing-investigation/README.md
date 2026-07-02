# Exercise 14 – Distributed Tracing Investigation

## Objective

Investigate a slow Checkout API using metrics, logs, and distributed tracing to identify the bottleneck service in a microservices application.

The objective was to correlate Prometheus metrics, Grafana dashboards, and distributed traces to determine the root cause of increased response latency.

---

# Architecture

```
Client
   │
   ▼
Checkout Service
   │
   ▼
Inventory Service
   │
   ▼
Payment Service
   │
   ▼
Database
```

Distributed traces were collected using **Tempo** and visualized in **Grafana**.

---

# Environment

- Amazon EKS
- Kubernetes
- Grafana
- Prometheus
- Tempo
- Payment Service
- Checkout Service
- Inventory Service

---

# Incident

## Symptoms

Users reported that the Checkout API was responding slowly.

Evidence

### Grafana

```
95th Percentile Latency

4.8 Seconds
```

### Prometheus

```
Request Count

Normal
```

### Tempo Trace

```
checkout-service
        │
        ▼
inventory-service
        │
        ▼
payment-service

payment-service = 4.2 seconds
```

---

# Investigation

## Step 1 – Verify Application Pods

```bash
kubectl get pods -n payment
```

Verified that the payment-service pods were healthy and running.

---

## Step 2 – Check Resource Utilization

```bash
kubectl top pods -n payment
```

Initially

```
CPU

5m
```

Memory

```
30Mi
```

No abnormal resource usage was observed.

---

## Step 3 – Generate CPU Load

A CPU-intensive endpoint (`/cpu`) was invoked multiple times to simulate production traffic.

Example

```powershell
1..20 | ForEach-Object {
    Start-Job {
        Invoke-WebRequest http://localhost:3000/cpu | Out-Null
    }
}
```

---

## Step 4 – Observe CPU Utilization

```bash
kubectl top pods -n payment
```

Observed

```
CPU

291m
```

One payment-service pod experienced a significant increase in CPU utilization.

---

## Step 5 – Observe Horizontal Pod Autoscaler

```bash
kubectl get hpa -n payment -w
```

Observed

```
CPU

31%

↓

147%

↓

252%
```

HPA automatically increased replicas.

```
2

↓

4

↓

8

↓

11
```

This confirmed that the payment-service became CPU-bound under heavy load.

---

## Step 6 – Verify Grafana

Grafana dashboards were inspected.

Observed

- Increased latency
- Increased CPU utilization
- Higher response times

The latency spike aligned with the CPU spike on the payment-service.

---

## Step 7 – Analyze Distributed Trace

Tempo traces showed the complete request path.

```
checkout-service

↓

inventory-service

↓

payment-service
```

Trace duration

```
checkout-service

4.8 seconds
```

Inside the trace

```
payment-service

4.2 seconds
```

The payment-service consumed almost the entire request duration.

---

# Investigation Flow

```
Client Request

↓

Checkout Service

↓

Inventory Service

↓

Payment Service

↓

CPU Intensive Operation

↓

High Processing Time

↓

Slow Checkout Response
```

---

# Root Cause Analysis

Prometheus showed

- Request count remained normal.
- No unusual traffic spike.

Grafana showed

- Increased response latency.

Tempo showed

```
Payment Service

↓

4.2 seconds
```

The bottleneck was isolated to the **payment-service**, which spent most of the request time processing CPU-intensive operations.

---

# Resolution

No infrastructure failure was detected.

The service remained healthy but required optimization.

Recommended actions

- Optimize CPU-intensive application logic.
- Scale the payment-service horizontally using HPA.
- Tune CPU requests and limits.
- Optimize database or downstream calls if applicable.
- Improve application performance through profiling.

---

# Commands Used

```bash
kubectl get pods -n payment

kubectl top pods -n payment

kubectl get hpa -n payment -w

kubectl port-forward svc/payment-service 3000:3000 -n payment
```

PowerShell

```powershell
1..20 | ForEach-Object {
    Start-Job {
        Invoke-WebRequest http://localhost:3000/cpu | Out-Null
    }
}
```

---

# Screenshots

- Payment Service Pods
- CPU Utilization
- HPA Scaling
- Grafana Dashboard
- Tempo Distributed Trace
- Payment Service Bottleneck

---

# Lessons Learned

- High latency does not always indicate increased traffic.
- Prometheus metrics help identify resource utilization.
- Distributed tracing pinpoints the exact service causing delays.
- HPA mitigates load but does not eliminate inefficient application logic.
- Combining metrics, logs, and traces provides a complete view of application performance.

---

# Conclusion

A distributed tracing investigation was successfully performed using Prometheus, Grafana, and Tempo. Although the request rate remained normal, the Checkout API experienced increased latency because the **payment-service** spent approximately **4.2 seconds** processing requests. CPU utilization increased significantly during load testing, triggering Horizontal Pod Autoscaler scaling events. By correlating metrics, traces, and resource utilization, the payment-service was identified as the primary performance bottleneck.