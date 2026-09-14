FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

COPY backend /app/backend
# Also need to copy the proto files if we don't compile them into a shared package
COPY model/proto /app/model/proto

# Expose the FastAPI port
EXPOSE 8000

# Run FastAPI
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
