import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ArtistEntity } from './artist.entity';

@Entity('favorite_artists')
export class FavoriteArtistEntity {
  @PrimaryColumn('uuid')
  artistId: string;

  @ManyToOne(() => ArtistEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artistId' })
  artist: ArtistEntity;
}

