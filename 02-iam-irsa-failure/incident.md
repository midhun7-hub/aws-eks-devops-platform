Incident:
Application cannot read DynamoDB.

Error:
AccessDeniedException

User:
arn:aws:sts::123456789012:assumed-role/eks-nodegroup-role

Current Architecture:
Pod
↓
ServiceAccount
↓
IAM Role (IRSA)
↓
DynamoDB