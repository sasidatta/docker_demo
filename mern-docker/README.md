# MERN Stack Docker Setup (Custom Network)

This repository contains instructions to run a **MERN stack application** (MongoDB, Backend, Frontend) using **separate Docker containers** connected via a **custom Docker network**.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [1️⃣ Create a Custom Network](#1️⃣-create-a-custom-network)
- [2️⃣ Start MongoDB](#2️⃣-start-mongodb)
- [3️⃣ Build and Run Backend](#3️⃣-build-and-run-backend)
- [4️⃣ Build and Run Frontend](#4️⃣-build-and-run-frontend)
- [5️⃣ Verify Running Containers](#5️⃣-verify-running-containers)
- [6️⃣ Access the Application](#6️⃣-access-the-application)
- [7️⃣ Stop & Remove Containers](#7️⃣-stop--remove-containers)
- [✅ Benefits](#✅-benefits)

---

## Prerequisites

- [Docker](https://www.docker.com/) installed on your system  
- Basic knowledge of terminal commands  
- Familiarity with Node.js / MongoDB (optional)

---

## Project Structure
---

project/
├─ backend/
│  └─ Dockerfile
├─ frontend/
│  ├─ Dockerfile
│  └─ nginx/
│     └─ default.conf
├─ nginx/
│  └─ Dockerfile
└─ README.md

### Explanation

- **backend/** – Contains the backend application and its Dockerfile  
- **frontend/** – Contains the frontend application and its Dockerfile  
  - **nginx/default.conf** – Nginx configuration for serving the frontend  
- **nginx/** – Optional separate Dockerfile if you want a dedicated Nginx container for frontend  
- **README.md** – Project documentation  

---

If you want, I can **update your full README.md** including this Nginx setup and explain how to run the frontend via Nginx container properly.  

Do you want me to do that?

## 1️⃣ Create a Custom Network

Create a network for all containers to communicate:

```bash
docker network create mern_network
```
2️⃣ Start MongoDB

Create a Docker volume for data persistence and start MongoDB:
```bash
docker volume create mongo_data

docker run -d \
  --name mongo \
  --network mern_network \
  -v mongo_data:/data/db \
  -p 27017:27017 \
  mongo:6
```
•	MongoDB URL for backend: mongodb://mongo:27017/mern

3️⃣ Build and Run Backend

Build the backend Docker image:
```bash
docker build -t backend_image ./backend
```
Run the backend container:
```bash
docker run -d \
  --name backend \
  --network mern_network \
  -p 5000:5000 \
  -e MONGO_URL=mongodb://mongo:27017/mern \
  backend_image
```
  	•	Backend communicates with MongoDB using hostname mongo.

4️⃣ Build and Run Frontend

Build the frontend Docker image:
```bash
docker build -t frontend_image ./frontend
```

Run the frontend container:

```bash
docker run -d \
  --name frontend \
  --network mern_network \
  -p 3000:80 \
  frontend_image
```

   •Frontend communicates with the backend using hostname backend.
   •Example: http://backend:5000/api/... from within frontend container.


5️⃣ Verify Running Containers

Check all running containers:
```bash
docker ps
```

Check network connectivity:
```bash
docker network inspect mern_network
```
You should see mongo, backend, and frontend connected.



⸻

6️⃣ Access the Application

   -  Frontend: http://localhost:3000
	
   - Backend API: http://localhost:5000

   - MongoDB: mongodb://localhost:27017/mern

Inside containers, use hostnames: mongo for MongoDB, backend for backend.

⸻

7️⃣ Stop & Remove Containers

Stop containers:
```bash
docker stop frontend backend mongo
```

Remove containers:
```bash
docker rm frontend backend mongo
```

Optional: remove volume and network:
```bash
docker volume rm mongo_data
docker network rm mern_network
```
