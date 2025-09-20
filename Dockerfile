# Use official Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy requirements (if you don’t have one, we’ll handle below)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY . .

# Expose port Flask will run on
EXPOSE 5000

# Run the app
CMD ["python", "app.py"]
