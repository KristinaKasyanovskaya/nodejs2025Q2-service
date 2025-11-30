import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Artist } from '../interfaces';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { AlbumService } from '../album/album.service';
import { TrackService } from '../track/track.service';
import { FavoritesService } from '../favorites/favorites.service';

@Injectable()
export class ArtistService {
  private artists: Artist[] = [];

  constructor(
    @Inject(forwardRef(() => AlbumService))
    private readonly albumService: AlbumService,
    @Inject(forwardRef(() => TrackService))
    private readonly trackService: TrackService,
    @Inject(forwardRef(() => FavoritesService))
    private readonly favoritesService: FavoritesService,
  ) {}

  findAll(): Artist[] {
    return this.artists;
  }

  findOne(id: string): Artist {
    const artist = this.artists.find((artist) => artist.id === id);
    if (!artist) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }
    return artist;
  }

  create(createArtistDto: CreateArtistDto): Artist {
    const newArtist: Artist = {
      id: randomUUID(),
      name: createArtistDto.name,
      grammy: createArtistDto.grammy,
    };
    this.artists.push(newArtist);
    return newArtist;
  }

  update(id: string, updateArtistDto: UpdateArtistDto): Artist {
    const artist = this.findOne(id);

    artist.name = updateArtistDto.name;
    artist.grammy = updateArtistDto.grammy;

    return artist;
  }

  remove(id: string): void {
    const artistIndex = this.artists.findIndex((artist) => artist.id === id);
    if (artistIndex === -1) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }

    this.favoritesService.removeArtistFromFavorites(id);

    this.albumService.removeArtistReference(id);

    this.trackService.removeArtistReference(id);

    this.artists.splice(artistIndex, 1);
  }
}
