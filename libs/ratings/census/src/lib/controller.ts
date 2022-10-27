import { createServiceLogger } from '@ps2gg/common/logging'
import { Controller } from '@ps2gg/census/api'

const logger = createServiceLogger('Ratings')

export class RatingsController extends Controller {
  public onGainExperience(timestamp: Date, character_id: string, other_id: string): void {
    // console.log(timestamp, character_id, other_id)
  }
}
