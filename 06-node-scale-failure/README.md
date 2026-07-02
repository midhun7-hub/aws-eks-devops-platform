# Exercise 6 – EKS Node Scale Failure Investigation

## Objective

Investigate why the application could not scale even though the Horizontal Pod Autoscaler (HPA) requested additional replicas.

The objective was to determine whether the issue was caused by the HPA, Kubernetes worker nodes, or the Cluster Autoscaler.

---

# Architecture

```
Application
      │
      ▼
Horizontal Pod Autoscaler
      │
      ▼
Pending Pods
      │
      ▼
Cluster Autoscaler
      │
      ▼
EKS Managed Node Group
      │
      ▼
Worker Nodes
```

---

# Environment

- Amazon EKS
- Kubernetes
- Horizontal Pod Autoscaler (HPA)
- Cluster Autoscaler
- Managed Node Group
- AWS Auto Scaling

---

# Incident

## Symptoms

Application traffic increased and HPA attempted to scale the deployment.

HPA Status

```
Desired Replicas

15

Current Replicas

5
```

Pending Pods

```
0/3 nodes available

Insufficient CPU
```

Cluster Autoscaler Logs

```
No node group config found
```

---

# Investigation

## Step 1 – Verify HPA

```bash
kubectl get hpa
```

Observed

```
Desired Replicas : 15

Current Replicas : 5
```

The HPA was functioning correctly and requesting additional replicas.

---

## Step 2 – Verify Pods

```bash
kubectl get pods
```

Observed

Several pods remained

```
Pending
```

---

## Step 3 – Describe Pending Pod

```bash
kubectl describe pod <pending-pod>
```

Events

```
0/3 nodes available

Insufficient CPU
```

This confirmed that Kubernetes could not schedule the pods due to lack of available CPU resources.

---

## Step 4 – Verify Nodes

```bash
kubectl get nodes
```

Worker nodes were healthy and in the **Ready** state.

No node failures were observed.

---

## Step 5 – Verify Cluster Autoscaler

Inspect Cluster Autoscaler logs.

```bash
kubectl logs deployment/cluster-autoscaler \
-n kube-system
```

Observed

```
No node group config found
```

The Cluster Autoscaler could not identify a managed node group to scale.

---

# Investigation Flow

```
Application Load

↓

HPA

↓

Desired Replicas Increased

↓

Pending Pods

↓

Cluster Autoscaler

↓

No Node Group Configuration

↓

No New Nodes Created

↓

Application Could Not Scale
```

---

# Root Cause Analysis

HPA

```
Healthy
```

Worker Nodes

```
Healthy
```

Cluster Autoscaler

```
Unable to locate node group

↓

No scale-out operation

↓

Pending Pods remained unscheduled
```

The failure was isolated to the **Cluster Autoscaler configuration**.

---

# Resolution

## Step 1 – Verify Managed Node Group

Confirm the managed node group exists.

```bash
aws eks list-nodegroups \
--cluster-name eks-exercises
```

---

## Step 2 – Verify Auto Scaling Group

```bash
aws autoscaling describe-auto-scaling-groups
```

Ensure the node group is associated with an Auto Scaling Group.

---

## Step 3 – Verify Cluster Autoscaler Configuration

Check that the Cluster Autoscaler is configured with the correct cluster name and node group discovery tags.

Example

```
k8s.io/cluster-autoscaler/enabled

true

k8s.io/cluster-autoscaler/<cluster-name>

owned
```

---

## Step 4 – Restart Cluster Autoscaler

```bash
kubectl rollout restart deployment cluster-autoscaler \
-n kube-system
```

---

## Step 5 – Verify Scale-Out

```bash
kubectl get nodes
```

New worker nodes should join the cluster automatically.

Pending pods should transition to

```
Running
```

---

# Root Cause

| Component | Status |
|------------|--------|
| Application | Healthy |
| HPA | Working |
| Worker Nodes | Healthy |
| Scheduler | Working |
| Cluster Autoscaler | Misconfigured |
| Managed Node Group | Not Discovered |

---

# Commands Used

```bash
kubectl get hpa

kubectl get pods

kubectl describe pod <pod-name>

kubectl get nodes

kubectl logs deployment/cluster-autoscaler \
-n kube-system

aws eks list-nodegroups \
--cluster-name eks-exercises

aws autoscaling describe-auto-scaling-groups

kubectl rollout restart deployment cluster-autoscaler \
-n kube-system
```

---

# Screenshots

- HPA Status
- Pending Pods
- Pod Events
- Worker Nodes
- Cluster Autoscaler Logs
- Managed Node Group
- Successful Scale-Out

---

# Lessons Learned

- HPA only decides how many replicas are required; it does not provision infrastructure.
- Pending pods with **Insufficient CPU** usually indicate cluster capacity issues.
- The Cluster Autoscaler must be correctly configured to discover EKS managed node groups.
- Verify Auto Scaling Group tags and Cluster Autoscaler configuration after deployment.
- Monitor autoscaler logs whenever pods remain pending despite HPA requesting additional replicas.

---

# Conclusion

An application scaling failure was investigated after the Horizontal Pod Autoscaler requested additional replicas but the deployment remained under-provisioned. Analysis showed that the HPA and Kubernetes scheduler were functioning correctly, while the Cluster Autoscaler failed to discover the managed node group due to a configuration issue. As a result, no new worker nodes were added to the cluster, leaving pods in the **Pending** state because of insufficient CPU resources. Correcting the Cluster Autoscaler configuration and ensuring proper node group discovery restored automatic cluster scaling.