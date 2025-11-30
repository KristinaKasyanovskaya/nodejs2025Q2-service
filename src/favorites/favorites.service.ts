import {
  Injectable,
  UnprocessableEntityException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Favorites, Artist, Album, Track } from '../interfaces';
import { AlbumService } from '../album/album.service';
import { TrackService } from '../track/track.service';
import { ArtistService } from 'src/artist/artist.service';

export interface FavoritesResponse {
  artists: Artist[];
  albums: Album[];
  tracks: Track[];
}

@Injectable()
export class FavoritesService {
  private favorites: Favorites = {
    artists: [],
    albums: [],
    tracks: [],
  };

  constructor(
    @Inject(forwardRef(() => ArtistService))
    private readonly artistService: ArtistService,
    @Inject(forwardRef(() => AlbumService))
    private readonly albumService: AlbumService,
    @Inject(forwardRef(() => TrackService))
    private readonly trackService: TrackService,
  ) {}

  findAll(): FavoritesResponse {
    const artists = this.favorites.artists
      .map((id) => {
        try {
          return this.artistService.findOne(id);
        } catch {
          return null;
        }
      })
      .filter((artist): artist is Artist => artist !== null);

    const albums = this.favorites.albums
      .map((id) => {
        try {
          return this.albumService.findOne(id);
        } catch {
          return null;
        }
      })
      .filter((album): album is Album => album !== null);

    const tracks = this.favorites.tracks
      .map((id) => {
        try {
          return this.trackService.findOne(id);
        } catch {
          return null;
        }
      })
      .filter((track): track is Track => track !== null);

    return {
      artists,
      albums,
      tracks,
    };
  }

  addTrack(id: string): void {
    try {
      this.trackService.findOne(id);
    } catch {
      throw new UnprocessableEntityException(
        `Track with id ${id} doesn't exist`,
      );
    }

    if (!this.favorites.tracks.includes(id)) {
      this.favorites.tracks.push(id);
    }
  }

  removeTrack(id: string): void {
    const trackIndex = this.favorites.tracks.indexOf(id);
    if (trackIndex === -1) {
      throw new NotFoundException(`Track with id ${id} is not favorite`);
    }
    this.favorites.tracks.splice(trackIndex, 1);
  }

  addAlbum(id: string): void {
    try {
      this.albumService.findOne(id);
    } catch {
      throw new UnprocessableEntityException(
        `Album with id ${id} doesn't exist`,
      );
    }

    if (!this.favorites.albums.includes(id)) {
      this.favorites.albums.push(id);
    }
  }

  removeAlbum(id: string): void {
    const albumIndex = this.favorites.albums.indexOf(id);
    if (albumIndex === -1) {
      throw new NotFoundException(`Album with id ${id} is not favorite`);
    }
    this.favorites.albums.splice(albumIndex, 1);
  }

  addArtist(id: string): void {
    try {
      this.artistService.findOne(id);
    } catch {
      throw new UnprocessableEntityException(
        `Artist with id ${id} doesn't exist`,
      );
    }

    if (!this.favorites.artists.includes(id)) {
      this.favorites.artists.push(id);
    }
  }

  removeArtist(id: string): void {
    const artistIndex = this.favorites.artists.indexOf(id);
    if (artistIndex === -1) {
      throw new NotFoundException(`Artist with id ${id} is not favorite`);
    }
    this.favorites.artists.splice(artistIndex, 1);
  }

  removeArtistFromFavorites(id: string): void {
    const artistIndex = this.favorites.artists.indexOf(id);
    if (artistIndex !== -1) {
      this.favorites.artists.splice(artistIndex, 1);
    }
  }

  removeAlbumFromFavorites(id: string): void {
    const albumIndex = this.favorites.albums.indexOf(id);
    if (albumIndex !== -1) {
      this.favorites.albums.splice(albumIndex, 1);
    }
  }

  removeTrackFromFavorites(id: string): void {
    const trackIndex = this.favorites.tracks.indexOf(id);
    if (trackIndex !== -1) {
      this.favorites.tracks.splice(trackIndex, 1);
    }
  }
}
