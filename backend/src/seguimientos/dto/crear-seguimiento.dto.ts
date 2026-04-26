import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class CrearSeguimientoDto {
  @ApiProperty({
    description: 'ID del reporte al que pertenece este punto GPS',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  reporteId: number;

  @ApiProperty({
    description: 'Latitud del punto GPS registrado',
    example: -12.0864,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  latitud: number;

  @ApiProperty({
    description: 'Longitud del punto GPS registrado',
    example: -77.0328,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  longitud: number;
}
