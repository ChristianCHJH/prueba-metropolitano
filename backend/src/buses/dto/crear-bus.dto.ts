import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CrearBusDto {
  @ApiProperty({
    description: 'Código único del bus',
    example: 'BUS-001',
  })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({
    description: 'Capacidad máxima de pasajeros del bus',
    example: 80,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  capacidad: number;
}
