import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TrackEntity } from './track.entity';

@Entity('favorite_tracks')
export class FavoriteTrackEntity {
  @PrimaryColumn('uuid')
  trackId: string;

  @ManyToOne(() => TrackEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trackId' })
  track: TrackEntity;
}

