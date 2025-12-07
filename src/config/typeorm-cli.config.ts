import { DataSource } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { ArtistEntity } from '../entities/artist.entity';
import { AlbumEntity } from '../entities/album.entity';
import { TrackEntity } from '../entities/track.entity';
import { FavoriteArtistEntity } from '../entities/favorite-artist.entity';
import { FavoriteAlbumEntity } from '../entities/favorite-album.entity';
import { FavoriteTrackEntity } from '../entities/favorite-track.entity';

export default new DataSource({
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
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});

