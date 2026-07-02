# Exercise 22 – Horizontal and Cluster Autoscaling

## Objective

Implement automatic scaling for a Kubernetes application by configuring both the Horizontal Pod Autoscaler (HPA) and the Cluster Autoscaler.

The objective was to automatically scale:

- Application Pods
- Worker Nodes (when required)

under increased application load.

---

# Architecture

```
               Load Test
                   │
                   ▼
          Payment Service
                   │
                   ▼
      Horizontal Pod Autoscaler
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
 Increase Pod Replicas   Pending Pods
                                  │
                                  ▼
                      Cluster Autoscaler
                                  │
                                  ▼
                     EKS Managed Node Group
                                  │
                                  ▼
                           New Worker Nodes
```

---

# Environment

- Amazon EKS
- Kubernetes
- Horizontal Pod Autoscaler (HPA)
- Cluster Autoscaler
- Metrics Server
- Payment Service

---

# Implementation

## Horizontal Pod Autoscaler

The payment-service deployment was configured with an HPA based on CPU utilization.

Validation

```bash
kubectl get hpa
```

Observed

```
TARGETS

CPU

Current / Target
```

---

## Metrics Server

Verified Metrics Server functionality.

```bash
kubectl top nodes

kubectl top pods
```

CPU and memory metrics were available for autoscaling.

---

## Load Testing

To generate CPU load, the application exposed a CPU-intensive endpoint.

```
GET /cpu
```

Multiple concurrent requests were generated using PowerShell.

Example

```powershell
1..20 | ForEach-Object {
    Start-Job {
        Invoke-WebRequest http://localhost:3000/cpu | Out-Null
    }
}
```

The exercise requirements also mention common load testing tools such as:

- hey
- Apache Benchmark (ab)
- k6

These tools can be used to generate sustained application traffic in production environments.

---

# Validation

## Verify Pods

```bash
kubectl get pods -n payment
```

Pods remained healthy.

---

## Verify HPA

```bash
kubectl get hpa -w
```

Observed

```
CPU

↓

Target Exceeded

↓

Replica Count Increased
```

The HPA automatically increased the number of application replicas based on CPU utilization.

---

## Verify Resource Usage

```bash
kubectl top pods -n payment
```

Observed

High CPU utilization on the payment-service pods during the load test.

---

## Cluster Autoscaler

The platform included the Cluster Autoscaler.

Its responsibility is to provision additional worker nodes when pending pods cannot be scheduled because of insufficient cluster resources.

Expected workflow

```
Pods Pending

↓

Cluster Autoscaler

↓

Managed Node Group

↓

New Worker Nodes

↓

Pods Scheduled
```

---

# Scaling Workflow

```
Load Test

↓

High CPU Usage

↓

Horizontal Pod Autoscaler

↓

More Application Pods

↓

Cluster Capacity Exhausted

↓

Cluster Autoscaler

↓

Additional Worker Nodes

↓

Application Fully Scaled
```

---

# Commands Used

```bash
kubectl get hpa

kubectl get pods -n payment

kubectl top pods -n payment

kubectl top nodes

kubectl describe hpa payment-service-hpa
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

# Components Used

| Component | Purpose |
|-----------|---------|
| Amazon EKS | Kubernetes Platform |
| Payment Service | Application |
| Metrics Server | Resource Metrics |
| HPA | Pod Autoscaling |
| Cluster Autoscaler | Node Autoscaling |
| Managed Node Groups | Worker Nodes |

---

# Screenshots

- HPA Status
- CPU Utilization
- Pod Scaling
- `kubectl top pods`
- `kubectl top nodes`
- Worker Nodes
- Payment Service Running

---

# Lessons Learned

- The Horizontal Pod Autoscaler scales application replicas based on CPU or memory metrics.
- The Metrics Server is required for HPA to function correctly.
- Cluster Autoscaler complements HPA by adding worker nodes when cluster capacity is exhausted.
- Load testing is essential to validate autoscaling behavior before deploying to production.
- Monitoring CPU utilization helps verify that autoscaling thresholds are configured appropriately.

---

# Conclusion

Automatic application scaling was implemented using the Horizontal Pod Autoscaler on Amazon EKS. CPU load was generated against the payment-service, and the HPA increased the number of application replicas in response to rising utilization. The platform also included the Cluster Autoscaler to support node scaling when additional cluster capacity is required. Together, these components provide a scalable and resilient Kubernetes environment capable of adapting to changing workloads.