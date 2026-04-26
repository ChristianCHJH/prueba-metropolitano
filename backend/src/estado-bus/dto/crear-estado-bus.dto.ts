import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstadoOperativo } from '../estado-bus.entity';

export class CrearEstadoBusDto {
  @ApiProperty({
    description: 'Estado operativo del bus',
    enum: EstadoOperativo,
    example: EstadoOperativo.DISPONIBLE,
  })
  @IsEnum(EstadoOperativo)
  @IsNotEmpty()
  estadoOperativo: EstadoOperativo;
}
