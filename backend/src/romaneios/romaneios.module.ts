import { Module } from '@nestjs/common';
import { RomaneiosController } from './romaneios.controller';
import { RomaneiosService } from './romaneios.service';

@Module({
  controllers: [RomaneiosController],
  providers: [RomaneiosService],
  exports: [RomaneiosService],
})
export class RomaneiosModule {}
