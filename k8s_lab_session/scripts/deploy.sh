#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting MERN stack deployment to Kubernetes..."

# 1. Create Namespace
echo "Creating namespace..."
kubectl apply -f namespace.yaml

# 2. Apply Configuration (ConfigMap & Secrets)
echo "Applying configuration..."
kubectl apply -f config/

# 3. Deploy MongoDB (PVC, Deployment, Service)
echo "Deploying MongoDB..."
kubectl apply -f mongodb/

# 4. Deploy Backend (Deployment, Service)
echo "Deploying Backend..."
kubectl apply -f backend/

# 5. Deploy Frontend (Deployment, Service)
echo "Deploying Frontend..."
kubectl apply -f frontend/

# 6. Deploy Ingress & Middleware
echo "Deploying Ingress & Middleware..."
kubectl apply -f ingress/

echo "✅ Deployment complete!"
echo "Wait for pods to be ready: kubectl get pods -n k8s-lab"
