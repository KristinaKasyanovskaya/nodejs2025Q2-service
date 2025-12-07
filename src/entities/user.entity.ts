import {
  Entity,
  PrimaryColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  login: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'bigint' })
  createdAt: number;

  @Column({ type: 'bigint' })
  updatedAt: number;

  @BeforeInsert()
  setCreatedAt() {
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
  }

  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = Date.now();
  }
}
