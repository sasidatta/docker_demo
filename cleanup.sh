#!/bin/bash
# Cleanup Script for MERN Docker Demo

echo "Starting cleanup..."

# Determine kubectl command (k3s bundled or standard)
KUBECTL_CMD="kubectl"
if command -v k3s &> /dev/null; then
    echo "Detected k3s, using 'sudo k3s kubectl'"
    KUBECTL_CMD="sudo k3s kubectl"
fi

# Base directory (adjust if running from specific location)
# We assume the script is run from inside the docker_demo directory or parent
SCRIPT_DIR=$(dirname "$0")
target_dir="$SCRIPT_DIR"

if [ -d "$target_dir/k8s" ]; then
    echo "Deleting Kubernetes resources..."
    $KUBECTL_CMD delete -f "$target_dir/k8s/ingress.yaml" --ignore-not-found=true
    $KUBECTL_CMD delete -f "$target_dir/k8s/" --ignore-not-found=true
else
    echo "Warning: 'k8s' directory not found in $target_dir. Skipping manifest deletion."
fi

# Optional: Stop Docker Compose if it was running
if [ -d "$target_dir/mern-docker" ]; then
    echo "Ensuring Docker Compose is down..."
    cd "$target_dir/mern-docker"
    docker-compose down --remove-orphans || true
    cd - > /dev/null
fi

echo "Cleanup complete. Docker images were NOT deleted."
echo "To remove images, run: docker rmi sasidatta/mern-docker-frontend:latest sasidatta/mern-docker-backend:latest"
