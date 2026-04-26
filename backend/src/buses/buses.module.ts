import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bus } from './buses.entity';
import { BusesController } from './buses.controller';
import { BusesService } from './buses.service';
import { EstadoBusModule } from '../estado-bus/estado-bus.module';
import { Reporte } from '../reportes/reportes.entity';
import { Seguimiento } from '../seguimientos/seguimientos.entity';
import { EstadoBus } from '../estado-bus/estado-bus.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bus, Reporte, Seguimiento, EstadoBus]),
    EstadoBusModule,
  ],
  controllers: [BusesController],
  providers: [BusesService],
  exports: [BusesService, TypeOrmModule],
})
export class BusesModule {}
