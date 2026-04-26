import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ActualizarBusDto {
  @ApiPropertyOptional({
    description: 'Código único del bus',
    example: 'BUS-001',
  })
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiPropertyOptional({
    description: 'Capacidad máxima de pasajeros del bus',
    example: 80,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacidad?: number;
}
