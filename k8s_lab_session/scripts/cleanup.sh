#!/bin/bash

echo "🧹 Cleaning up MERN lab session..."

# Delete the namespace (this deletes everything inside it)
kubectl delete namespace k8s-lab

echo "✅ Cleanup complete!"
