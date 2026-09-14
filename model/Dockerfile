FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV and other ML tools
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from root (assuming build context is root or we copy it specifically)
# Note: In docker-compose, the build context should be the root directory to access global requirements
COPY requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

# Copy the model source code
COPY model /app/model

# Expose the gRPC port
EXPOSE 50051

# Run the gRPC server
CMD ["python", "-m", "model.server"]
