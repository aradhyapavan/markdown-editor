# syntax=docker/dockerfile:1
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
  && rm -rf /var/lib/apt/lists/*

# Install Python deps first (better caching)
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy app
COPY . .

# Hugging Face Spaces will provide PORT; default to 7860 locally
ENV PORT=7860

# Expose for local runs (HF ignores EXPOSE)
EXPOSE 7860

# Gunicorn config
ENV GUNICORN_CMD_ARGS="--workers=2 --threads=4 --timeout=120 --bind=0.0.0.0:${PORT}"

# Start server
CMD ["bash", "-lc", "exec gunicorn app:app"]


