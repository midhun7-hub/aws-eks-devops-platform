# Exercise 9 – Prometheus Monitoring Failure

## Objective

Investigate and restore Prometheus monitoring after application metrics stopped appearing.

The goal was to expose custom application metrics, verify Prometheus scraping, simulate a monitoring issue, identify the failure, and restore monitoring.

---

# Architecture

```
Payment Service
        │
        ▼
/metrics Endpoint
        │
        ▼
Prometheus
        │
        ▼
Grafana Dashboard
```

---

# Environment

- Amazon EKS
- Kubernetes
- Node.js (Express)
- Prometheus
- Grafana
- AWS Application Load Balancer (ALB)

---

# Application Enhancement

The payment service was modified to expose Prometheus metrics using the **prom-client** library.

## Added Dependencies

```javascript
const client = require("prom-client");
```

---

## Registered Metrics

```javascript
const register = new client.Registry();

client.collectDefaultMetrics({
    register
});
```

---

## Custom Metric

```javascript
const httpRequests = new client.Counter({
    name: "payment_requests_total",
    help: "Total payment requests"
});

register.registerMetric(httpRequests);
```

---

## Metrics Endpoint

```javascript
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
});
```

---

## Payment API

Each payment request increments the Prometheus counter.

```javascript
httpRequests.inc();
```

---

## CPU Intensive Endpoint

A CPU-intensive endpoint was added to generate workload.

```javascript
GET /cpu
```

This endpoint performs heavy CPU computation and was later used for HPA and monitoring demonstrations.

---

# Docker Image Update

A new Docker image containing the monitoring changes was built.

```
payment-service:dashboard-v4
```

The image was pushed to Amazon ECR.

---

# Deployment Update

The Kubernetes deployment was updated with the new image.

```bash
kubectl set image deployment/payment-service \
payment-service=<ECR_IMAGE>:dashboard-v4 \
-n payment
```

Deployment rollout was verified.

```bash
kubectl rollout status deployment/payment-service -n payment
```

---

# Investigation

## Step 1

Verify application deployment.

```bash
kubectl get pods -n payment
```

Pods were healthy.

---

## Step 2

Verify Service.

```bash
kubectl get svc -n payment
```

Service exposed port **3000**.

---

## Step 3

Verify metrics endpoint.

Initially the endpoint returned **404 Not Found**, indicating the running container was using an older application version.

```
wget http://localhost:3000/metrics

HTTP/1.1 404 Not Found
```

---

## Step 4

Verified deployment image.

```bash
kubectl get deployment payment-service \
-n payment \
-o jsonpath="{.spec.template.spec.containers[0].image}"
```

Confirmed deployment image version.

---

## Step 5

Updated deployment to the latest image.

Deployment rollout completed successfully.

---

## Step 6

Verified metrics endpoint again.

```
GET /metrics
```

Metrics were successfully exposed.

Example metrics:

```
payment_requests_total

process_cpu_seconds_total

process_resident_memory_bytes

nodejs_eventloop_lag_seconds
```

---

# Simulated Monitoring Failure

Scenario

```
Grafana Dashboard

↓

No Metrics Visible
```

Investigation steps:

- Verified application pods
- Verified Service
- Verified deployment image
- Verified `/metrics`
- Verified Prometheus connectivity

Root cause identified as the application running an outdated image that did not expose Prometheus metrics.

---

# Root Cause Analysis

```
Old Application Image
        │
        ▼
No /metrics Endpoint
        │
        ▼
Prometheus Scrape Failed
        │
        ▼
Grafana Displayed No Metrics
```

---

# Resolution

Updated the deployment to the latest Docker image.

```bash
kubectl rollout restart deployment payment-service -n payment
```

Verified rollout.

```bash
kubectl rollout status deployment/payment-service -n payment
```

Verified metrics endpoint.

```
GET /metrics
```

Prometheus resumed collecting metrics successfully.

---

# Verification

Confirmed:

- Payment service healthy
- Metrics endpoint available
- Prometheus scraping metrics
- Grafana displaying metrics

---

# Commands Used

```bash
kubectl get pods -n payment

kubectl get svc -n payment

kubectl get deployment payment-service \
-o jsonpath="{.spec.template.spec.containers[0].image}" \
-n payment

kubectl rollout restart deployment payment-service -n payment

kubectl rollout status deployment/payment-service -n payment

kubectl exec -it <pod-name> -n payment -- sh

wget http://localhost:3000/metrics
```

---

# Screenshots

- Payment Service Pods
- Kubernetes Service
- Deployment Image
- Metrics Endpoint
- Deployment Rollout
- Grafana Dashboard
- Prometheus Metrics

---

# Lessons Learned

- Always verify that the running deployment uses the latest container image.
- Validate the `/metrics` endpoint before troubleshooting Prometheus.
- Confirm Kubernetes Services correctly expose the application port.
- Rollout verification is essential after deploying updated images.
- Monitoring failures are often caused by application configuration rather than Prometheus itself.

---

# Conclusion

A Prometheus monitoring failure was successfully investigated and resolved. The issue was traced to an older application image that did not expose the `/metrics` endpoint required by Prometheus. After deploying the updated application, Prometheus resumed scraping metrics, and Grafana dashboards displayed the expected monitoring data. This exercise demonstrated the complete troubleshooting workflow for diagnosing and restoring application monitoring in a Kubernetes environment.