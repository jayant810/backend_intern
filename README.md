# Task Management System

A scalable REST API with Authentication & Role-Based Access, and a React frontend UI.

## Features

### Backend
- **Node.js & Express**: Fast and modular backend.
- **PostgreSQL**: Robust relational database using Sequelize ORM.
- **JWT Authentication**: Secure token-based auth with password hashing (bcrypt).
- **Role-Based Access Control (RBAC)**: Different permissions for `user` and `admin`.
- **CRUD Operations**: Manage tasks with data isolation.
- **API Documentation**: Swagger UI available at `/api-docs`.
- **Validation**: Input validation for security.

### Frontend
- **React (Vite)**: Modern, fast frontend.
- **Context API**: Global state management for authentication.
- **React Router**: Client-side routing with protected routes.
- **CRUD UI**: Complete interface for managing tasks.
- **Notifications**: Real-time feedback via React-Toastify.

## Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL

### Backend Setup
1. `cd backend`
2. `npm install`
3. Create `.env` file (see `.env` template below)
4. `npm run dev`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Scalability Note

To scale this application further, the following strategies can be implemented:

1.  **Database Scalability**:
    -   **Read Replicas**: Use PostgreSQL read replicas to distribute read traffic.
    -   **Connection Pooling**: Use tools like PgBouncer to manage high numbers of concurrent database connections.

2.  **Caching**:
    -   Implement **Redis** for caching frequently accessed data (e.g., user profiles, task lists) to reduce database load.

3.  **Architecture**:
    -   **Microservices**: Split the Auth and Task modules into separate microservices to allow independent scaling and deployment.
    -   **Load Balancing**: Deploy multiple instances of the backend behind a load balancer (e.g., Nginx, AWS ALB).

4.  **Security**:
    -   Implement **Refresh Tokens** for better security and UX.
    -   Add **Rate Limiting** to prevent brute-force attacks and API abuse.

5.  **Deployment**:
    -   **Docker**: Containerize the app for consistent environments.
    -   **Kubernetes**: For automated scaling, healing, and management.
