FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

COPY . .

# Python dependencies
RUN pip install --no-cache-dir -e .

# React dependencies
WORKDIR /app/app/frontend/react

RUN npm install

WORKDIR /app

EXPOSE 9090
EXPOSE 5173

CMD ["python", "app/main.py"]