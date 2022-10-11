import { WinstonLoggerService } from '@ps2gg/common/logging'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'

async function bootstrap() {
  const logger = new WinstonLoggerService('Players')
  const app = await NestFactory.create(AppModule, { logger })
  const port = process.env.PORT || 3333

  await app.listen(port)
  logger.log(`🚀 Application is running on: http://localhost:${port}`)
}

bootstrap()
