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
  getAllAlbums(): Album[] {
    return this.albumService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getAlbumById(@Param('id') id: string): Album {
    if (!validate(id)) {
      throw new BadRequestException('albumId is invalid (not uuid)');
    }
    return this.albumService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createAlbum(@Body() createAlbumDto: CreateAlbumDto): Album {
    return this.albumService.create(createAlbumDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  updateAlbum(
    @Param('id') id: string,
    @Body() updateAlbumDto: UpdateAlbumDto,
  ): Album {
    if (!validate(id)) {
      throw new BadRequestException('albumId is invalid (not uuid)');
    }
    return this.albumService.update(id, updateAlbumDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAlbum(@Param('id') id: string): void {
    if (!validate(id)) {
      throw new BadRequestException('albumId is invalid (not uuid)');
    }
    this.albumService.remove(id);
  }
}
