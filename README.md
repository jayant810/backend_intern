# Task Management Microservices System

A scalable Microservices-based Task Management System with Authentication, Role-Based Access Control (RBAC), Redis Caching, and a React frontend.

## 🏗 Architecture Overview

The application is split into specialized microservices for independent scaling and deployment:

- **Frontend (React + Vite)**: Modern UI with Context API and React Router.
- **Auth Service (Node.js/Express)**: Manages users, registration, login, and JWT token issuance.
- **Task Service (Node.js/Express)**: Handles task CRUD operations with Redis caching.
- **Database (PostgreSQL)**: Shared relational database for persistent storage.
- **Cache (Redis)**: High-speed in-memory cache for frequently accessed task lists.

## 🚀 Features

### Backend (Microservices)
- **Microservices Architecture**: Split into Auth and Task services.
- **PostgreSQL & Sequelize**: Robust relational data management.
- **JWT & RBAC**: Secure token-based authentication with `user` and `admin` roles.
- **Redis Caching**: Optimized task fetching with automatic cache invalidation on changes.
- **API Documentation**: Swagger UI available for each service at `/api-docs`.
- **Rate Limiting**: Protection against brute-force and API abuse.
- **Input Validation**: Secure data handling with `express-validator`.

### Frontend
- **React 19 (Vite)**: Ultra-fast development and optimized production builds.
- **Dynamic API Routing**: Smart interceptors for routing requests to the correct microservice.
- **Instant UI Updates**: Optimistic state management for immediate feedback on task actions.
- **Protected Routes**: Secure navigation based on authentication status.

## 🐳 Running with Docker (Recommended)

The easiest way to run the entire stack locally is using Docker Compose.

### Prerequisites
- Docker and Docker Compose (V2)

### Steps
1. **Clone the repository.**
2. **Start the services:**
   ```bash
   sudo docker compose up --build
   ```
3. **Access the application:**
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **Auth API**: [http://localhost:5001/api/v1](http://localhost:5001/api/v1)
   - **Task API**: [http://localhost:5002/api/v1](http://localhost:5002/api/v1)
   - **Swagger (Auth)**: [http://localhost:5001/api-docs](http://localhost:5001/api-docs)

*Note: Volumes are mapped for development, allowing for hot-reloading when code changes are made on the host.*

## ☸️ Running with Kubernetes

Manifests are provided in the `k8s/` directory for deployment to a cluster (e.g., Minikube).

1. **Build images in your cluster environment:**
   ```bash
   eval $(minikube docker-env)
   docker build -t auth-service:latest services/auth-service
   docker build -t task-service:latest services/task-service
   docker build -t backend-intern-frontend:latest frontend
   ```
2. **Apply manifests:**
   ```bash
   kubectl apply -f k8s/
   ```
3. **Access via NodePort:**
   - **Frontend**: `http://<NodeIP>:30007`
   - **Auth Service**: `http://<NodeIP>:30008`
   - **Task Service**: `http://<NodeIP>:30009`

## 🛠 Scalability & Security Implemented
- **Cache Invalidation**: Redis cache is automatically cleared on Create, Update, and Delete to ensure data consistency.
- **Refresh Tokens**: Implemented in the Auth service for better security and UX.
- **CORS & Rate Limiting**: Configured for secure cross-origin requests and protection against abuse.
- **Hot-Reloading**: Docker volumes allow instant development updates without rebuilding images.
