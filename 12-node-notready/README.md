# Exercise 12 – Node NotReady Production Incident

## Objective

Investigate and recover a Kubernetes worker node that became **NotReady** due to **DiskPressure** caused by excessive container logs.

---

# Incident

## Symptoms

- Worker Node Status: **NotReady**
- Application Pods were not getting scheduled.
- Existing Pods started failing.
- Cluster health degraded.

---

## Evidence

### Node Status

```bash
kubectl get nodes
```

Expected during incident:

```
NAME                                          STATUS
ip-10-0-154-218.ap-south-1.compute.internal   NotReady
```

---

### Describe Node

```bash
kubectl describe node <node-name>
```

Expected:

```
Conditions:

DiskPressure=True
Ready=False
```

Reason:

```
KubeletHasDiskPressure
```

---

### Journal Logs

```
no space left on device
```

---

### Disk Investigation

SSH/SSM into the affected node.

Check filesystem usage.

```bash
df -h
```

Example

```
Filesystem      Size  Used Avail Use%
/dev/root       100G  100G    0G 100%
```

---

Check container log usage.

```bash
du -sh /var/log/containers/*
```

Example

```
95G /var/log/containers/payment-service.log
```

This indicates container logs have exhausted the node storage.

---

Check system journal usage.

```bash
journalctl --disk-usage
```

Example

```
Archived and active journals take up 8.2G.
```

---

# Investigation

## Step 1

Verify node health.

```bash
kubectl get nodes
```

---

## Step 2

Inspect node conditions.

```bash
kubectl describe node <node-name>
```

Observed:

- DiskPressure=True
- Ready=False

---

## Step 3

Log in to the worker node.

Using SSH or AWS Systems Manager Session Manager.

---

## Step 4

Check disk usage.

```bash
df -h
```

Filesystem was completely utilized.

---

## Step 5

Identify large directories.

```bash
du -sh /var/log/*
```

---

## Step 6

Inspect Kubernetes container logs.

```bash
du -sh /var/log/containers/*
```

Found approximately **95 GB** of log files.

---

## Step 7

Inspect system journal size.

```bash
journalctl --disk-usage
```

---

# Root Cause Analysis

```
Application generated excessive logs
                │
                ▼
/var/log/containers grew continuously
                │
                ▼
Node disk became full
                │
                ▼
DiskPressure=True
                │
                ▼
Kubelet marked node NotReady
                │
                ▼
Pods stopped scheduling
```

---

# Resolution

## Clean old system journals

```bash
sudo journalctl --vacuum-size=500M
```

or

```bash
sudo journalctl --vacuum-time=2d
```

---

## Remove excessive container logs

```bash
sudo find /var/log/containers -type f -name "*.log" -exec truncate -s 0 {} \;
```

---

## Verify available disk space

```bash
df -h
```

Disk usage should return to a healthy level.

---

## Restart kubelet

```bash
sudo systemctl restart kubelet
```

---

## Verify node recovery

```bash
kubectl get nodes
```

Expected:

```
NAME                                          STATUS
ip-10-0-154-218.ap-south-1.compute.internal   Ready
```

---

# Preventive Measures

- Configure log rotation.
- Set container log size limits.
- Monitor node filesystem usage using Prometheus.
- Create Grafana alerts for DiskPressure.
- Periodically clean old journals.
- Configure log retention policies.

---

# Commands Used

```bash
kubectl get nodes

kubectl describe node <node-name>

df -h

du -sh /var/log/*

du -sh /var/log/containers/*

journalctl --disk-usage

sudo journalctl --vacuum-size=500M

sudo find /var/log/containers -type f -name "*.log" -exec truncate -s 0 {} \;

sudo systemctl restart kubelet

kubectl get nodes
```

---

# Conclusion

The worker node entered the **NotReady** state because excessive container logs exhausted the available disk space, resulting in **DiskPressure=True**. Cleaning old logs, reclaiming disk space, and restarting the kubelet restored the node to the **Ready** state. Implementing log rotation, monitoring, and alerting helps prevent similar incidents in production.