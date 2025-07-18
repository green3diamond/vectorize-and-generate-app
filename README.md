# Project Overview

This project is a full-stack application for document processing and retrieval using local and online AI models. It consists of three main components:

- backend_offline: Handles offline document indexing and similarity search using FAISS. It processes input documents and builds a searchable vector index.
- backend_online: Provides an online Python API server for interacting with language models and serving search or chat requests. It can be run in a virtual environment.
- frontend: A Next.js web application that serves as the user interface for querying documents and interacting with the backend services.

The project supports running local LLMs (such as DeepSeek via Ollama), and provides instructions for setting up both backend and frontend environments.

# Setup
## ollama
start local deepseek r1
```bash
ollama run deepseek-r1:1.5b
```

to stop ollama
```bash
pgrep ollama
sudo kill ID
```

## python online
Create and activate virtual environment
```bash
cd backend_online
python3 -m venv .venv
source .venv/bin/activate
```

Install dendencies
```bash
pip install -r requirements.txt
```

Run the python server:
```bash
python3 app.py
```

## next.js

Install dependencies:
```bash
npm install
```
start dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

