import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AlbumEntity } from './album.entity';

@Entity('favorite_albums')
export class FavoriteAlbumEntity {
  @PrimaryColumn('uuid')
  albumId: string;

  @ManyToOne(() => AlbumEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'albumId' })
  album: AlbumEntity;
}

