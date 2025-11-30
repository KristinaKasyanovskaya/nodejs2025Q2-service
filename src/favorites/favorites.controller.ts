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
  getAllFavorites(): FavoritesResponse {
    return this.favoritesService.findAll();
  }

  @Post('track/:id')
  @HttpCode(HttpStatus.CREATED)
  addTrackToFavorites(@Param('id') id: string): void {
    if (!validate(id)) {
      throw new BadRequestException('trackId is invalid (not uuid)');
    }
    this.favoritesService.addTrack(id);
  }

  @Delete('track/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTrackFromFavorites(@Param('id') id: string): void {
    if (!validate(id)) {
      throw new BadRequestException('trackId is invalid (not uuid)');
    }
    this.favoritesService.removeTrack(id);
  }

  @Post('album/:id')
  @HttpCode(HttpStatus.CREATED)
  addAlbumToFavorites(@Param('id') id: string): void {
    if (!validate(id)) {
      throw new BadRequestException('albumId is invalid (not uuid)');
    }
    this.favoritesService.addAlbum(id);
  }

  @Delete('album/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAlbumFromFavorites(@Param('id') id: string): void {
    if (!validate(id)) {
      throw new BadRequestException('albumId is invalid (not uuid)');
    }
    this.favoritesService.removeAlbum(id);
  }

  @Post('artist/:id')
  @HttpCode(HttpStatus.CREATED)
  addArtistToFavorites(@Param('id') id: string): void {
    if (!validate(id)) {
      throw new BadRequestException('artistId is invalid (not uuid)');
    }
    this.favoritesService.addArtist(id);
  }

  @Delete('artist/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteArtistFromFavorites(@Param('id') id: string): void {
    if (!validate(id)) {
      throw new BadRequestException('artistId is invalid (not uuid)');
    }
    this.favoritesService.removeArtist(id);
  }
}
