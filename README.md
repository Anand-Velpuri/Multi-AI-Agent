# 🤖 Multi-AI Agent System

**A production-ready, multi-model AI agent platform with real-time streaming, agentic tool use, and an end-to-end CI/CD pipeline deployed on AWS.**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Streamlit](https://img.shields.io/badge/Streamlit-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)](https://streamlit.io/)
[![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)](https://www.langchain.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)](https://langchain-ai.github.io/langgraph/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![AWS](https://img.shields.io/badge/AWS_ECS_Fargate-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](https://aws.amazon.com/fargate/)
[![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white)](https://www.jenkins.io/)
[![SonarQube](https://img.shields.io/badge/SonarQube-4E9BCD?style=for-the-badge&logo=sonarqube&logoColor=white)](https://www.sonarqube.org/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Streaming Protocol](#-streaming-protocol)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Configuration](#-configuration)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🔭 Overview

Multi-AI Agent is a full-stack platform that enables users to interact with multiple LLM models through an intelligent agent orchestration layer. Built on **LangChain** and **LangGraph**, the system supports dynamic tool use (web search via Tavily), real-time token streaming over **Server-Sent Events (SSE)**, and conversation checkpointing for persistent threads — all served through a **FastAPI** backend and a **Streamlit** frontend.

The project goes beyond a prototype: it ships with a complete **DevOps/MLOps pipeline** using Jenkins, SonarQube, Docker, AWS ECR, and AWS ECS Fargate for fully automated, production-grade deployments.

---

## 🏗 Architecture

![Architecture Diagram](images/architecture%20diagram.png)

The architecture follows a four-stage flow:

| Stage | Description |
|-------|-------------|
| **1 — Project Setup** | API keys (Groq, Tavily), virtual environment, logging, custom exceptions, and project scaffolding |
| **2 — Core (LangChain & LangGraph)** | Agent creation with LLM binding, optional tool integration, and environment-based configuration |
| **3 — Main Application** | FastAPI backend (REST + SSE streaming) and Streamlit frontend, launched concurrently via threading |
| **4 — CI/CD Pipeline** | GitHub → Jenkins → SonarQube analysis → Docker build → AWS ECR push → AWS ECS Fargate deployment |

---

## ✨ Features

### AI & Agent Capabilities

- **Multi-Model Support** — Switch between Groq-hosted LLMs (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`) at runtime
- **Agentic Tool Use** — Optional web search powered by [Tavily Search](https://tavily.com/) with up to 5 results per query
- **Conversation Checkpointing** — Persistent thread management via LangGraph's configurable thread IDs
- **Real-Time Token Streaming** — Responses streamed token-by-token using SSE for a natural, responsive UX

### Backend

- **FastAPI** with dual endpoints: synchronous (`/chat`) and streaming (`/chat/stream`)
- **Pydantic** request validation with typed schemas
- **Centralized logging** with daily rotating log files
- **Custom exception handling** with file name, line number, and error detail tracing

### Frontend

- **Streamlit** interactive UI with model selection, system prompt customization, and web search toggle
- **Live Markdown rendering** of streamed AI responses
- **Search status indicators** with expandable source URLs

### DevOps & MLOps

- **Dockerized** application with multi-port exposure (FastAPI: `9090`, Streamlit: `8501`)
- **Jenkins CI/CD** pipeline with 4 automated stages
- **SonarQube** static code analysis integration
- **AWS ECR** for container image registry
- **AWS ECS Fargate** for serverless container deployment

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Language** | Python 3.10+ |
| **LLM Provider** | [Groq](https://groq.com/) (Llama 3.3 70B, Llama 3.1 8B) |
| **Agent Framework** | LangChain, LangGraph |
| **Search Tool** | Tavily Search API |
| **Backend** | FastAPI, Uvicorn, Pydantic |
| **Frontend** | Streamlit |
| **Containerization** | Docker |
| **CI/CD** | Jenkins, SonarQube |
| **Cloud** | AWS ECR, AWS ECS Fargate |
| **Source Control** | GitHub |

---

## 📁 Project Structure

```
Multi-AI-Agent/
├── app/
│   ├── __init__.py
│   ├── main.py                          # Application entrypoint — launches backend & frontend
│   ├── backend/
│   │   ├── __init__.py
│   │   └── api.py                       # FastAPI routes (/chat, /chat/stream)
│   ├── core/
│   │   ├── __init__.py
│   │   ├── ai_agent.py                  # Synchronous agent (LangChain + Groq)
│   │   └── ai_agent_with_streaming.py   # Async streaming agent with SSE
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py                  # Environment config & allowed model names
│   ├── common/
│   │   ├── __init__.py
│   │   ├── logger.py                    # Centralized logging with daily log rotation
│   │   └── custom_exception.py          # Rich exception class with traceback details
│   └── frontend/
│       ├── __init__.py
│       └── ui.py                        # Streamlit UI with streaming response rendering
├── custom_jenkins/
│   └── Dockerfile                       # Custom Jenkins image with Docker-in-Docker support
├── images/
│   └── architecture diagram.png         # System architecture diagram
├── notebooks/
│   └── test.ipynb                       # Development & experimentation notebook
├── logs/                                # Auto-generated daily log files
├── Dockerfile                           # Production application container
├── Jenkinsfile                          # Declarative CI/CD pipeline
├── requirements.txt                     # Python dependencies
├── setup.py                             # Package configuration
├── .env                                 # Environment variables (API keys)
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10 or higher
- [Groq API Key](https://console.groq.com/)
- [Tavily API Key](https://app.tavily.com/) *(optional — required only for web search)*
- Docker *(optional — for containerized deployment)*

### 1. Clone the Repository

```bash
git clone https://github.com/Anand-Velpuri/Multi-AI-Agent.git
cd Multi-AI-Agent
```

### 2. Create & Activate a Virtual Environment

```bash
python -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate          # Windows
```

### 3. Install Dependencies

```bash
pip install -e .
```

This installs the package in editable mode along with all dependencies from `requirements.txt`.

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

### 5. Run the Application

```bash
python app/main.py
```

This launches both services concurrently:

- **FastAPI Backend** → `http://localhost:9090`
- **Streamlit Frontend** → `http://localhost:8501`

### 6. Run with Docker

```bash
docker build -t multi-ai-agent .
docker run -p 9090:9090 -p 8501:8501 --env-file .env multi-ai-agent
```

---

## 📡 API Reference

### `POST /chat`

Synchronous endpoint — returns the complete AI response after generation finishes.

**Request Body:**

```json
{
  "model_name": "llama-3.3-70b-versatile",
  "system_prompt": "You are a helpful assistant.",
  "messages": ["What is quantum computing?"],
  "allow_search": false,
  "checkpointer_id": null
}
```

**Response:**

```json
{
  "response": "Quantum computing is a type of computation that..."
}
```

---

### `POST /chat/stream`

Streaming endpoint — returns tokens in real-time via Server-Sent Events (SSE).

**Request Body:** Same schema as `/chat`.

**Response:** `text/event-stream` with the following event types:

| Event Type | Description |
|-----------|-------------|
| `checkpoint` | Returns `checkpoint_id` for new conversations |
| `content` | Individual token chunk |
| `search_start` | Signals the start of a Tavily web search with the query |
| `search_results` | Returns an array of source URLs from the search |
| `end` | Signals the end of the response stream |

---

## 📨 Streaming Protocol

The streaming architecture uses **Server-Sent Events (SSE)** for real-time token delivery:

```
Client (Streamlit)            Server (FastAPI)              Agent (LangGraph)
       |                            |                              |
       |---- POST /chat/stream ---->|                              |
       |                            |---- astream_events() ------->|
       |                            |                              |
       |<-- SSE: checkpoint --------|                              |
       |<-- SSE: content (token) ---|<---- on_chat_model_stream ---|
       |<-- SSE: content (token) ---|<---- on_chat_model_stream ---|
       |<-- SSE: search_start ------|<---- on_chat_model_end ------|
       |<-- SSE: search_results ----|<---- on_tool_end ------------|
       |<-- SSE: content (token) ---|<---- on_chat_model_stream ---|
       |<-- SSE: end ---------------|                              |
       |                            |                              |
```

Each SSE event is a JSON-encoded data line:

```
data: {"type": "content", "content": "Hello"}

data: {"type": "search_start", "query": "latest AI news"}

data: {"type": "end"}
```

---

## ⚙️ CI/CD Pipeline

The project uses a fully automated Jenkins pipeline that triggers on every push to `main`:

```
GitHub Push --> Jenkins Trigger --> SonarQube Analysis --> Docker Build --> AWS ECR Push --> ECS Fargate Deploy
```

### Pipeline Stages

| Stage | Description |
|-------|-------------|
| **1. Clone** | Checks out the `main` branch from GitHub using stored credentials |
| **2. SonarQube Analysis** | Runs static code quality analysis via the SonarQube scanner |
| **3. Build & Push to ECR** | Builds the Docker image and pushes it to AWS Elastic Container Registry |
| **4. Deploy to ECS Fargate** | Forces a new deployment on the ECS service for zero-downtime rollout |

### Custom Jenkins Image

The `custom_jenkins/` directory contains a Dockerfile that extends the official Jenkins LTS image with Docker CLI support, enabling Docker-in-Docker (DinD) workflows for containerized builds.

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | API key for Groq LLM inference |
| `TAVILY_API_KEY` | Optional | API key for Tavily web search (required only if web search is enabled) |

### Supported Models

| Model | Description |
|-------|-------------|
| `llama-3.3-70b-versatile` | High-capability 70B parameter model for complex reasoning |
| `llama-3.1-8b-instant` | Fast, lightweight 8B parameter model for quick responses |

Models can be configured in `app/config/settings.py`.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 📬 Contact

**Anand Velpuri**

[![GitHub](https://img.shields.io/badge/GitHub-Anand--Velpuri-181717?style=flat-square&logo=github)](https://github.com/Anand-Velpuri)
[![Email](https://img.shields.io/badge/Email-velpurianand8005%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:velpurianand8005@gmail.com)

---

**⭐ If you found this project useful, please consider giving it a star!**
