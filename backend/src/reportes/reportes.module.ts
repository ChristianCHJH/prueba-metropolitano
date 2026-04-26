import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reporte } from './reportes.entity';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { EstadoBusModule } from '../estado-bus/estado-bus.module';
import { Bus } from '../buses/buses.entity';
import { Seguimiento } from '../seguimientos/seguimientos.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reporte, Bus, Seguimiento]),
    EstadoBusModule,
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService, TypeOrmModule],
})
export class ReportesModule {}
