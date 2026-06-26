# Helm Chart Engineering

## Features

- Deployment
- Service
- ConfigMap
- Secret
- Ingress
- Horizontal Pod Autoscaler
- Environment-specific values

## Deploy

Default

```bash
helm install myapp .
```

Development

```bash
helm install myapp . -f values-dev.yaml
```

QA

```bash
helm install myapp . -f values-qa.yaml
```

Production

```bash
helm install myapp . -f values-prod.yaml
```

Upgrade

```bash
helm upgrade myapp . -f values-prod.yaml
```

Uninstall

```bash
helm uninstall myapp
```