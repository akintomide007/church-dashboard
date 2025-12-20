# Backend Setup Guide

## Prerequisites

- Python 3.9+
- Docker & Docker Compose
- NVIDIA GPU with drivers (for Ollama)
- 16GB+ RAM recommended

## Step 1: Start Services
```bash
# Start all Docker services
docker-compose up -d

# Check services are running
docker ps
```

Expected services:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Qdrant (port 6333)
- Ollama (port 11434)

## Step 2: Install Python Dependencies
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Step 3: Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env
```

## Step 4: Initialize Database

The database will be automatically initialized from `init.sql` when PostgreSQL starts.

Verify:
```bash
docker exec -it church-rag-postgres psql -U postgres -d church_rag -c "\dt"
```

## Step 5: Initialize Qdrant
```bash
python -m app.scripts.init_qdrant
```

## Step 6: Pull Ollama Models
```bash
# Pull the LLM model
docker exec -it church-rag-ollama ollama pull llama3.1:8b

# Verify
docker exec -it church-rag-ollama ollama list
```

## Step 7: Start Backend API
```bash
# Run FastAPI server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or use the app directly:
```bash
python app/main.py
```

## Step 8: Test API

Open browser: http://localhost:8000/docs

You should see the FastAPI Swagger documentation.

## Step 9: Connect Frontend

Update frontend `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_OLLAMA_URL=http://localhost:11434
```

## Troubleshooting

**Ollama not using GPU:**
```bash
# Check NVIDIA drivers
nvidia-smi

# Check Docker GPU access
docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi
```

**Qdrant connection error:**
```bash
# Check Qdrant is running
curl http://localhost:6333/collections
```

**Database connection error:**
```bash
# Check PostgreSQL
docker logs church-rag-postgres
```