# Exercise 8 – Egress Restriction Incident

## Objective

Investigate a production incident where an application running on Amazon EKS is unable to access Amazon DynamoDB due to outbound network connectivity issues.

---

## Incident

**Production Alert**

```
Application cannot access DynamoDB

Logs:
Connection timeout

Test:
curl dynamodb.ap-south-1.amazonaws.com

Result:
Connection timed out
```

---

# Environment

* Amazon EKS
* Kubernetes v1.36
* AWS VPC CNI
* AWS Application Load Balancer Controller
* Payment Service deployed on EKS
* AWS Region: ap-south-1

---

# Investigation

## Step 1 – Verify Application Connectivity

Executed into the test pod.

```bash
kubectl exec -it deployment/network-test -n payment -- sh
```

Tested outbound connectivity.

```bash
curl https://dynamodb.ap-south-1.amazonaws.com
```

### Observation

The request successfully reached the DynamoDB endpoint.

This confirmed:

* DNS resolution is working.
* Internet connectivity is available.
* The application can reach AWS public endpoints.

---

## Step 2 – Security Group Verification

Retrieved the cluster security group.

```bash
aws eks describe-cluster \
--name eks-exercises \
--region ap-south-1 \
--query "cluster.resourcesVpcConfig.clusterSecurityGroupId"
```

Inspected outbound rules.

```bash
aws ec2 describe-security-groups --group-ids <security-group-id>
```

### Observation

The security group allowed outbound traffic to:

```
0.0.0.0/0
```

No restrictive outbound rules were found.

---

## Step 3 – Network Policy Verification

Checked Kubernetes Network Policies.

```bash
kubectl get networkpolicy -A
```

### Observation

```
No resources found
```

No Kubernetes NetworkPolicy was blocking outbound traffic.

---

## Step 4 – Route Table Verification

Reviewed VPC Route Tables.

```bash
aws ec2 describe-route-tables
```

### Observation

The route tables contained valid routes for outbound traffic, allowing the worker nodes to communicate outside the VPC.

---

## Step 5 – VPC Endpoint Verification

Checked for existing VPC Endpoints.

```bash
aws ec2 describe-vpc-endpoints
```

### Observation

```
VpcEndpoints: []
```

No DynamoDB VPC Endpoint was configured.

The application therefore accesses DynamoDB using the Internet Gateway/NAT path.

---

# Root Cause Analysis

The reported incident could not be reproduced.

Investigation confirmed that:

* Outbound Security Group rules were correctly configured.
* No restrictive Kubernetes Network Policies existed.
* Route Tables were correctly configured.
* The application successfully reached the DynamoDB endpoint.
* Traffic was routed through the public AWS endpoint instead of a private VPC Endpoint.

---

# Resolution

No infrastructure changes were required.

The networking configuration was verified and confirmed to be healthy.

---

# Commands Used

```bash
kubectl exec -it deployment/network-test -n payment -- sh

curl https://dynamodb.ap-south-1.amazonaws.com

aws eks describe-cluster --name eks-exercises --region ap-south-1 --query "cluster.resourcesVpcConfig.clusterSecurityGroupId"

aws ec2 describe-security-groups --group-ids <security-group-id>

kubectl get networkpolicy -A

aws ec2 describe-route-tables

aws ec2 describe-vpc-endpoints
```

---

# Learning Outcomes

* Verified outbound connectivity from an Amazon EKS pod.
* Investigated Security Group configuration for egress traffic.
* Examined Kubernetes Network Policies.
* Reviewed VPC Route Tables.
* Verified the absence of VPC Endpoints.
* Understood how applications in EKS access AWS services through public endpoints when no VPC Endpoint is configured.
* Practiced a structured production incident investigation workflow without impacting the running cluster.

