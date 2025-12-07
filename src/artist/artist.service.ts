import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Artist } from '../interfaces';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { AlbumService } from '../album/album.service';
import { TrackService } from '../track/track.service';
import { FavoritesService } from '../favorites/favorites.service';
import { ArtistEntity } from '../entities/artist.entity';

@Injectable()
export class ArtistService {
  constructor(
    @InjectRepository(ArtistEntity)
    private readonly artistRepository: Repository<ArtistEntity>,
    @Inject(forwardRef(() => AlbumService))
    private readonly albumService: AlbumService,
    @Inject(forwardRef(() => TrackService))
    private readonly trackService: TrackService,
    @Inject(forwardRef(() => FavoritesService))
    private readonly favoritesService: FavoritesService,
  ) {}

  async findAll(): Promise<Artist[]> {
    const artists = await this.artistRepository.find();
    return artists.map(this.toArtist);
  }

  async findOne(id: string): Promise<Artist> {
    const artist = await this.artistRepository.findOne({ where: { id } });
    if (!artist) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }
    return this.toArtist(artist);
  }

  async create(createArtistDto: CreateArtistDto): Promise<Artist> {
    const newArtist = this.artistRepository.create({
      id: randomUUID(),
      name: createArtistDto.name,
      grammy: createArtistDto.grammy,
    });
    const savedArtist = await this.artistRepository.save(newArtist);
    return this.toArtist(savedArtist);
  }

  async update(id: string, updateArtistDto: UpdateArtistDto): Promise<Artist> {
    const artist = await this.artistRepository.findOne({ where: { id } });
    if (!artist) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }

    artist.name = updateArtistDto.name;
    artist.grammy = updateArtistDto.grammy;

    const updatedArtist = await this.artistRepository.save(artist);
    return this.toArtist(updatedArtist);
  }

  async remove(id: string): Promise<void> {
    const artist = await this.artistRepository.findOne({ where: { id } });
    if (!artist) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }

    await this.favoritesService.removeArtistFromFavorites(id);
    await this.albumService.removeArtistReference(id);
    await this.trackService.removeArtistReference(id);

    await this.artistRepository.remove(artist);
  }

  private toArtist(entity: ArtistEntity): Artist {
    return {
      id: entity.id,
      name: entity.name,
      grammy: entity.grammy,
    };
  }
}
