# IMF Gadget API Documentation

## 📖 Overview

The IMF Gadget API is a sophisticated, secure system designed for managing high-tech gadgets used by the Impossible Missions Force. This comprehensive API provides robust functionality for tracking, maintaining, and controlling mission-critical equipment with enterprise-grade security features.

---

## Links

https://www.loom.com/share/fef202af89364bd1a0873eabe559829d

### Postman Collection Link : https://imf-gadget-8462.postman.co/workspace/IMF-Gadget-Workspace~760fa289-d5bf-42f2-9ae8-411d0ae51f2a/request/34642197-6e5a106c-b6bb-4f0d-94db-bd6f2d7db815?action=share&creator=34642197&ctx=documentation

---
## 🚨 Important Authentication Note

- Bearer tokens are REQUIRED for ALL API endpoints EXCEPT `GET All Gadgets` route to retrieve gadgets so always include the bearer token in your request headers.
- To obtain a bearer token, send a **`POST gadget`** request to the authentication endpoint.
- Bearer Token Generation : The token will be generated and must be included in the Authorization header for subsequent requests.
- Watch the authentication video tutorial for detailed guidance and refer to the Postman collection for example request configurations
  
---

## 🚀 Key Features

### Gadget Management
- Complete inventory tracking with dynamic mission success probability
- Unique codename generation for each gadget
- Comprehensive status tracking (Available, Deployed, Decommissioned)
- Detailed gadget information management

### Security Features
- JWT-based authentication
- Secure self-destruct sequence with confirmation protocols
- Soft deletion mechanism to preserve historical records

---

## 💻 Technical Architecture

### Technology Stack

- Backend: Node.js with Express.js (TypeScript)
- Database: PostgreSQL
- ORM: Sequelize
- Authentication: JSON Web Tokens (JWT)
- Caching: Redis
- Deployment: Render
- Containerization: Docker

### Project Structure
```
IMF-Gadget-API/
│
├── src/
│   ├── libs/
│   │   ├── database.ts       # Postgres database configuration
│   │   ├── helper.ts         # Utility functions
│   │   ├── middleware.ts     # Authentication middleware
│   │   └── redis.ts          # Redis cache client
│   │
│   ├── gadgetController.ts   # Business logic
│   ├── gadgetModels.ts       # Data models
│   ├── gadgetRoutes.ts       # API route definitions
│   └── index.ts              # Application entry point
│
├── Dockerfile                # Docker configuration
└── docker-compose.yml        # Multi-container orchestration
```

---

## 🌐 API Endpoints

1. Get All Gadgets

- Endpoint : **GET** `/gadgets`
- Description : Retrieves all gadgets with randomly generated mission success probability
- Response Example:
    ```json
    [
        {
        "id": "fd5bad1d-ac65-4c57-9ade-6e6b3521de86",
        "name": "Superhero",
        "codename": "Operation Kraken",
        "status": "Available",
        "missionSuccessProbability": 87,
        "decommissionedAt": null,
        "createdAt": "2025-01-26T12:46:57.570Z",
        "updatedAt": "2025-01-26T12:46:57.570Z"
        },
    ]
    ```

2. Filter Gadgets by Status

    - Endpoint : **GET** `/gadgets?status=Available`
    - Description : Retrieves gadgets filtered by specific status
    - Supported Statuses : Available, Deployed, Decommissioned

3. Get Gadget by ID

    - Endpoint : **GET** `/gadgets/:id`
    - Description : Retrieves a single gadget by its unique identifier

4. Create Gadget

    - Endpoint : **POST** `/gadgets`
    - Description: Adds a new gadget to inventory
    - Request Payload:
        ```json
        {
        "name": "Advanced Tracking Device"
        }
        ```
    - Features :
        - Automatically generates unique codename
        - Assigns default "Available" status
        - Generates random mission success probability


5. Update Gadget

    - Endpoint : **PATCH** `/gadgets/:id`
    - Description : Modify existing gadget information
    - Request Payload :
        ```json
        {
        "name": "Enhanced Tracking Device",
        "status": "Deployed"
        }
        ```

6. Decommission Gadget

    - Endpoint : **DELETE** `/gadgets/:id`
    - Description : Marks gadget as "Decommissioned"
    - Action :
        - Sets status to Decommissioned
        - Records decommission timestamp
        - Prevents permanent data deletion

7. Self-Destruct Sequence

    - Endpoint : **POST** `/gadgets/:id/self-destruct`
    - Description : Initiates gadget self-destruction protocol
    - Response Example :

        ```json
        {
        "message": "Self-destruct sequence initiated.",
        "confirmationCode": "ABCD1234"
        }
        ```

## 🔧 Local Development Setup

### Prerequisites

- Node.js (v14+)
- PostgreSQL
- Redis
- Docker & Docker Compose

### Installation Steps

1. Clone the repository :
```bash
git clone https://github.com/Rushhaabhhh/IMF-Gadget-API.git
cd IMF-Gadget-API
```

2. Create the Environment File : Copy the contents of the .env.example file in .env for Environment Configuration
```bash
cp en.example .env
```

3. Start containers
```bash
docker-compose up 
```
