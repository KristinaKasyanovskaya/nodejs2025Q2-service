import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'uuid';
import { FavoritesResponse, FavoritesService } from './favorites.service';

@Controller('favs')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllFavorites(): Promise<FavoritesResponse> {
    return await this.favoritesService.findAll();
  }

  @Post('track/:id')
  @HttpCode(HttpStatus.CREATED)
  async addTrackToFavorites(@Param('id') id: string): Promise<void> {
    if (!validate(id)) {
      throw new BadRequestException('trackId is invalid (not uuid)');
    }
    await this.favoritesService.addTrack(id);
  }

  @Delete('track/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTrackFromFavorites(@Param('id') id: string): Promise<void> {
    if (!validate(id)) {
      throw new BadRequestException('trackId is invalid (not uuid)');
    }
    await this.favoritesService.removeTrack(id);
  }

  @Post('album/:id')
  @HttpCode(HttpStatus.CREATED)
  async addAlbumToFavorites(@Param('id') id: string): Promise<void> {
    if (!validate(id)) {
      throw new BadRequestException('albumId is invalid (not uuid)');
    }
    await this.favoritesService.addAlbum(id);
  }

  @Delete('album/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAlbumFromFavorites(@Param('id') id: string): Promise<void> {
    if (!validate(id)) {
      throw new BadRequestException('albumId is invalid (not uuid)');
    }
    await this.favoritesService.removeAlbum(id);
  }

  @Post('artist/:id')
  @HttpCode(HttpStatus.CREATED)
  async addArtistToFavorites(@Param('id') id: string): Promise<void> {
    if (!validate(id)) {
      throw new BadRequestException('artistId is invalid (not uuid)');
    }
    await this.favoritesService.addArtist(id);
  }

  @Delete('artist/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteArtistFromFavorites(@Param('id') id: string): Promise<void> {
    if (!validate(id)) {
      throw new BadRequestException('artistId is invalid (not uuid)');
    }
    await this.favoritesService.removeArtist(id);
  }
}
