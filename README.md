<div align="center">
  <br />
  <h1>🚀 Guidfy</h1>
  <p>
    <strong>Empowering Personalized Career and Learning Journeys using AI</strong>
  </p>
  <br />
</div>

## 📖 Project Overview

**Guidfy** is an enterprise-grade, AI-driven educational and career guidance platform. Designed as a comprehensive graduation project, Guidfy aims to bridge the gap between education and industry requirements. By leveraging artificial intelligence, it provides highly personalized learning paths, interactive roadmaps, and career reports tailored to individual user strengths and market demands.

### ✨ Core Value Proposition
- **Adaptive Learning:** Dynamically generated roadmaps and quizzes that adapt to the user's progress.
- **AI-Powered Career Guidance:** Deep-learning algorithms analyze user performance to recommend optimal career trajectories.
- **Collaborative Community:** A built-in social feed for knowledge sharing, Q&A, and networking among peers and mentors.
- **Enterprise Administration:** Robust, multi-tiered dashboards for granular control over content, users, and system analytics.

---

## 🛠 Tech Stack Overview

Guidfy is built using a modern, distributed microservices architecture to ensure scalability, security, and high performance.

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js (App Router), React, Tailwind CSS, Framer Motion | A blazingly fast, responsive, and animated user interface optimized for SEO and UX. |
| **Backend API** | Node.js, Express.js, Prisma ORM | A robust, scalable RESTful API handling core business logic, secure authentication, and data persistence. |
| **AI Service** | Python, FastAPI, Scikit-learn/TensorFlow | An independent, high-performance microservice dedicated to generating intelligent career reports and predictions. |

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your local machine:
- **Node.js** (v18.0.0 or higher) & **npm**
- **Python** (v3.9 or higher) & **pip**
- **PostgreSQL** or your preferred SQL database (running locally or via Docker)
- **Git**

---

## 🚀 Local Installation & Setup Guide

To run Guidfy locally, you need to spin up all three services. Follow the step-by-step guide below.

### 1. Clone the Repository

```bash
git clone https://github.com/KARIM2206/guidfy.git
cd guidfy
```

### 2. Setup the AI Service (Python / FastAPI)

The AI service handles career predictions and requires a Python environment.

```bash
# Navigate to the AI service directory
cd backend/ai_service

# Create a virtual environment (Recommended)
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install the required dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 4000
```
> [!NOTE]  
> The AI service will be available at `http://localhost:4000`. You can view the interactive API docs at `http://localhost:4000/docs`.

### 3. Setup the Backend (Node.js / Express / Prisma)

Open a **new terminal window** and configure the main Node.js backend.

```bash
# Navigate to the backend directory
cd backend

# Install Node.js dependencies
npm install

# Configure Environment Variables
cp .env.example .env
# Edit the .env file and add your DATABASE_URL, JWT_SECRET, etc.

# Run Prisma Migrations to setup the database schema
npx prisma migrate dev --name init
# Or if the schema is already established, push it directly:
npx prisma db push

# (Optional) Seed the database with initial roles and dummy data
npx prisma db seed

# Start the Express server
npm run dev
```
> [!IMPORTANT]  
> Ensure your database is running before executing Prisma commands. The backend API will start on `http://localhost:8000`.

### 4. Setup the Frontend (Next.js)

Open a **third terminal window** for the user interface.

```bash
# Navigate to the frontend directory
cd guidfy

# Install Node.js dependencies
npm install

# Configure Environment Variables
cp .env.example .env.local
# Edit the .env.local file to point to your backend API URL (e.g., NEXT_PUBLIC_API_URL=http://localhost:8000/api)

# Start the Next.js development server
npm run dev
```
> [!SUCCESS]  
> The frontend application is now running! Visit `http://localhost:5000` (or the port specified in your terminal) to experience Guidfy.

---

## 📚 Documentation Directory

For deeper insights into the architecture, database, and APIs, please refer to the dedicated documentation files located in the `docs/` folder:

- 🏛 **[System Architecture & Security](./docs/ARCHITECTURE.md)**
- 🗄 **[Database Schema & Models](./docs/DATABASE_SCHEMA.md)**
- 🔌 **[API Reference & Integration](./docs/API_REFERENCE.md)**
- ✨ **[Product Features & Capabilities](./docs/FEATURES.md)**

---

<div align="center">
  <i>Developed with ❤️ for the Graduation Project Evaluation.</i>
</div>