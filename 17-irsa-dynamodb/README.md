# Exercise 17 – Implement IRSA for Application Access

## Objective

Configure IAM Roles for Service Accounts (IRSA) so that an application running on Amazon EKS can securely access Amazon DynamoDB without storing AWS Access Keys or Secret Keys inside the application.

The application must successfully perform:

- GetItem
- PutItem
- UpdateItem

on a DynamoDB table.

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
AWS STS
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
- AWS STS
- Amazon DynamoDB

---

# Objective Components

The following resources are required.

### IAM Policy

Grants

- dynamodb:GetItem
- dynamodb:PutItem
- dynamodb:UpdateItem

for the required DynamoDB table.

---

### IAM Role

An IAM Role is created and attached to the IAM Policy.

This role will be assumed by Kubernetes Pods through IRSA.

---

### OIDC Provider

The Amazon EKS cluster must have an associated IAM OIDC Identity Provider.

The OIDC provider enables Kubernetes Service Accounts to assume AWS IAM Roles.

---

### Kubernetes Service Account

A ServiceAccount is created with the following annotation.

```yaml
eks.amazonaws.com/role-arn:
arn:aws:iam::<ACCOUNT_ID>:role/payment-service-irsa-role
```

---

### Application Deployment

The deployment references the ServiceAccount.

```yaml
spec:

  serviceAccountName: payment-service
```

This allows the application Pod to automatically receive temporary AWS credentials.

---

# IAM Policy

Example permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem"
      ],
      "Resource": "arn:aws:dynamodb:ap-south-1:<ACCOUNT_ID>:table/customer-data"
    }
  ]
}
```

---

# Deployment Workflow

```
Application Starts

↓

Service Account

↓

IRSA IAM Role

↓

AWS STS

↓

Temporary Credentials

↓

Amazon DynamoDB

↓

Read / Write Successful
```

---

# Validation

## Verify OIDC Provider

```bash
aws eks describe-cluster \
--name eks-exercises \
--query "cluster.identity.oidc.issuer"
```

---

## Verify Service Account

```bash
kubectl get serviceaccount payment-service
```

---

## Describe Service Account

```bash
kubectl describe serviceaccount payment-service
```

Expected Annotation

```
eks.amazonaws.com/role-arn
```

---

## Verify Deployment

```bash
kubectl describe deployment payment-service
```

Expected

```
serviceAccountName

payment-service
```

---

## Verify DynamoDB Access

Application successfully performs

```
GetItem

PutItem

UpdateItem
```

without AWS Access Keys.

---

# Security Benefits

Instead of

```
AWS Access Key

AWS Secret Key

↓

Application
```

IRSA uses

```
Application

↓

Service Account

↓

IAM Role

↓

Temporary AWS Credentials
```

Benefits

- No hardcoded credentials
- Temporary credentials
- Least privilege access
- Automatic credential rotation

---

# Commands Used

```bash
aws eks describe-cluster

kubectl get serviceaccount

kubectl describe serviceaccount

kubectl describe deployment payment-service
```

---

# Components Used

| Component | Purpose |
|-----------|---------|
| Amazon EKS | Kubernetes Cluster |
| IAM Policy | DynamoDB Permissions |
| IAM Role | AWS Authorization |
| OIDC Provider | Identity Federation |
| Service Account | Pod Identity |
| AWS STS | Temporary Credentials |
| Amazon DynamoDB | Application Database |

---

# Screenshots

- IAM Policy
- IAM Role
- OIDC Provider
- Service Account
- Deployment Configuration
- Application Logs
- Successful DynamoDB Operations

---

# Lessons Learned

- IRSA eliminates the need to store AWS credentials inside containers.
- The EKS OIDC provider is mandatory for IRSA to function.
- The ServiceAccount must be annotated with the correct IAM Role ARN.
- The Deployment must reference the intended ServiceAccount.
- Following the principle of least privilege improves the security of AWS-integrated Kubernetes applications.

---

# Conclusion

An IAM Roles for Service Accounts (IRSA) solution was designed to provide secure access from an Amazon EKS application to Amazon DynamoDB without using long-lived AWS credentials. By associating an IAM Policy with an IAM Role, enabling the EKS OIDC Provider, and annotating a Kubernetes ServiceAccount, the application can securely obtain temporary AWS credentials and perform `GetItem`, `PutItem`, and `UpdateItem` operations on DynamoDB while following AWS security best practices.