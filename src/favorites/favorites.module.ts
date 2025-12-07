import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritesController } from './favorites.controller';
import { AlbumModule } from '../album/album.module';
import { TrackModule } from '../track/track.module';
import { FavoritesService } from './favorites.service';
import { ArtistModule } from 'src/artist/artist.module';
import { FavoriteArtistEntity } from '../entities/favorite-artist.entity';
import { FavoriteAlbumEntity } from '../entities/favorite-album.entity';
import { FavoriteTrackEntity } from '../entities/favorite-track.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FavoriteArtistEntity,
      FavoriteAlbumEntity,
      FavoriteTrackEntity,
    ]),
    forwardRef(() => ArtistModule),
    forwardRef(() => AlbumModule),
    forwardRef(() => TrackModule),
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
