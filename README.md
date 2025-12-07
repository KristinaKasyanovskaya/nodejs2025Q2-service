# Home Library Service

## Prerequisites

- Node.js 24.10.0 or higher
- Docker (or Colima for macOS)
- npm or yarn

## Running with Docker (Recommended)

### Using Colima (macOS)

If you're using Colima instead of Docker Desktop:

1. **Start Colima:**
   ```bash
   colima start
   ```

2. **Set Docker context to Colima:**
   ```bash
   docker context use colima
   ```

3. **Create `.env` file** (optional, defaults are provided):
   ```bash
   PORT=4000
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=home_library
   POSTGRES_HOST=postgres
   POSTGRES_PORT=5432
   ```

4. **Build and start containers:**
   ```bash
   docker-compose up --build
   ```

5. **Access the application:**
   - API: `http://localhost:4000`
   - PostgreSQL: `localhost:5432`

### Using Docker Desktop

1. **Create `.env` file** (optional):
   ```bash
   PORT=4000
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=home_library
   ```

2. **Build and start containers:**
   ```bash
   docker-compose up --build
   ```

### Docker Commands

- **Stop containers:** `docker-compose down`
- **View logs:** `docker-compose logs -f`
- **Rebuild:** `docker-compose up --build`
- **Stop and remove volumes:** `docker-compose down -v`

## Running Locally (Development)

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup PostgreSQL Database

Make sure PostgreSQL is running locally, then create a database:

```bash
createdb home_library
```

Or using psql:
```sql
CREATE DATABASE home_library;
```

### 3. Environment Variables Setup

Create a `.env` file in the project root:

```bash
PORT=4000
NODE_ENV=development
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=home_library
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/home_library
```

### 4. Start the Application

**Development mode (with auto-reload):**

```bash
npm run start:dev
```

**Normal mode:**

```bash
npm start
```

**Production mode (after build):**

```bash
npm run build
npm run start:prod
```

The application will be available at: `http://localhost:4000`

## Testing the Application

### 1. Testing with curl

**Get all users:**

```bash
curl http://localhost:4000/user -H "Accept: application/json"
```

**Get all tracks:**

```bash
curl http://localhost:4000/track -H "Accept: application/json"
```

**Get all artists:**

```bash
curl http://localhost:4000/artist -H "Accept: application/json"
```

**Get all albums:**

```bash
curl http://localhost:4000/album -H "Accept: application/json"
```

**Get favorites:**

```bash
curl http://localhost:4000/favs -H "Accept: application/json"
```

**Create a user:**

```bash
curl -X POST http://localhost:4000/user \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"login":"testuser","password":"testpass123"}'
```

**Create a track:**

```bash
curl -X POST http://localhost:4000/track \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"name":"Test Track","duration":180,"artistId":null,"albumId":null}'
```

**Create an artist:**

```bash
curl -X POST http://localhost:4000/artist \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"name":"Test Artist","grammy":false}'
```

**Create an album:**

```bash
curl -X POST http://localhost:4000/album \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"name":"Test Album","year":2024,"artistId":null}'
```

### 2. Running Tests

**All tests:**

```bash
npm test
```

**Auth tests:**

```bash
npm run test:auth
```

**Tests with coverage:**

```bash
npm run test:cov
```

### 3. Testing via Browser

Open in your browser:

- `http://localhost:4000/user` - list of users
- `http://localhost:4000/track` - list of tracks
- `http://localhost:4000/artist` - list of artists
- `http://localhost:4000/album` - list of albums
- `http://localhost:4000/favs` - favorites

## Available Endpoints

### Users (`/user`)

- `GET /user` - get all users
- `GET /user/:id` - get user by ID
- `POST /user` - create a user
- `PUT /user/:id` - update user password
- `DELETE /user/:id` - delete a user

### Tracks (`/track`)

- `GET /track` - get all tracks
- `GET /track/:id` - get track by ID
- `POST /track` - create a track
- `PUT /track/:id` - update a track
- `DELETE /track/:id` - delete a track

### Artists (`/artist`)

- `GET /artist` - get all artists
- `GET /artist/:id` - get artist by ID
- `POST /artist` - create an artist
- `PUT /artist/:id` - update an artist
- `DELETE /artist/:id` - delete an artist

### Albums (`/album`)

- `GET /album` - get all albums
- `GET /album/:id` - get album by ID
- `POST /album` - create an album
- `PUT /album/:id` - update an album
- `DELETE /album/:id` - delete an album

### Favorites (`/favs`)

- `GET /favs` - get all favorites
- `POST /favs/track/:id` - add track to favorites
- `DELETE /favs/track/:id` - remove track from favorites
- `POST /favs/album/:id` - add album to favorites
- `DELETE /favs/album/:id` - remove album from favorites
- `POST /favs/artist/:id` - add artist to favorites
- `DELETE /favs/artist/:id` - remove artist from favorites

## Data Format

All requests and responses use `application/json` format.

## Validation

All incoming requests are automatically validated. Invalid data returns a 400 status with error descriptions.

## Features

- **PostgreSQL Database**: Persistent data storage using PostgreSQL
- **TypeORM**: Object-Relational Mapping for database operations
- **Docker Support**: Multi-container setup with Docker Compose
- **Modular architecture**: Organized into domain-specific modules (User, Track, Artist, Album, Favorites)
- **Request validation**: Automatic validation of request bodies using class-validator
- **Cascading deletion**: When an Artist, Album, or Track is deleted, its ID is removed from favorites and references in other entities are set to null
- **Password exclusion**: User passwords are never returned in API responses
- **UUID validation**: All ID parameters are validated as UUID v4
- **Database migrations**: Automatic schema synchronization in development mode

## Database Schema

The application uses the following database tables:
- `users` - User accounts
- `artists` - Music artists
- `albums` - Music albums
- `tracks` - Music tracks
- `favorite_artists` - User favorite artists
- `favorite_albums` - User favorite albums
- `favorite_tracks` - User favorite tracks
