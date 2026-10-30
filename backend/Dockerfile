FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies for PyMuPDF and Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libmupdf-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Expose port
EXPOSE 8000

# Run Alembic migrations and start FastAPI server
CMD ["sh", "-c", "alembic upgrade head && python scripts/ingest_knowledge.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
