# Exercise 9 – Prometheus Monitoring Failure

## Incident

Grafana displayed **No Data**.

Prometheus target:

payment-service → DOWN

Prometheus logs:

context deadline exceeded

## Investigation

The ServiceMonitor was configured to scrape the port named **metrics**.

```yaml
endpoints:
- port: metrics
