# 🚀 K8s Lab Session: MERN Stack Deployment

Welcome to the Kubernetes Lab Session! This repository is designed to teach you how to deploy a full-stack MERN (MongoDB, Express, React, Node.js) application to a Kubernetes cluster.

---

## 🏗 Project Architecture

This project demonstrates a real-world architecture:
1.  **Ingress (Traefik)**: The entry point for all traffic. It handles routing and TLS.
2.  **Services (ClusterIP)**: Internal load balancers that distribute traffic to application pods.
3.  **Deployments**: Manage the lifecycle of the application containers (Frontend & Backend).
4.  **MongoDB**: A stateful database with persistent storage using PVC.
5.  **Config & Secrets**: Externalized configuration for easy management and security.

**Traffic Flow:**
`User` → `Ingress` → `Service` → `Pod`

---

## 🛠 Prerequisites

Before you begin, ensure you have the following installed:
-   **Docker**: To run the application locally.
-   **kubectl**: The Kubernetes command-line tool.
-   **Kubernetes Cluster**: K3s, Minikube, or a managed cluster (EKS/GKE).
    -   *Note: This lab is optimized for Traefik Ingress (default in K3s).*

---

## 💻 Running Locally (Docker Compose)

To see the app in action without Kubernetes:

1.  Navigate to the app directory:
    ```bash
    cd app
    ```
2.  Start the services:
    ```bash
    docker-compose up -d
    ```
3.  Access the app at: `http://localhost:3000`

---

## ☸️ Deploying to Kubernetes

Follow these steps to deploy the stack:

1.  **Configure Ingress Host**:
    Open `k8s/ingress/ingress.yaml` and replace `<NODE-IP>` with your actual Kubernetes node IP.
    *Example: `mern.192.168.88.13.nip.io`*

2.  **Run the Deployment Script**:
    ```bash
    ./scripts/deploy.sh
    ```

3.  **Verify the Deployment**:
    ```bash
    kubectl get pods -n k8s-lab
    ```

4.  **Access the Application**:
    Once all pods are running, open your browser and go to:
    `http://mern.<NODE-IP>.nip.io`

---

## 🧹 Cleanup

To remove all resources created during this session:
```bash
./scripts/cleanup.sh
```

---

## 🎓 Learning Points

-   **ClusterIP vs NodePort**: Why we use ClusterIP for internal services.
-   **Ingress & Middleware**: How to handle path-based routing and prefix stripping.
-   **Probes**: Liveness and Readiness probes for self-healing.
-   **Persistence**: Using PVCs to ensure MongoDB data survives pod restarts.
-   **Config Management**: Using ConfigMaps and Secrets to avoid hardcoding.

---

Happy Hacking! 🚀
