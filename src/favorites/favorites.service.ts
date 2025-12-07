import {
  Injectable,
  UnprocessableEntityException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorites, Artist, Album, Track } from '../interfaces';
import { AlbumService } from '../album/album.service';
import { TrackService } from '../track/track.service';
import { ArtistService } from 'src/artist/artist.service';
import { FavoriteArtistEntity } from '../entities/favorite-artist.entity';
import { FavoriteAlbumEntity } from '../entities/favorite-album.entity';
import { FavoriteTrackEntity } from '../entities/favorite-track.entity';

export interface FavoritesResponse {
  artists: Artist[];
  albums: Album[];
  tracks: Track[];
}

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoriteArtistEntity)
    private readonly favoriteArtistRepository: Repository<FavoriteArtistEntity>,
    @InjectRepository(FavoriteAlbumEntity)
    private readonly favoriteAlbumRepository: Repository<FavoriteAlbumEntity>,
    @InjectRepository(FavoriteTrackEntity)
    private readonly favoriteTrackRepository: Repository<FavoriteTrackEntity>,
    @Inject(forwardRef(() => ArtistService))
    private readonly artistService: ArtistService,
    @Inject(forwardRef(() => AlbumService))
    private readonly albumService: AlbumService,
    @Inject(forwardRef(() => TrackService))
    private readonly trackService: TrackService,
  ) {}

  async findAll(): Promise<FavoritesResponse> {
    const favoriteArtists = await this.favoriteArtistRepository.find();
    const favoriteAlbums = await this.favoriteAlbumRepository.find();
    const favoriteTracks = await this.favoriteTrackRepository.find();

    const artistIds = favoriteArtists.map((fav) => fav.artistId);
    const albumIds = favoriteAlbums.map((fav) => fav.albumId);
    const trackIds = favoriteTracks.map((fav) => fav.trackId);

    const artists: Artist[] = [];
    for (const id of artistIds) {
      try {
        const artist = await this.artistService.findOne(id);
        artists.push(artist);
      } catch {
        // Artist was deleted, skip it
      }
    }

    const albums: Album[] = [];
    for (const id of albumIds) {
      try {
        const album = await this.albumService.findOne(id);
        albums.push(album);
      } catch {
        // Album was deleted, skip it
      }
    }

    const tracks: Track[] = [];
    for (const id of trackIds) {
      try {
        const track = await this.trackService.findOne(id);
        tracks.push(track);
      } catch {
        // Track was deleted, skip it
      }
    }

    return {
      artists,
      albums,
      tracks,
    };
  }

  async addTrack(id: string): Promise<void> {
    try {
      await this.trackService.findOne(id);
    } catch {
      throw new UnprocessableEntityException(
        `Track with id ${id} doesn't exist`,
      );
    }

    const existing = await this.favoriteTrackRepository.findOne({
      where: { trackId: id },
    });
    if (!existing) {
      const favoriteTrack = this.favoriteTrackRepository.create({ trackId: id });
      await this.favoriteTrackRepository.save(favoriteTrack);
    }
  }

  async removeTrack(id: string): Promise<void> {
    const result = await this.favoriteTrackRepository.delete({ trackId: id });
    if (result.affected === 0) {
      throw new NotFoundException(`Track with id ${id} is not favorite`);
    }
  }

  async addAlbum(id: string): Promise<void> {
    try {
      await this.albumService.findOne(id);
    } catch {
      throw new UnprocessableEntityException(
        `Album with id ${id} doesn't exist`,
      );
    }

    const existing = await this.favoriteAlbumRepository.findOne({
      where: { albumId: id },
    });
    if (!existing) {
      const favoriteAlbum = this.favoriteAlbumRepository.create({ albumId: id });
      await this.favoriteAlbumRepository.save(favoriteAlbum);
    }
  }

  async removeAlbum(id: string): Promise<void> {
    const result = await this.favoriteAlbumRepository.delete({ albumId: id });
    if (result.affected === 0) {
      throw new NotFoundException(`Album with id ${id} is not favorite`);
    }
  }

  async addArtist(id: string): Promise<void> {
    try {
      await this.artistService.findOne(id);
    } catch {
      throw new UnprocessableEntityException(
        `Artist with id ${id} doesn't exist`,
      );
    }

    const existing = await this.favoriteArtistRepository.findOne({
      where: { artistId: id },
    });
    if (!existing) {
      const favoriteArtist = this.favoriteArtistRepository.create({
        artistId: id,
      });
      await this.favoriteArtistRepository.save(favoriteArtist);
    }
  }

  async removeArtist(id: string): Promise<void> {
    const result = await this.favoriteArtistRepository.delete({ artistId: id });
    if (result.affected === 0) {
      throw new NotFoundException(`Artist with id ${id} is not favorite`);
    }
  }

  async removeArtistFromFavorites(id: string): Promise<void> {
    await this.favoriteArtistRepository.delete({ artistId: id });
  }

  async removeAlbumFromFavorites(id: string): Promise<void> {
    await this.favoriteAlbumRepository.delete({ albumId: id });
  }

  async removeTrackFromFavorites(id: string): Promise<void> {
    await this.favoriteTrackRepository.delete({ trackId: id });
  }
}
