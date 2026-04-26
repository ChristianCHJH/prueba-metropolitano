import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CompletarReporteDto {
  @ApiProperty({
    description: 'Latitud del punto de fin del viaje',
    example: -12.1464,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  latitudFin: number;

  @ApiProperty({
    description: 'Longitud del punto de fin del viaje',
    example: -77.0228,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  longitudFin: number;
}
