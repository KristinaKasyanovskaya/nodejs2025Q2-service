import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Track } from '../interfaces';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { FavoritesService } from 'src/favorites/favorites.service';
import { TrackEntity } from '../entities/track.entity';

@Injectable()
export class TrackService {
  constructor(
    @InjectRepository(TrackEntity)
    private readonly trackRepository: Repository<TrackEntity>,
    @Inject(forwardRef(() => FavoritesService))
    private readonly favoritesService: FavoritesService,
  ) {}

  async findAll(): Promise<Track[]> {
    const tracks = await this.trackRepository.find();
    return tracks.map(this.toTrack);
  }

  async findOne(id: string): Promise<Track> {
    const track = await this.trackRepository.findOne({ where: { id } });
    if (!track) {
      throw new NotFoundException(`Track with ID ${id} not found`);
    }
    return this.toTrack(track);
  }

  async create(createTrackDto: CreateTrackDto): Promise<Track> {
    const newTrack = this.trackRepository.create({
      id: randomUUID(),
      name: createTrackDto.name,
      duration: createTrackDto.duration,
      artistId: createTrackDto.artistId || null,
      albumId: createTrackDto.albumId || null,
    });
    const savedTrack = await this.trackRepository.save(newTrack);
    return this.toTrack(savedTrack);
  }

  async update(id: string, updateTrackDto: UpdateTrackDto): Promise<Track> {
    const track = await this.trackRepository.findOne({ where: { id } });
    if (!track) {
      throw new NotFoundException(`Track with ID ${id} not found`);
    }

    track.name = updateTrackDto.name;
    track.duration = updateTrackDto.duration;
    track.artistId = updateTrackDto.artistId || null;
    track.albumId = updateTrackDto.albumId || null;

    const updatedTrack = await this.trackRepository.save(track);
    return this.toTrack(updatedTrack);
  }

  async remove(id: string): Promise<void> {
    const track = await this.trackRepository.findOne({ where: { id } });
    if (!track) {
      throw new NotFoundException(`Track with ID ${id} not found`);
    }

    await this.favoritesService.removeTrackFromFavorites(id);
    await this.trackRepository.remove(track);
  }

  async removeArtistReference(artistId: string): Promise<void> {
    await this.trackRepository.update(
      { artistId },
      { artistId: null },
    );
  }

  async removeAlbumReference(albumId: string): Promise<void> {
    await this.trackRepository.update(
      { albumId },
      { albumId: null },
    );
  }

  private toTrack(entity: TrackEntity): Track {
    return {
      id: entity.id,
      name: entity.name,
      duration: entity.duration,
      artistId: entity.artistId,
      albumId: entity.albumId,
    };
  }
}
