import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'login',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'version',
            type: 'int',
            default: 1,
          },
          {
            name: 'createdAt',
            type: 'bigint',
          },
          {
            name: 'updatedAt',
            type: 'bigint',
          },
        ],
      }),
      true,
    );

    // Create artists table
    await queryRunner.createTable(
      new Table({
        name: 'artists',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'grammy',
            type: 'boolean',
            default: false,
          },
        ],
      }),
      true,
    );

    // Create albums table
    await queryRunner.createTable(
      new Table({
        name: 'albums',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'year',
            type: 'int',
          },
          {
            name: 'artistId',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create tracks table
    await queryRunner.createTable(
      new Table({
        name: 'tracks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'duration',
            type: 'int',
          },
          {
            name: 'artistId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'albumId',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create favorite_artists table
    await queryRunner.createTable(
      new Table({
        name: 'favorite_artists',
        columns: [
          {
            name: 'artistId',
            type: 'uuid',
            isPrimary: true,
          },
        ],
      }),
      true,
    );

    // Create favorite_albums table
    await queryRunner.createTable(
      new Table({
        name: 'favorite_albums',
        columns: [
          {
            name: 'albumId',
            type: 'uuid',
            isPrimary: true,
          },
        ],
      }),
      true,
    );

    // Create favorite_tracks table
    await queryRunner.createTable(
      new Table({
        name: 'favorite_tracks',
        columns: [
          {
            name: 'trackId',
            type: 'uuid',
            isPrimary: true,
          },
        ],
      }),
      true,
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'albums',
      new TableForeignKey({
        columnNames: ['artistId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'artists',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'tracks',
      new TableForeignKey({
        columnNames: ['artistId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'artists',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'tracks',
      new TableForeignKey({
        columnNames: ['albumId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'albums',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'favorite_artists',
      new TableForeignKey({
        columnNames: ['artistId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'artists',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'favorite_albums',
      new TableForeignKey({
        columnNames: ['albumId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'albums',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'favorite_tracks',
      new TableForeignKey({
        columnNames: ['trackId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tracks',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    const albumsTable = await queryRunner.getTable('albums');
    const tracksTable = await queryRunner.getTable('tracks');
    const favoriteArtistsTable = await queryRunner.getTable('favorite_artists');
    const favoriteAlbumsTable = await queryRunner.getTable('favorite_albums');
    const favoriteTracksTable = await queryRunner.getTable('favorite_tracks');

    if (albumsTable) {
      const foreignKey = albumsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('artistId') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('albums', foreignKey);
      }
    }

    if (tracksTable) {
      const artistForeignKey = tracksTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('artistId') !== -1,
      );
      if (artistForeignKey) {
        await queryRunner.dropForeignKey('tracks', artistForeignKey);
      }
      const albumForeignKey = tracksTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('albumId') !== -1,
      );
      if (albumForeignKey) {
        await queryRunner.dropForeignKey('tracks', albumForeignKey);
      }
    }

    if (favoriteArtistsTable) {
      const foreignKey = favoriteArtistsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('artistId') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('favorite_artists', foreignKey);
      }
    }

    if (favoriteAlbumsTable) {
      const foreignKey = favoriteAlbumsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('albumId') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('favorite_albums', foreignKey);
      }
    }

    if (favoriteTracksTable) {
      const foreignKey = favoriteTracksTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('trackId') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('favorite_tracks', foreignKey);
      }
    }

    // Drop tables
    await queryRunner.dropTable('favorite_tracks');
    await queryRunner.dropTable('favorite_albums');
    await queryRunner.dropTable('favorite_artists');
    await queryRunner.dropTable('tracks');
    await queryRunner.dropTable('albums');
    await queryRunner.dropTable('artists');
    await queryRunner.dropTable('users');
  }
}

