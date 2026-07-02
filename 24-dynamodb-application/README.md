# Exercise 24 – DynamoDB Application Deployment

## Objective

Deploy a Kubernetes application on Amazon EKS that securely interacts with Amazon DynamoDB using **IAM Roles for Service Accounts (IRSA)**.

The application performs:

- Read Customer
- Write Customer
- Update Customer

without using AWS Access Keys or Secret Keys.

---

# Architecture

```
                 Client
                    │
                    ▼
             Payment Service
                    │
                    ▼
          Kubernetes ServiceAccount
                    │
                    ▼
         IAM Role for Service Account
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
- Amazon DynamoDB
- AWS IAM
- IAM Roles for Service Accounts (IRSA)
- AWS STS

---

# Objective

Deploy a customer management application capable of securely performing DynamoDB operations without storing AWS credentials.

Supported operations

- GetItem
- PutItem
- UpdateItem

---

# Security Model

Traditional approach

```
Application

↓

AWS Access Key

↓

AWS Secret Key

↓

DynamoDB
```

Production approach

```
Application

↓

Service Account

↓

IAM Role (IRSA)

↓

AWS STS

↓

Temporary Credentials

↓

Amazon DynamoDB
```

No AWS credentials are stored inside the application.

---

# Application Operations

## Read Customer

Retrieve customer information from DynamoDB.

```
GetItem
```

---

## Create Customer

Insert a new customer record.

```
PutItem
```

---

## Update Customer

Modify an existing customer record.

```
UpdateItem
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

# IAM Policy

The IAM Role should include permissions for:

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

# Service Account

Example annotation

```yaml
metadata:
  name: payment-service

  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::<ACCOUNT_ID>:role/payment-service-irsa-role
```

---

# Deployment Configuration

The application deployment references the ServiceAccount.

```yaml
spec:

  serviceAccountName: payment-service
```

---

# Validation

## Verify Service Account

```bash
kubectl get serviceaccount
```

---

## Describe Service Account

```bash
kubectl describe serviceaccount payment-service
```

Expected

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

## Verify Application

Application successfully performs

```
GetItem

PutItem

UpdateItem
```

without AWS Access Keys.

---

# Commands Used

```bash
kubectl get serviceaccount

kubectl describe serviceaccount payment-service

kubectl describe deployment payment-service

kubectl get pods
```

---

# Components Used

| Component | Purpose |
|-----------|---------|
| Amazon EKS | Kubernetes Platform |
| Amazon DynamoDB | NoSQL Database |
| IAM Policy | DynamoDB Permissions |
| IAM Role | AWS Authorization |
| IRSA | Secure Pod Identity |
| AWS STS | Temporary Credentials |
| Kubernetes ServiceAccount | IAM Role Association |

---

# Screenshots

- DynamoDB Table
- IAM Policy
- IAM Role
- Service Account
- Deployment
- Running Pods
- Successful Customer Read
- Successful Customer Write
- Successful Customer Update

---

# Constraints

- No AWS Access Keys stored in the application.
- Authentication performed only through IAM Roles for Service Accounts (IRSA).
- Least-privilege IAM permissions applied to the application.

---

# Lessons Learned

- IRSA eliminates the need for long-lived AWS credentials in Kubernetes workloads.
- Temporary credentials issued through AWS STS improve security.
- ServiceAccounts provide workload-level AWS access control.
- IAM policies should grant only the minimum permissions required.
- DynamoDB integration becomes more secure and manageable using IRSA.

---

# Conclusion

A customer management application was designed to securely access Amazon DynamoDB from Amazon EKS using IAM Roles for Service Accounts (IRSA). The application performs `GetItem`, `PutItem`, and `UpdateItem` operations without storing AWS Access Keys, relying instead on temporary credentials issued through AWS STS. This approach follows AWS security best practices by combining least-privilege IAM policies with Kubernetes ServiceAccounts for secure, production-ready access to DynamoDB.