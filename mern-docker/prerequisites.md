# Prerequisites

## Cluster Setup

Two AWS EC2 instances with Kubernetes installed via kubeadm.

| Role | Count |
|---|---|
| Control Plane (master) | 1 |
| Worker Node | 1 |

### Recommended EC2 Instance Types

| Node | Minimum | Recommended |
|---|---|---|
| Control Plane | t3.medium (2 vCPU, 4GB RAM) | t3.large |
| Worker | t3.medium (2 vCPU, 4GB RAM) | t3.large |

---

## Security Groups

Ensure the following ports are open between the two instances:

| Port | Protocol | Purpose |
|---|---|---|
| 6443 | TCP | Kubernetes API server |
| 10250 | TCP | Kubelet |
| 30000-32767 | TCP | NodePort services |
| 80 / 443 | TCP | HTTP/HTTPS ingress |
| 2379-2380 | TCP | etcd (control plane only) |

---

## 1. Container Runtime

Install `containerd` on both nodes before running kubeadm:

```bash
sudo apt-get update
sudo apt-get install -y containerd
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml
sudo systemctl restart containerd
sudo systemctl enable containerd
```

---

## 2. Nginx Ingress Controller

The `ingress.yaml` manifest uses `ingressClassName: nginx`. Install the ingress controller on the cluster after `kubeadm init`:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.0/deploy/static/provider/cloud/deploy.yaml
```

Verify it is running:

```bash
kubectl get pods -n ingress-nginx
```

---

## 3. StorageClass for MongoDB PVC

kubeadm clusters on EC2 do not come with a default StorageClass. Install the AWS EBS CSI driver or use a simple local-path provisioner for sandbox use.

### Option A — Local Path Provisioner (sandbox)

```bash
kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/master/deploy/local-path-storage.yaml
kubectl patch storageclass local-path -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

### Option B — AWS EBS CSI Driver (persistent, recommended)

```bash
kubectl apply -k "github.com/kubernetes-sigs/aws-ebs-csi-driver/deploy/kubernetes/overlays/stable/?ref=release-1.28"
```

Verify a default StorageClass exists:

```bash
kubectl get storageclass
```

---

## 4. Backend Docker Image

`backend.yaml` uses `mern-backend:local` with `imagePullPolicy: IfNotPresent`. This image must be present on the worker node before deploying.

Build and push to Docker Hub (or ECR), then update the image field in `manifests/backend.yaml`:

```bash
# Build and push
docker build -t <your-dockerhub-username>/mern-backend:latest ./backend
docker push <your-dockerhub-username>/mern-backend:latest
```

Then update `manifests/backend.yaml`:
```yaml
image: <your-dockerhub-username>/mern-backend:latest
imagePullPolicy: Always
```

---

## 5. Deploy

Once all prerequisites are met, apply all manifests:

```bash
kubectl apply -f manifests/
```

Verify everything is running:

```bash
kubectl get pods
kubectl get svc
kubectl get ingress
```
