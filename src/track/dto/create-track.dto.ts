import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class CreateTrackDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  duration: number;

  @IsOptional()
  @ValidateIf((o) => o.artistId !== null && o.artistId !== undefined)
  @IsUUID()
  artistId: string | null;

  @IsOptional()
  @ValidateIf((o) => o.albumId !== null && o.albumId !== undefined)
  @IsUUID()
  albumId: string | null;
}
