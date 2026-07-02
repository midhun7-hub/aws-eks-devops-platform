# Exercise 7 – AWS ALB Ingress Failure Investigation

## Objective

Investigate why the application became inaccessible through the AWS Application Load Balancer (ALB) after deployment.

The objective was to identify whether the issue originated from the Ingress configuration, AWS Load Balancer Controller, subnet discovery, or AWS networking.

---

# Architecture

```
Client
   │
   ▼
AWS Application Load Balancer
   │
   ▼
Kubernetes Ingress
   │
   ▼
Payment Service
   │
   ▼
Application Pods
```

---

# Environment

- Amazon EKS
- Kubernetes
- AWS Load Balancer Controller
- AWS Application Load Balancer (ALB)
- Kubernetes Ingress

---

# Incident

## Symptoms

Users were unable to access the application.

Browser

```
504 Gateway Timeout
```

Ingress Annotation

```yaml
alb.ingress.kubernetes.io/target-type: ip
```

Events

```
Target registration failed
```

AWS Load Balancer Controller Logs

```
Unable to discover subnets
```

---

# Investigation

## Step 1 – Verify Ingress

```bash
kubectl get ingress
```

Verified

- Ingress created
- ALB hostname assigned

---

## Step 2 – Describe Ingress

```bash
kubectl describe ingress payment-ingress
```

Observed

```
Target registration failed
```

The ALB was unable to register Kubernetes targets.

---

## Step 3 – Verify Services

```bash
kubectl get svc
```

Confirmed

- Payment Service exists
- Service type configured correctly
- Target port matches application port

---

## Step 4 – Verify Pods

```bash
kubectl get pods
```

Observed

All application pods were

```
Running
```

No application failures were detected.

---

## Step 5 – Inspect AWS Load Balancer Controller

```bash
kubectl logs deployment/aws-load-balancer-controller \
-n kube-system
```

Observed

```
Unable to discover subnets
```

The controller could not identify suitable AWS subnets for provisioning the ALB.

---

## Step 6 – Verify VPC Subnets

Check subnet tags.

Expected

```
kubernetes.io/cluster/eks-exercises

owned
```

and

```
kubernetes.io/role/elb

1
```

For public ALBs

or

```
kubernetes.io/role/internal-elb

1
```

For internal ALBs

Missing or incorrect subnet tags prevent the AWS Load Balancer Controller from discovering subnets.

---

# Investigation Flow

```
User Request

↓

Application Load Balancer

↓

Ingress

↓

AWS Load Balancer Controller

↓

Subnet Discovery Failed

↓

Target Registration Failed

↓

504 Gateway Timeout
```

---

# Root Cause Analysis

Application

```
Healthy
```

Pods

```
Healthy
```

Service

```
Healthy
```

Ingress

```
Created
```

AWS Load Balancer Controller

```
Unable to Discover Subnets
```

↓

ALB Target Registration Failed

↓

Application Unreachable

The issue was caused by missing or incorrectly tagged VPC subnets required by the AWS Load Balancer Controller.

---

# Resolution

## Step 1 – Verify Public Subnet Tags

Example

```
Key

kubernetes.io/cluster/eks-exercises

Value

owned
```

```
Key

kubernetes.io/role/elb

Value

1
```

---

## Step 2 – Verify Private Subnet Tags (if required)

```
Key

kubernetes.io/role/internal-elb

Value

1
```

---

## Step 3 – Verify AWS Load Balancer Controller IAM Permissions

Ensure the controller has permission to

- Describe VPCs
- Describe Subnets
- Create Load Balancers
- Register Targets

---

## Step 4 – Restart Controller

```bash
kubectl rollout restart deployment aws-load-balancer-controller \
-n kube-system
```

---

## Step 5 – Verify Ingress

```bash
kubectl describe ingress payment-ingress
```

Target registration should complete successfully.

---

## Step 6 – Verify Application

Access the ALB DNS name.

Application becomes reachable.

HTTP Response

```
200 OK
```

---

# Root Cause

| Component | Status |
|------------|--------|
| Application | Healthy |
| Pods | Healthy |
| Service | Healthy |
| Ingress | Healthy |
| ALB Controller | Subnet Discovery Failed |
| AWS Networking | Missing Subnet Tags |

---

# Commands Used

```bash
kubectl get ingress

kubectl describe ingress payment-ingress

kubectl get svc

kubectl get pods

kubectl logs deployment/aws-load-balancer-controller \
-n kube-system

kubectl rollout restart deployment/aws-load-balancer-controller \
-n kube-system
```

---

# Screenshots

- Ingress Resource
- Ingress Events
- Application Pods
- Kubernetes Service
- AWS Load Balancer Controller Logs
- ALB DNS
- Successful Application Access

---

# Lessons Learned

- A healthy Kubernetes deployment does not guarantee external accessibility.
- AWS Load Balancer Controller depends on correctly tagged VPC subnets.
- Missing subnet tags prevent ALB creation and target registration.
- Always inspect the AWS Load Balancer Controller logs when Ingress provisioning fails.
- Validate ALB target registration before troubleshooting the application itself.

---

# Conclusion

An application accessibility issue was investigated after users experienced **504 Gateway Timeout** errors. The application pods and Kubernetes services were healthy, but the AWS Load Balancer Controller failed to discover suitable VPC subnets because of missing or incorrect subnet tags. As a result, ALB target registration failed, preventing traffic from reaching the application. Correcting the subnet configuration and restarting the controller restored ALB provisioning and application accessibility.