# Exercise 7 - ALB Ingress Failure Investigation

## Objective

Investigate an AWS ALB Ingress failure where users are unable to access the application.

---

## Incident

Users report:

```
504 Gateway Timeout
```

Ingress configuration:

```yaml
alb.ingress.kubernetes.io/target-type: ip
```

Observed Event:

```
Target registration failed
```

AWS Load Balancer Controller Logs:

```
Unable to discover subnets
```

---

## Investigation

### Step 1 - Verify Ingress

```bash
kubectl describe ingress payment-ingress
```

Observed:

```
Warning  Target registration failed
```

---

### Step 2 - Check AWS Load Balancer Controller Logs

```bash
kubectl logs deployment/aws-load-balancer-controller \
-n kube-system
```

Observed:

```
Unable to discover subnets
```

---

### Step 3 - Verify AWS VPC Subnet Tags

Required Tags:

Public Subnet

```
kubernetes.io/role/elb=1
```

Private Subnet

```
kubernetes.io/role/internal-elb=1
```

Cluster Tag

```
kubernetes.io/cluster/my-cluster=shared
```

---

## Root Cause

The AWS Load Balancer Controller could not discover suitable VPC subnets because the required Kubernetes subnet tags were missing.

As a result:

- ALB Target Groups were not configured correctly.
- Targets were not registered.
- The ALB returned HTTP 504 Gateway Timeout.

---

## Resolution

1. Add the required subnet tags.
2. Verify subnet discovery.
3. Restart the AWS Load Balancer Controller if required.
4. Verify target registration.

---

## Prevention

- Manage subnet tags using Terraform.
- Validate AWS networking before deployment.
- Monitor AWS Load Balancer Controller logs.
- Restrict manual VPC modifications.
- Enable infrastructure validation in CI/CD.

---

## Commands Used

```bash
kubectl describe ingress payment-ingress

kubectl logs deployment/aws-load-balancer-controller -n kube-system

kubectl get ingress

kubectl get svc

kubectl get pods -n kube-system
```

---

## Expected Outcome

After fixing the subnet tags:

- Target Groups become Healthy.
- ALB registers application Pods.
- HTTP 504 error is resolved.