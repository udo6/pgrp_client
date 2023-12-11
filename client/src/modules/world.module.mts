import alt from 'alt-client';
import game from 'natives';

import { ModuleBase } from "../utils/models/baseModels/module.base.mjs";

export default new class WorldModule extends ModuleBase {
  constructor() {
    super('WorldModule');

    // game.setWeatherTypeNowPersist('XMAS');
  }
}