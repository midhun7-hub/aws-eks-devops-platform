# Exercise 2 – IAM / IRSA Failure

## Why node role is being used?

The application log shows:

assumed-role/eks-nodegroup-role

This indicates that the pod is using the worker node IAM role instead of the intended IRSA role.

## Why IRSA is not working?

IRSA authentication failed, preventing the pod from assuming the IAM role associated with the ServiceAccount.

Possible causes:

- Missing ServiceAccount annotation
- Incorrect IAM trust policy
- Missing OIDC provider
- Deployment not using ServiceAccount

## How to fix?

1. Verify ServiceAccount annotation.
2. Verify Deployment uses the ServiceAccount.
3. Verify IAM trust policy matches namespace and ServiceAccount.
4. Verify OIDC provider exists.
5. Restart the application.

Result:

The pod assumes the IRSA role and gains DynamoDB permissions without using the node role.