# Kubernetes Lab — Step-by-Step Installation Guide

> **Audience:** Beginners | **Goal:** Manually build a 2-node K8s cluster
> **Your nodes:** `s<N>-master` and `s<N>-worker` (your instructor will give you the IPs)

---

## 0. SSH Into Your Nodes

Open **two terminal windows** — one for master, one for worker.

```bash
# Terminal 1 — Master
ssh ubuntu@<YOUR_MASTER_IP>
# password: devops123

# Terminal 2 — Worker
ssh ubuntu@<YOUR_WORKER_IP>
# password: devops123


#Use the command
passwd

prasad
  "s1-master" = "65.2.102.173"
  "s1-worker" = "13.206.91.61"

supreet 
  "s2-master" = "43.204.52.173"
  "s2-worker" = "3.110.17.131"
  
navneet
  "s3-master" = "15.206.106.221"
  "s3-worker" = "65.1.66.73"


hari
"s1-master" = "44.195.251.74"
  "s1-worker" = "54.166.94.188"

mayuri
  "s2-master" = "3.211.4.187"
  "s2-worker" = "3.218.30.79"

```

---

## 1. Disable Swap — Both Nodes

> Run on **both master and worker**.

Kubernetes requires swap to be off. If swap is enabled, `kubeadm init` will hard-fail during preflight checks.

```bash
# Turn off swap immediately (takes effect right now)
sudo swapoff -a

# Remove the swap entry from fstab (survives reboots)
sudo sed -i '/\bswap\b/d' /etc/fstab

# Verify — output must be empty
swapon --show
```

**Why two commands?**
- `swapoff -a` disables swap for the current session only
- Removing the `/etc/fstab` entry ensures it stays off after a reboot
- If you only run `swapoff -a` and the VM reboots, swap comes back and `kubeadm init` fails again

---

## 2. Load Kernel Modules — Both Nodes

These modules are required by the container runtime and Kubernetes networking.

```bash
# Load modules now
sudo modprobe overlay
sudo modprobe br_netfilter

# Make them load automatically on reboot
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

# Verify
lsmod | grep -E 'overlay|br_netfilter'
```

---

## 3. Apply Sysctl Settings — Both Nodes

```bash
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

# Apply immediately without reboot
sudo sysctl --system

# Verify
sysctl net.ipv4.ip_forward
# Expected: net.ipv4.ip_forward = 1
```

---

## 4. Install containerd — Both Nodes

```bash
# Install dependencies
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg apt-transport-https

# Add Docker's GPG key (containerd is distributed via Docker repos)
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker apt repo
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list

# Install containerd
sudo apt-get update -y
sudo apt-get install -y containerd.io

# Generate default config and enable SystemdCgroup
sudo containerd config default | sudo tee /etc/containerd/config.toml
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml

# Restart and enable
sudo systemctl restart containerd
sudo systemctl enable containerd

# Verify
sudo systemctl status containerd --no-pager
```

---

## 5. Install kubeadm, kubelet, kubectl — Both Nodes

```bash
# Add Kubernetes apt repo
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key \
  | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] \
https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /" \
  | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt-get update -y
sudo apt-get install -y kubelet kubeadm kubectl

# Pin versions so they don't auto-upgrade
sudo apt-mark hold kubelet kubeadm kubectl

# Verify
kubeadm version
kubelet --version
kubectl version --client
```

---

## 6. Initialize the Cluster — Master Node Only

> Run the following **only on the master node**.

First, get the master's private IP:

```bash
hostname -I | awk '{print $1}'
```

Then initialize:

```bash
sudo kubeadm init \
  --pod-network-cidr=192.168.0.0/16 \
  --apiserver-advertise-address=<YOUR_MASTER_PRIVATE_IP>
```

Wait ~2 minutes. At the end you will see a `kubeadm join ...` command.
**Copy that entire block — you will need it in Step 8.**

---

## 7. Set Up kubeconfig — Master Node Only

```bash
mkdir -p $HOME/.kube
sudo cp /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

Verify the master is visible:

```bash
kubectl get nodes
# STATUS will show NotReady — that's expected until CNI is installed
```

---

## 8. Join the Worker Node — Worker Only

> Take the `kubeadm join` command from Step 6 and run it on the **worker node** with `sudo`.

```bash
# Use YOUR actual join command from kubeadm init output — example:
sudo kubeadm join <MASTER_PRIVATE_IP>:6443 \
  --token <TOKEN> \
  --discovery-token-ca-cert-hash sha256:<HASH>
```

> **Lost the join command?** Regenerate it on the master:
> ```bash
> kubeadm token create --print-join-command
> ```

---

## 9. Install Calico CNI — Master Node Only

```bash
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/calico.yaml
```

Wait about 60 seconds, then watch pods come up:

```bash
watch kubectl get pods -n kube-system
# Press Ctrl+C when all pods show Running or Completed
```

---

## 10. Verify Cluster — Master Node

```bash
# Both nodes should show Ready
kubectl get nodes -o wide

# All system pods should be Running
kubectl get pods -n kube-system

# Cluster info
kubectl cluster-info
```

Expected output:

```
NAME         STATUS   ROLES           AGE   VERSION
s1-master    Ready    control-plane   5m    v1.29.x
s1-worker    Ready    <none>          3m    v1.29.x
```

---

## 11. Test DNS — busybox + nslookup

```bash
kubectl run busybox \
  --image=busybox:1.28 \
  --restart=Never \
  --rm \
  -it \
  -- nslookup kubernetes.default
```

Expected output:

```
Server:    10.96.0.10
Address 1: 10.96.0.10 kube-dns.kube-system.svc.cluster.local

Name:      kubernetes.default
Address 1: 10.96.0.1 kubernetes.default.svc.cluster.local
```

If you see the above — **your cluster is fully working!**

---

## 12. Quick Smoke Test — Deploy an App

```bash
# Deploy nginx
kubectl create deployment nginx --image=nginx

# Expose as NodePort
kubectl expose deployment nginx --port=80 --type=NodePort

# Check the assigned port (look under PORT(S))
kubectl get svc nginx

# Hit it from your local machine
curl http://<WORKER_PUBLIC_IP>:<NODE_PORT>
```

---

## Troubleshooting Tips

| Problem | Fix |
|---|---|
| `kubeadm init` fails with swap error | Run `sudo swapoff -a` and remove swap from `/etc/fstab` |
| `kubeadm init` fails with module error | Run `sudo modprobe overlay br_netfilter` |
| Node stays `NotReady` | Check CNI pods: `kubectl get pods -n kube-system` |
| Worker can't join | Regenerate token: `kubeadm token create --print-join-command` |
| DNS test fails | Wait 2 min for CoreDNS pods to reach Running state |
| `kubectl` permission denied | Re-run the `cp admin.conf` commands in Step 7 |

---

## Useful Commands Cheat-Sheet

```bash
# Node status
kubectl get nodes -o wide

# All pods across all namespaces
kubectl get pods -A

# Describe a pod (for debugging)
kubectl describe pod <POD_NAME> -n <NAMESPACE>

# Pod logs
kubectl logs <POD_NAME> -n <NAMESPACE>

# Delete a pod
kubectl delete pod <POD_NAME>

# Run a quick interactive shell
kubectl run tmp --image=busybox --restart=Never --rm -it -- sh

# Reset a node (start over) — WARNING: destructive
sudo kubeadm reset
```

---

*Happy clustering!*
