# Exercise 25 – Observability Platform Deployment

## Objective

Deploy a complete observability platform on Amazon EKS capable of collecting:

- Metrics
- Logs
- Traces

The monitoring stack consists of:

- Prometheus
- Grafana
- Loki
- Grafana Alloy
- Tempo

The platform provides centralized monitoring, logging, and distributed tracing for Kubernetes workloads.

---

# Architecture

```
                     Payment Service
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
    /metrics             Application Logs      Traces
        │                   │                   │
        ▼                   ▼                   ▼
   Prometheus          Grafana Alloy         Tempo
        │                   │
        ▼                   ▼
                 Loki
        │                   │
        └─────────────┬─────┘
                      ▼
                  Grafana
```

---

# Environment

- Amazon EKS
- Kubernetes
- Prometheus
- Grafana
- Loki
- Grafana Alloy
- Tempo
- Payment Service

---

# Components Deployed

## Prometheus

Responsible for collecting application and Kubernetes metrics.

Collected

- CPU Usage
- Memory Usage
- Request Rate
- Custom Application Metrics

---

## Grafana

Visualization platform used to create dashboards for

- CPU
- Memory
- Request Rate
- Error Rate
- Logs
- Traces

---

## Loki

Centralized log storage.

Collected

- Application Logs
- Kubernetes Logs
- Container Logs

---

## Grafana Alloy

Log collection agent.

Responsible for

```
Pods

↓

Alloy

↓

Loki
```

---

## Tempo

Distributed tracing backend.

Provides end-to-end request tracing between services.

---

# Metrics Collection

The payment-service exposed a Prometheus metrics endpoint.

```
GET /metrics
```

Application metrics included

```
payment_requests_total

process_cpu_seconds_total

process_resident_memory_bytes

nodejs_eventloop_lag_seconds
```

Prometheus successfully scraped the metrics.

---

# Logging Pipeline

```
Application

↓

Container Logs

↓

Grafana Alloy

↓

Loki

↓

Grafana
```

Application logs became searchable inside Grafana.

---

# Distributed Tracing

Tempo collected traces for application requests.

Trace Flow

```
Client

↓

Payment Service

↓

Database

↓

Response
```

Grafana visualized complete request latency.

---

# Dashboards Created

## CPU Dashboard

Displayed

- CPU Usage
- CPU Percentage
- CPU Trends

---

## Memory Dashboard

Displayed

- Memory Usage
- Working Set
- RSS Memory

---

## Request Rate Dashboard

Displayed

- Requests per Second
- Total Requests
- Traffic Trends

---

## Error Dashboard

Displayed

- HTTP Errors
- Failed Requests
- Application Failures

---

# Validation

## Verify Monitoring Pods

```bash
kubectl get pods -n monitoring
```

Verified

- Prometheus
- Grafana
- Loki
- Alloy
- Tempo

were running successfully.

---

## Verify Metrics

```bash
kubectl get svc -n monitoring
```

Confirmed Prometheus service availability.

---

## Verify Metrics Endpoint

```bash
wget http://localhost:3000/metrics
```

Metrics returned successfully.

---

## Verify Logs

Application logs appeared inside Grafana through Loki.

---

## Verify Traces

Tempo displayed complete request traces.

---

# Data Flow

```
Application

↓

Metrics

↓

Prometheus

↓

Grafana Dashboard
```

```
Application

↓

Logs

↓

Alloy

↓

Loki

↓

Grafana
```

```
Application

↓

Traces

↓

Tempo

↓

Grafana
```

---

# Commands Used

```bash
kubectl get pods -n monitoring

kubectl get svc -n monitoring

kubectl get configmap -n monitoring

kubectl rollout restart deployment loki-gateway -n monitoring

kubectl port-forward svc/prometheus-server 9090:80 -n monitoring

kubectl port-forward svc/grafana 3000:80 -n monitoring

wget http://localhost:3000/metrics
```

---

# Components Used

| Component | Purpose |
|-----------|---------|
| Amazon EKS | Kubernetes Platform |
| Prometheus | Metrics Collection |
| Grafana | Visualization |
| Loki | Log Storage |
| Grafana Alloy | Log Collection |
| Tempo | Distributed Tracing |
| Payment Service | Application |

---

# Screenshots

- Monitoring Namespace
- Prometheus Running
- Grafana Dashboard
- Loki Pods
- Alloy Pods
- Tempo Pods
- Metrics Endpoint
- CPU Dashboard
- Memory Dashboard
- Request Rate Dashboard
- Error Rate Dashboard
- Logs in Grafana
- Traces in Grafana

---

# Lessons Learned

- Observability consists of three pillars: Metrics, Logs, and Traces.
- Prometheus provides real-time infrastructure and application metrics.
- Loki centralizes application and Kubernetes logs for troubleshooting.
- Grafana Alloy efficiently collects and forwards logs to Loki.
- Tempo enables distributed tracing, making it easier to identify latency bottlenecks across services.
- Grafana combines metrics, logs, and traces into a unified monitoring platform, improving visibility and incident response.

---

# Conclusion

A complete observability platform was successfully deployed on Amazon EKS using Prometheus, Grafana, Loki, Grafana Alloy, and Tempo. The platform collected application metrics through the `/metrics` endpoint, centralized logs using Alloy and Loki, and captured distributed traces with Tempo. Grafana dashboards were created to visualize CPU usage, memory consumption, request rate, and error rate, providing comprehensive monitoring and troubleshooting capabilities for the Kubernetes environment.