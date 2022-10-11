import { Module } from '@nestjs/common'
import { getLoggerOptions } from '@ps2gg/common/logging'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
