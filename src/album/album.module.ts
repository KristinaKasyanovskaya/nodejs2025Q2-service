import { Module, forwardRef } from '@nestjs/common';
import { AlbumController } from './album.controller';
import { FavoritesModule } from '../favorites/favorites.module';
import { AlbumService } from './album.service';
import { TrackModule } from 'src/track/track.module';

@Module({
  imports: [forwardRef(() => TrackModule), forwardRef(() => FavoritesModule)],
  controllers: [AlbumController],
  providers: [AlbumService],
  exports: [AlbumService],
})
export class AlbumModule {}
