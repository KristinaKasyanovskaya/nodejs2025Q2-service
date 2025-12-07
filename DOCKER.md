# Docker Setup Guide

## Using Colima (macOS)

Colima is a lightweight alternative to Docker Desktop for macOS. Follow these steps to run the application with Colima:

### 1. Install Colima (if not already installed)

```bash
brew install colima
```

### 2. Start Colima

```bash
colima start
```

This will start a Linux VM with Docker support.

### 3. Set Docker Context

Make sure Docker CLI is using Colima:

```bash
docker context use colima
```

Verify it's working:

```bash
docker ps
```

### 4. Build and Run

Navigate to the project directory and run:

```bash
docker-compose up --build
```

This will:
- Build the NestJS application image
- Start PostgreSQL container
- Start the application container
- Wait for PostgreSQL to be ready before starting the app

### 5. Access the Application

- **API**: http://localhost:4000
- **PostgreSQL**: localhost:5432
  - User: postgres
  - Password: postgres
  - Database: home_library

### 6. Stop Containers

```bash
docker-compose down
```

To also remove volumes (database data):

```bash
docker-compose down -v
```

### 7. View Logs

```bash
docker-compose logs -f
```

Or for a specific service:

```bash
docker-compose logs -f app
docker-compose logs -f postgres
```

## Troubleshooting

### Colima not starting

If Colima fails to start, try:

```bash
colima stop
colima start
```

### Docker context issues

List available contexts:

```bash
docker context ls
```

Switch to Colima:

```bash
docker context use colima
```

### Port already in use

If port 4000 or 5432 is already in use, update the `.env` file or `docker-compose.yml` to use different ports.

### Database connection issues

Make sure the PostgreSQL container is healthy:

```bash
docker-compose ps
```

Check PostgreSQL logs:

```bash
docker-compose logs postgres
```

## Environment Variables

You can customize the setup by creating a `.env` file:

```env
PORT=4000
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=home_library
POSTGRES_PORT=5432
```

These values are used by both `docker-compose.yml` and the application.

