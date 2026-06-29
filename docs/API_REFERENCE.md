# 🔌 API Reference & Integration

Guidfy’s backend exposes a robust, RESTful application programming interface (API) built with Node.js and Express.js. This API serves as the primary data gateway for the Next.js frontend and acts as an orchestrator for the Python AI Service.

---

## 1. REST API Design Principles

The Node.js backend adheres strictly to REST architectural constraints:
- **Stateless:** Every request from client to server contains all necessary information to process it. No client context is stored on the server between requests.
- **Resource-Based URLs:** Endpoints are named using nouns representing entities (e.g., `/api/users`, `/api/roadmaps`).
- **Standard HTTP Methods:** 
  - `GET`: Retrieve data.
  - `POST`: Create new entities or submit data.
  - `PUT`/`PATCH`: Update existing entities.
  - `DELETE`: Remove entities.
- **Standard HTTP Status Codes:** `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`.
- **JSON Payload:** All requests and responses use `application/json`.

---

## 2. Core API Endpoints (Node.js)

Below is a high-level summary of the primary API groups available in the Node.js backend. All routes are prefixed with `/api`.

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Security |
| :--- | :--- | :--- | :--- |
| `POST` | `/login` | Authenticate user and issue JWT | Public |
| `POST` | `/register` | Register a new user account | Public |
| `GET` | `/me` | Fetch currently authenticated user profile | Bearer Token |

### 📚 Learning Content (`/api/learning-paths` & `/api/roadmaps`)
| Method | Endpoint | Description | Security |
| :--- | :--- | :--- | :--- |
| `GET` | `/learning-paths` | Retrieve all learning paths | Public/User |
| `GET` | `/roadmaps/:id` | Fetch roadmap details and steps | User |
| `POST` | `/admin/roadmaps` | Create a new roadmap | Admin |

### 👥 Community (`/api/community`)
| Method | Endpoint | Description | Security |
| :--- | :--- | :--- | :--- |
| `GET` | `/questions` | List community questions/feed | User |
| `POST` | `/questions` | Ask a new question | User |
| `POST` | `/questions/:id/answers` | Post an answer to a question | User |

---

## 3. AI Service API (Python / FastAPI)

The AI Microservice (located in `backend/ai_service`) is built with **FastAPI**. Instead of manually maintaining documentation for its endpoints, FastAPI automatically generates interactive documentation based on the code's OpenAPI schema.

### How to Access AI Interactive Docs
When the AI service is running locally (`uvicorn main:app --port 4000`), you can access the automated documentation through two distinct interfaces:

1. **Swagger UI:** Navigate to `http://localhost:4000/docs`. This provides an interactive portal where you can test ML endpoints directly from the browser.
2. **ReDoc:** Navigate to `http://localhost:4000/redoc`. This provides a more traditional, deeply detailed, and scannable reference document.

> [!WARNING]
> **Internal Traffic Only**
> The AI endpoints are designed to be consumed *internally* by the Node.js backend. Direct calls from the Next.js frontend to `localhost:4000` will fail CORS policies by design.

---

## 4. Postman Integration

To accelerate frontend development and API testing, a comprehensive **Postman Collection** is maintained. 

**Usage:**
1. Import the exported `Guidfy_API_Collection.json` file into your Postman workspace.
2. Set up a Postman Environment variable named `{{jwt_token}}`.
3. Hit the `/api/auth/login` endpoint. A test script automatically captures the returned token and populates the `{{jwt_token}}` variable for all subsequent protected requests.
