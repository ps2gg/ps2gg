import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  public constructor(private readonly _appService: AppService) {}

  @Get()
  private _getData() {
    return this._appService.getData()
  }
}
