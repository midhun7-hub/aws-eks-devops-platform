# Exercise 2 – IAM / IRSA Failure Investigation

## Objective

Investigate why a Kubernetes application deployed on Amazon EKS suddenly lost access to DynamoDB and determine why IAM Roles for Service Accounts (IRSA) was not being used.

---

# Architecture

```
Application Pod
       │
       ▼
Kubernetes ServiceAccount
       │
       ▼
IAM Role (IRSA)
       │
       ▼
Amazon DynamoDB
```

---

# Environment

- Amazon EKS
- Kubernetes
- IAM Roles for Service Accounts (IRSA)
- AWS IAM
- Amazon DynamoDB
- AWS STS

---

# Incident

## Symptoms

The application was unable to read data from DynamoDB.

Application Log

```
botocore.exceptions.ClientError

AccessDeniedException

User:

arn:aws:sts::123456789012:assumed-role/eks-nodegroup-role

is not authorized to perform

dynamodb:GetItem
```

---

# Investigation

## Step 1 – Analyze Error Message

The application log indicated:

```
AccessDeniedException
```

Most importantly,

```
User

arn:aws:sts::123456789012:assumed-role/eks-nodegroup-role
```

Instead of

```
payment-service-irsa-role
```

the application was using

```
eks-nodegroup-role
```

This immediately indicated that IRSA was not being used.

---

## Step 2 – Verify Service Account

```bash
kubectl get serviceaccount -n payment
```

Expected

```
payment-service
```

---

Describe the Service Account.

```bash
kubectl describe serviceaccount payment-service -n payment
```

Expected Annotation

```
eks.amazonaws.com/role-arn

arn:aws:iam::<ACCOUNT_ID>:role/payment-service-irsa-role
```

If this annotation is missing,

IRSA will not work.

---

## Step 3 – Verify Deployment

```bash
kubectl describe deployment payment-service -n payment
```

Verify

```
serviceAccountName
```

Expected

```
serviceAccountName: payment-service
```

If omitted,

Kubernetes automatically uses

```
default
```

which cannot assume the IRSA role.

---

## Step 4 – Verify IAM Role

Check IAM Role trust policy.

Expected

```
OIDC Provider

↓

Service Account

↓

Namespace

↓

IAM Role
```

The IAM Role must trust

```
system:serviceaccount:payment:payment-service
```

---

## Step 5 – Verify OIDC Provider

Verify the EKS cluster has an associated IAM OIDC Provider.

Without an OIDC Provider,

IRSA cannot authenticate pods.

---

## Step 6 – Verify IAM Permissions

The IAM Role attached through IRSA should include

```
dynamodb:GetItem
```

Permission on

```
customer-data
```

table.

---

# Investigation Flow

```
Application

↓

AWS SDK

↓

STS

↓

Node IAM Role

↓

Access Denied
```

Expected Flow

```
Application

↓

Service Account

↓

IRSA IAM Role

↓

STS

↓

DynamoDB

↓

Success
```

---

# Root Cause Analysis

The application was using the

```
Node IAM Role
```

instead of the

```
IRSA IAM Role.
```

Possible causes

- ServiceAccount missing IAM annotation.
- Deployment using default ServiceAccount.
- IAM Role trust policy incorrect.
- OIDC Provider not configured.
- Incorrect namespace or ServiceAccount mapping.

---

# Resolution

## 1. Create / Update Service Account

```yaml
apiVersion: v1
kind: ServiceAccount

metadata:
  name: payment-service
  namespace: payment

  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::<ACCOUNT_ID>:role/payment-service-irsa-role
```

---

## 2. Update Deployment

```yaml
spec:

  serviceAccountName: payment-service
```

---

## 3. Verify IAM Trust Policy

Ensure the IAM Role trusts

```
system:serviceaccount:payment:payment-service
```

---

## 4. Restart Deployment

```bash
kubectl rollout restart deployment payment-service -n payment
```

---

## 5. Verify

Application successfully reads from DynamoDB.

No AccessDeniedException observed.

---

# Commands Used

```bash
kubectl get serviceaccount -n payment

kubectl describe serviceaccount payment-service -n payment

kubectl describe deployment payment-service -n payment

kubectl rollout restart deployment payment-service -n payment
```

---

# Screenshots

- Application Error Logs
- Service Account
- Service Account Annotation
- Deployment Configuration
- IAM Role
- Trust Policy
- Successful Application Access

---

# Lessons Learned

- Always verify which IAM role the application is using.
- IRSA requires a correctly annotated ServiceAccount.
- The Deployment must reference the intended ServiceAccount.
- The IAM Role trust relationship must match the ServiceAccount and namespace.
- Never rely on the worker node IAM role for application permissions.

---

# Conclusion

The application lost access to DynamoDB because it assumed the **EKS node IAM role** instead of the intended **IRSA IAM role**. Investigation of the ServiceAccount, Deployment configuration, IAM trust policy, and OIDC configuration identified why IRSA was not being used. After associating the correct IAM Role with the Kubernetes ServiceAccount and restarting the deployment, the application successfully authenticated with DynamoDB using IRSA, restoring normal operation.