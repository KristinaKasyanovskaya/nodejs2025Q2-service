import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { ArtistEntity } from '../entities/artist.entity';
import { AlbumEntity } from '../entities/album.entity';
import { TrackEntity } from '../entities/track.entity';
import { FavoriteArtistEntity } from '../entities/favorite-artist.entity';
import { FavoriteAlbumEntity } from '../entities/favorite-album.entity';
import { FavoriteTrackEntity } from '../entities/favorite-track.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'home_library',
  entities: [
    UserEntity,
    ArtistEntity,
    AlbumEntity,
    TrackEntity,
    FavoriteArtistEntity,
    FavoriteAlbumEntity,
    FavoriteTrackEntity,
  ],
  migrations: ['dist/migrations/*.js'],
  migrationsRun: process.env.RUN_MIGRATIONS === 'true', // Set RUN_MIGRATIONS=true to auto-run migrations
  synchronize: false, // Use migrations instead of synchronize
  logging: process.env.NODE_ENV === 'development',
};

