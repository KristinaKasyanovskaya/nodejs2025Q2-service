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
import { Track } from '../interfaces';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { TrackService } from './track.service';

@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllTracks(): Promise<Track[]> {
    return await this.trackService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getTrackById(@Param('id') id: string): Promise<Track> {
    if (!validate(id)) {
      throw new BadRequestException('trackId is invalid (not uuid)');
    }
    return await this.trackService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTrack(@Body() createTrackDto: CreateTrackDto): Promise<Track> {
    return await this.trackService.create(createTrackDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateTrack(
    @Param('id') id: string,
    @Body() updateTrackDto: UpdateTrackDto,
  ): Promise<Track> {
    if (!validate(id)) {
      throw new BadRequestException('trackId is invalid (not uuid)');
    }
    return await this.trackService.update(id, updateTrackDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTrack(@Param('id') id: string): Promise<void> {
    if (!validate(id)) {
      throw new BadRequestException('trackId is invalid (not uuid)');
    }
    await this.trackService.remove(id);
  }
}
