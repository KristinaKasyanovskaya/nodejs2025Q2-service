# Home Library Service

## 📚 Documentation

For detailed verification instructions for all requirements (Logging & Error Handling, Authentication & Authorization), see [VERIFICATION_INSTRUCTIONS.md](./VERIFICATION_INSTRUCTIONS.md).

## Running the Application

### 1. Install Dependencies (if not already installed)

```bash
npm install
```

### 2. Environment Variables Setup

Create a `.env` file in the project root:

```bash
PORT=4000

# JWT Configuration
JWT_SECRET=your-secret-key-here              # Secret key for JWT access token signing (required for authentication)
JWT_SECRET_REFRESH_KEY=your-refresh-key-here # Secret key for JWT refresh token signing (optional, falls back to JWT_SECRET if not set)

# Logging Configuration
LOG_LEVEL=log                     # Logging level: numeric (0-4) or string (error, warn, log, debug, verbose)
                                  # 0=error, 1=warn, 2=log, 3=debug, 4=verbose (default: log)
                                  # When set to level N, logs all levels 0 to N (inclusive)
LOG_FILE=app.log                  # Main log file name (default: app.log)
ERROR_LOG_FILE=error.log          # Error log file name (default: error.log)
LOG_DIR=logs                      # Log directory (default: logs)
LOG_MAX_FILE_SIZE_KB=100          # Maximum log file size in KB before rotation (default: 100)
```

### 3. Start the Application

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

**Auth tests:**

```bash
npm run test:auth
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

- **In-memory data storage**: Currently uses in-memory arrays for data persistence
- **Modular architecture**: Organized into domain-specific modules (User, Track, Artist, Album, Favorites)
- **Request validation**: Automatic validation of request bodies using class-validator
- **Cascading deletion**: When an Artist, Album, or Track is deleted, its ID is removed from favorites and references in other entities are set to null
- **Password exclusion**: User passwords are never returned in API responses
- **UUID validation**: All ID parameters are validated as UUID v4
