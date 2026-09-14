# Frontend Web App

This directory contains the Vite + React frontend for the AI Video Detector project.

## Local Development

```bash
# Install dependencies
npm install

# Start the local development server
npm run dev
```

## Docker

This service is containerized using Node.js for development or Nginx for production.
To build and run it individually (dev mode):

```bash
docker build -t aivideo-frontend .
docker run -p 5173:5173 -v $(pwd):/app -v /app/node_modules aivideo-frontend
```
