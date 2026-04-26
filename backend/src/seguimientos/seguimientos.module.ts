import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seguimiento } from './seguimientos.entity';
import { SeguimientosController } from './seguimientos.controller';
import { SeguimientosService } from './seguimientos.service';
import { Reporte } from '../reportes/reportes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Seguimiento, Reporte])],
  controllers: [SeguimientosController],
  providers: [SeguimientosService],
  exports: [SeguimientosService],
})
export class SeguimientosModule {}
