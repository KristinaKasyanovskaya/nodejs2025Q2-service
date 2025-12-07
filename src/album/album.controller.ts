import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'uuid';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { Album } from 'src/interfaces';
import { AlbumService } from './album.service';

@Controller('album')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllAlbums(): Promise<Album[]> {
    return await this.albumService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getAlbumById(@Param('id') id: string): Promise<Album> {
    if (!validate(id)) {
      throw new BadRequestException('albumId is invalid (not uuid)');
    }
    return await this.albumService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAlbum(@Body() createAlbumDto: CreateAlbumDto): Promise<Album> {
    return await this.albumService.create(createAlbumDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateAlbum(
    @Param('id') id: string,
    @Body() updateAlbumDto: UpdateAlbumDto,
  ): Promise<Album> {
    if (!validate(id)) {
      throw new BadRequestException('albumId is invalid (not uuid)');
    }
    return await this.albumService.update(id, updateAlbumDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAlbum(@Param('id') id: string): Promise<void> {
    if (!validate(id)) {
      throw new BadRequestException('albumId is invalid (not uuid)');
    }
    await this.albumService.remove(id);
  }
}
