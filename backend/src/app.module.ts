import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusesModule } from './buses/buses.module';
import { ReportesModule } from './reportes/reportes.module';
import { SeguimientosModule } from './seguimientos/seguimientos.module';
import { EstadoBusModule } from './estado-bus/estado-bus.module';
import { Bus } from './buses/buses.entity';
import { Reporte } from './reportes/reportes.entity';
import { Seguimiento } from './seguimientos/seguimientos.entity';
import { EstadoBus } from './estado-bus/estado-bus.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE', 'metropolitano_db'),
        entities: [Bus, Reporte, Seguimiento, EstadoBus],
        synchronize: true,
        logging: false,
      }),
    }),
    BusesModule,
    ReportesModule,
    SeguimientosModule,
    EstadoBusModule,
  ],
})
export class AppModule {}
