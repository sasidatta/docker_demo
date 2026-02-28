# Docker & K8s Command Education Demo

This demo shows how to override Docker's `ENTRYPOINT` and `CMD` using Kubernetes `command` and `args`.

## Prerequisites
- Docker installed locally.
- A Kubernetes cluster (e.g., Minikube, Kind, or Docker Desktop K8s).
- `kubectl` configured to talk to your cluster.

---

## Step 1: Build the Image
Before running anything, we need to build our "Pinger" image.
```bash
docker build -t ping-demo ./demo
```

## Step 2: Run in Docker (Basic Test)

### 2a. Run with Default CMD
```bash
docker run ping-demo
# Result: Pings 'localhost' (Defined in Dockerfile CMD)
```

### 2b. Run with Override CMD
```bash
docker run ping-demo google.com
# Result: Pings 'google.com' (Overrode Dockerfile CMD)
```

### 2c. Run with Override ENTRYPOINT
```bash
docker run --entrypoint sh ping-demo -c "echo 'hello world'"
# Result: Runs sh instead of ping (Overrode Dockerfile ENTRYPOINT)
```

---

## Step 3: Run in Kubernetes

### 3a. Apply the Manifest
```bash
kubectl apply -f ./demo/k8s-demo.yaml
```

### 3b. Verify the Results (Wait for 'Running' status)
```bash
kubectl get pods
```

### 3c. Inspect the Logs

#### Example 1: `ping-default` (Uses Dockerfile Defaults)
```bash
kubectl logs ping-default
# Result: PING localhost (127.0.0.1): 56 data bytes...
```

#### Example 2: `ping-google` (K8s 'args' overrides Docker 'CMD')
```bash
kubectl logs ping-google
# Result: PING google.com (142.250.190.46): 56 data bytes...
```

#### Example 3: `ping-shell` (K8s 'command' resets everything)
```bash
kubectl logs ping-shell
# Result: I am a shell now
```

---

## The Golden Rule for Teams:
- **`ENTRYPOINT`** in Dockerfile = **`command`** in K8s. (The Tool)
- **`CMD`** in Dockerfile = **`args`** in K8s. (The Input)
