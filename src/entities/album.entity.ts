import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ArtistEntity } from './artist.entity';
import { TrackEntity } from './track.entity';

@Entity('albums')
export class AlbumEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'uuid', nullable: true })
  artistId: string | null;

  @ManyToOne(() => ArtistEntity, (artist) => artist.albums, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'artistId' })
  artist: ArtistEntity | null;

  @OneToMany(() => TrackEntity, (track) => track.album, { cascade: true })
  tracks: TrackEntity[];
}

