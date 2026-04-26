# Kubernetes Zero-Downtime Cluster Upgrade Lab

> **Lab goal:** Upgrade a running Kubernetes cluster from v1.28 → v1.29 without dropping the demo app
> **Cluster is already running when you log in.** No installation needed.

---

## What's Already Running

| Component | Details |
|---|---|
| Kubernetes | v1.28 |
| Nodes | s1-master + s1-worker |
| Demo app | `nginx-demo` in namespace `upgrade-demo` — 3 replicas |
| PodDisruptionBudget | `minAvailable: 2` (at least 2/3 pods stay up during drain) |
| Demo app URL | `http://<WORKER-PUBLIC-IP>:30080` |

---

## 0. SSH Into Master

```bash
ssh ubuntu@<MASTER-PUBLIC-IP>
# password: devops123
```

---

## 1. Verify the Cluster Before Upgrade

```bash
# Check current version
kubectl version --short

# Both nodes should be Ready
kubectl get nodes -o wide

# Demo app pods should be Running
kubectl get pods -n upgrade-demo -o wide

# PodDisruptionBudget in place
kubectl get pdb -n upgrade-demo

# Open a second terminal and keep this running during upgrade
watch kubectl get pods -n upgrade-demo -o wide
```

---

## 2. Verify the Demo App is Reachable

```bash
# From your local machine
curl http://<WORKER-PUBLIC-IP>:30080
# Should return nginx welcome page
```

Keep this curl running in a loop during the upgrade to verify zero downtime:

```bash
while true; do
  curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" http://<WORKER-PUBLIC-IP>:30080
  sleep 2
done
```

---

## 3. Upgrade the Master Node

### Step 3a — Upgrade kubeadm on master

```bash
# Unhold packages so we can upgrade
sudo apt-mark unhold kubeadm kubectl kubelet

# Check available 1.29 versions
apt-cache madison kubeadm | grep 1.29

# Add the v1.29 repository
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key \
  | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] \
https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /" \
  | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt-get update

# Install new kubeadm
sudo apt-get install -y kubeadm=1.29.*

# Verify
kubeadm version
```

### Step 3b — Check the upgrade plan

```bash
sudo kubeadm upgrade plan
```

You will see what will be upgraded and to which version. Look for the line:

```
You can now apply the upgrade by executing the following command:
    kubeadm upgrade apply v1.29.x
```

### Step 3c — Apply the upgrade

```bash
sudo kubeadm upgrade apply v1.29.x   # replace x with the patch version shown above
```

This upgrades the control plane components (API server, scheduler, controller-manager, etcd).
Takes ~2-3 minutes. The demo app keeps running during this — control plane upgrade doesn't evict pods.

### Step 3e — Upgrade kubelet and kubectl on master

```bash
sudo apt-get install -y kubelet=1.29.* kubectl=1.29.*

sudo systemctl daemon-reload
sudo systemctl restart kubelet
```

### Step 3f — Uncordon the master

```bash
kubectl uncordon s1-master

# Verify master is back
kubectl get nodes
```

Expected:

```
NAME        STATUS   ROLES           AGE   VERSION
s1-master   Ready    control-plane   30m   v1.29.x   ← upgraded
s1-worker   Ready    <none>          28m   v1.28.x   ← still old
```

---

## 4. Upgrade the Worker Node

> SSH into the **master** to drain the worker, then SSH into the **worker** to upgrade it.

### Step 4a — Drain the worker (run on master)

```bash

kubectl taint nodes --all node-role.kubernetes.io/control-plane

kubectl drain s1-worker --ignore-daemonsets --delete-emptydir-data
```

Watch the `watch` terminal — nginx pods reschedule to master (or pending if no room).
The PDB prevents all 3 from being evicted at once.

### Step 4b — SSH into the worker

```bash
ssh ubuntu@<WORKER-PUBLIC-IP>
# password: devops123
```

### Step 4c — Upgrade kubeadm on worker

```bash
sudo apt-mark unhold kubeadm kubectl kubelet

# Add the v1.29 repository
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key \
  | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] \
https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /" \
  | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt-get update
sudo apt-get install -y kubeadm=1.29.*
```

### Step 4d — Upgrade the worker node config

```bash
# This upgrades the kubelet config on this node
sudo kubeadm upgrade node
```

### Step 4e — Upgrade kubelet and kubectl on worker

```bash
sudo apt-get install -y kubelet=1.29.* kubectl=1.29.*

sudo systemctl daemon-reload
sudo systemctl restart kubelet
```

### Step 4f — Uncordon the worker (run on master)

```bash
kubectl uncordon s1-worker
```

---

## 5. Verify Upgrade Complete

```bash
# Both nodes should show v1.29
kubectl get nodes -o wide
```

Expected:

```
NAME        STATUS   ROLES           AGE   VERSION
s1-master   Ready    control-plane   40m   v1.29.x
s1-worker   Ready    <none>          38m   v1.29.x
```

```bash
# All demo pods back and Running
kubectl get pods -n upgrade-demo -o wide

# Demo app still reachable
curl http://<WORKER-PUBLIC-IP>:30080

# Cluster info
kubectl cluster-info
kubectl version --short
```

---

## 6. Verify Zero Downtime

Check the curl loop output you left running. Every line should show `200` — no failures.

```
200 0.023s
200 0.019s
200 0.021s   ← stayed 200 throughout the entire upgrade
200 0.024s
```

---

## Key Concepts Covered

| Concept | What you practiced |
|---|---|
| `kubeadm upgrade plan` | Inspect what will change before applying |
| `kubeadm upgrade apply` | Upgrade the control plane components |
| `kubeadm upgrade node` | Sync kubelet config on worker |
| `kubectl drain` | Safely evict pods before upgrading a node |
| `kubectl uncordon` | Bring node back into scheduling |
| PodDisruptionBudget | Guarantees minimum pod availability during voluntary disruptions |
| One minor version at a time | K8s only supports N → N+1 minor upgrades |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `kubectl drain` hangs | Add `--force` flag for pods without a controller |
| Node stays `NotReady` after upgrade | Check `journalctl -u kubelet -f` on that node |
| kubeadm can't find 1.29 packages | Verify the apt source file and run `apt-get update` |
| Demo app returns 502 | Wait 30s — pods are rescheduling, curl will recover |
| `upgrade apply` fails version skew check | Ensure kubeadm itself is on 1.29 before running apply |

---

## Useful Commands During the Lab

```bash
# Watch nodes in real time
watch kubectl get nodes

# Watch pods in upgrade-demo namespace
watch kubectl get pods -n upgrade-demo -o wide

# Check kubelet version on a node
kubectl get node s1-worker -o jsonpath='{.status.nodeInfo.kubeletVersion}'

# Check component versions
kubectl version --short

# Check PDB status
kubectl get pdb -n upgrade-demo

# Describe PDB (shows disruptions allowed)
kubectl describe pdb nginx-demo-pdb -n upgrade-demo

# Regenerate join token if needed
kubeadm token create --print-join-command
```
