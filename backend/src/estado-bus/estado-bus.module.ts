import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoBus } from './estado-bus.entity';
import { EstadoBusService } from './estado-bus.service';

@Module({
  imports: [TypeOrmModule.forFeature([EstadoBus])],
  providers: [EstadoBusService],
  exports: [EstadoBusService, TypeOrmModule],
})
export class EstadoBusModule {}
