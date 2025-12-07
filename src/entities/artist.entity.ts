import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { AlbumEntity } from './album.entity';
import { TrackEntity } from './track.entity';

@Entity('artists')
export class ArtistEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'boolean', default: false })
  grammy: boolean;

  @OneToMany(() => AlbumEntity, (album) => album.artist, { cascade: true })
  albums: AlbumEntity[];

  @OneToMany(() => TrackEntity, (track) => track.artist, { cascade: true })
  tracks: TrackEntity[];
}

