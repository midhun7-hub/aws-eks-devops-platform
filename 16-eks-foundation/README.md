# Exercise 16 – Build a Production EKS Platform

## Objective

Provision a production-ready Amazon EKS platform using Infrastructure as Code (Terraform) and prepare it for production workloads.

The platform includes:

- Amazon EKS Cluster
- Managed Node Groups
- Development and Production Namespaces
- Cluster Autoscaler
- Metrics Server

---

# Architecture

```
                    Terraform
                        │
                        ▼
                 Amazon EKS Cluster
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
Managed Node Group              Managed Node Group
        │                               │
        └───────────────┬───────────────┘
                        ▼
                 Kubernetes Cluster
                        │
      ┌─────────────────┼──────────────────┐
      ▼                 ▼                  ▼
  Dev Namespace    Prod Namespace    kube-system
                        │
                        ▼
      Metrics Server + Cluster Autoscaler
```

---

# Environment

- Amazon EKS
- Terraform
- Kubernetes
- AWS CLI
- kubectl
- Metrics Server
- Cluster Autoscaler

> **Note:** Terraform was used to provision the infrastructure. Terragrunt was not part of this implementation.

---

# Infrastructure Provisioned

The following resources were created.

### Amazon EKS Cluster

- Production EKS Cluster
- Kubernetes Control Plane
- IAM Roles
- Networking

---

### Managed Node Groups

Worker nodes were deployed using EKS Managed Node Groups.

Benefits

- Automatic node lifecycle management
- Automatic upgrades
- Integration with Cluster Autoscaler

---

### Kubernetes Namespaces

Separate namespaces were created.

```
dev

prod
```

This provides workload isolation between development and production environments.

---

### Metrics Server

Metrics Server was installed to provide CPU and memory metrics.

These metrics are required for

- kubectl top
- Horizontal Pod Autoscaler
- Cluster Autoscaler

---

### Cluster Autoscaler

Cluster Autoscaler was configured to

- Add worker nodes during high demand
- Remove unused nodes during low utilization

---

# Validation

## Verify Nodes

```bash
kubectl get nodes
```

Example

```
NAME                                   STATUS   VERSION

ip-10-0-141-163                        Ready

ip-10-0-141-188                        Ready

ip-10-0-142-60                         Ready
```

All worker nodes joined successfully.

---

## Verify Metrics

```bash
kubectl top nodes
```

Example

```
NAME              CPU    MEMORY

Node-1            5%

Node-2            8%

Node-3            12%
```

Metrics Server successfully collected resource utilization.

---

## Verify Namespaces

```bash
kubectl get ns
```

Output

```
default

kube-system

kube-public

dev

prod
```

Namespace isolation verified.

---

# Infrastructure Workflow

```
Terraform Apply

↓

Amazon EKS

↓

Managed Node Groups

↓

Worker Nodes Join Cluster

↓

Metrics Server Installed

↓

Cluster Autoscaler Installed

↓

Namespaces Created

↓

Production Platform Ready
```

---

# Commands Used

```bash
terraform init

terraform plan

terraform apply

aws eks update-kubeconfig --name eks-exercises

kubectl get nodes

kubectl top nodes

kubectl get ns

kubectl get pods -A
```

---

# Components Used

| Component | Purpose |
|------------|---------|
| Terraform | Infrastructure Provisioning |
| Amazon EKS | Kubernetes Cluster |
| Managed Node Groups | Worker Nodes |
| Kubernetes Namespaces | Workload Isolation |
| Metrics Server | Resource Metrics |
| Cluster Autoscaler | Automatic Node Scaling |
| kubectl | Cluster Management |
| AWS CLI | AWS Resource Management |

---

# Screenshots

- Terraform Apply Successful
- EKS Cluster Created
- Worker Nodes (Ready)
- Metrics Server Running
- `kubectl top nodes`
- Namespaces (`dev` and `prod`)
- Cluster Autoscaler Running

---

# Lessons Learned

- Infrastructure as Code enables repeatable and reliable Kubernetes deployments.
- Managed Node Groups simplify worker node lifecycle management.
- Metrics Server is essential for resource monitoring and autoscaling.
- Namespace separation improves workload isolation and security.
- Cluster Autoscaler ensures efficient resource utilization by automatically adjusting node capacity.

---

# Conclusion

A production-ready Amazon EKS platform was successfully provisioned using **Terraform**. The cluster included managed node groups, separate development and production namespaces, the Metrics Server for resource monitoring, and the Cluster Autoscaler for automatic node scaling. Validation confirmed that worker nodes joined the cluster successfully, resource metrics were available, and namespace isolation was functioning as expected. This platform provides a solid foundation for deploying and managing production-grade Kubernetes applications on AWS.