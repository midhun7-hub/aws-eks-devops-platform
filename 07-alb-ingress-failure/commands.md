# Commands Used During Investigation

## Describe Ingress

```bash
kubectl describe ingress payment-ingress
```

---

## Controller Logs

```bash
kubectl logs deployment/aws-load-balancer-controller \
-n kube-system
```

---

## Verify Services

```bash
kubectl get svc
```

---

## Verify Pods

```bash
kubectl get pods
```

---

## Verify Ingress

```bash
kubectl get ingress
```