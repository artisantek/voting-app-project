# Use an official lightweight Python image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the source code
COPY . .

# Install Python dependencies
RUN pip install -r requirements.txt

# Expose the port the app runs on (matching app.run port)
EXPOSE 80

CMD ["python", "app.py"]