import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CrearReporteDto {
  @ApiProperty({
    description: 'ID del bus al que pertenece el reporte',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  busId: number;

  @ApiProperty({
    description: 'Cantidad de pasajeros en el momento de inicio del viaje',
    example: 45,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  cantidadPasajeros: number;

  @ApiProperty({
    description: 'Latitud del punto de inicio del viaje',
    example: -12.0464,
  })
  @IsNumber()
  @Type(() => Number)
  latitudInicio: number;

  @ApiProperty({
    description: 'Longitud del punto de inicio del viaje',
    example: -77.0428,
  })
  @IsNumber()
  @Type(() => Number)
  longitudInicio: number;
}
