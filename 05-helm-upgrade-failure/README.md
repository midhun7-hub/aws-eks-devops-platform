# Exercise 5 – Helm Upgrade Failure

## Incident

Production deployment failed during Helm upgrade.

Error

UPGRADE FAILED

cannot patch Deployment

spec.selector:
field is immutable

## Root Cause

The Deployment selector (spec.selector.matchLabels) was modified from

app: payment

to

app: payment-v2

Deployment selectors are immutable.

## Resolution

- Keep selectors unchanged
- Update image tags instead
- Use Blue-Green deployment if selector changes are required
- Recreate Deployment only if downtime is acceptable