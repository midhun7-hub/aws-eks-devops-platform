# Exercise 21 – Production ALB Ingress

## Objective

Expose multiple applications using an AWS Application Load Balancer.

## Routes

- /api/*
- /admin/*
- /dashboard/*

## Features

- Internet-facing ALB
- Path-based routing
- Target Group Health Checks
- IP Target Mode

## Traffic Flow

Internet
        │
        ▼
AWS ALB
        │
 ┌──────┼─────────┐
 │      │         │
 ▼      ▼         ▼
API   Admin   Dashboard
 │      │         │
 ▼      ▼         ▼
Payment Admin Grafana

## Commands

kubectl apply -f manifests/ingress.yaml

kubectl get ingress

kubectl describe ingress production-alb-ingress