# TypeORM Migrations Guide

## ✅ Requirements Status

### 1. ✅ Migrations are used to create database entities (+30)
**Status:** ✅ **COMPLETED**

- Initial migration created: `src/migrations/1700000000000-InitialMigration.ts`
- Creates all database tables: users, artists, albums, tracks, favorite_artists, favorite_albums, favorite_tracks
- Includes foreign key relationships
- `synchronize: false` - migrations are used instead of auto-sync

### 2. ✅ Database connection variables in .env (+10)
**Status:** ✅ **COMPLETED**

**Variables stored in .env:**
- `POSTGRES_HOST` - Database host (postgres for Docker, localhost for local)
- `POSTGRES_PORT` - Database port (5432)
- `POSTGRES_USER` - Database user (postgres)
- `POSTGRES_PASSWORD` - Database password (postgres)
- `POSTGRES_DB` - Database name (home_library)
- `DATABASE_URL` - Full connection string

**Configuration files:**
- `.env.example` - Template with all required variables
- `src/config/typeorm.config.ts` - Uses environment variables

### 3. ✅ TypeORM decorators create relations (+10)
**Status:** ✅ **COMPLETED**

**Relations implemented:**
- `@ManyToOne` - Album → Artist, Track → Artist, Track → Album
- `@OneToMany` - Artist → Albums, Artist → Tracks, Album → Tracks
- `@JoinColumn` - Specifies foreign key columns
- `onDelete: 'SET NULL'` - For optional relationships
- `onDelete: 'CASCADE'` - For favorites relationships

**Example:**
```typescript
@ManyToOne(() => ArtistEntity, (artist) => artist.albums, {
  onDelete: 'SET NULL',
})
@JoinColumn({ name: 'artistId' })
artist: ArtistEntity | null;
```

### 4. ✅ Connection to PostgreSQL in Docker container (+30)
**Status:** ✅ **COMPLETED**

**Docker Compose Configuration:**
- PostgreSQL runs in Docker container
- Application connects to `postgres` hostname (Docker service name)
- No local PostgreSQL installation required
- Health checks ensure database is ready before app starts

**docker-compose.yml:**
```yaml
services:
  postgres:
    # PostgreSQL container
  app:
    environment:
      POSTGRES_HOST: postgres  # Docker service name
      POSTGRES_PORT: 5432
```

## Migration Commands

### Generate Migration
```bash
npm run migration:generate -- src/migrations/MigrationName
```

### Create Empty Migration
```bash
npm run migration:create -- src/migrations/MigrationName
```

### Run Migrations
```bash
npm run migration:run
```

### Revert Last Migration
```bash
npm run migration:revert
```

### Show Migration Status
```bash
npm run migration:show
```

## Running Migrations in Docker

### Option 1: Run migrations manually
```bash
# Start containers
docker-compose up -d postgres

# Run migrations from host
npm run migration:run

# Or run inside container
docker-compose exec app npm run migration:run
```

### Option 2: Auto-run migrations on startup
Migrations can be configured to run automatically when the app starts by setting:
```typescript
migrationsRun: true
```

## Environment Variables

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

**For Docker:**
```env
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=home_library
```

**For Local Development:**
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=home_library
```

## Migration Files Structure

```
src/
  migrations/
    1700000000000-InitialMigration.ts  # Initial migration
```

Migration naming: `{timestamp}-{MigrationName}.ts`

## Database Schema

The initial migration creates:
- `users` - User accounts
- `artists` - Music artists
- `albums` - Music albums (with artistId FK)
- `tracks` - Music tracks (with artistId and albumId FKs)
- `favorite_artists` - Favorite artists (with artistId FK)
- `favorite_albums` - Favorite albums (with albumId FK)
- `favorite_tracks` - Favorite tracks (with trackId FK)

All foreign keys are properly configured with appropriate `onDelete` actions.

