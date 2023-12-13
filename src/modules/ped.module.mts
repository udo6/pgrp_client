import alt, { BaseObjectType } from 'alt-client';
import game from 'natives';

import { ModuleBase } from "../utils/models/baseModels/module.base.mjs";

export default new class PedModule extends ModuleBase {
  constructor() {
    super('PedModule');

    alt.on('spawned', this.freezePeds.bind(this));
    alt.setInterval(this.freezePeds.bind(this), 10000);
  }

  private freezePeds(): void {
    alt.Ped.all.forEach(entity => {
      if(entity.type != BaseObjectType.Ped) return;

      game.freezeEntityPosition(entity, true);
      game.setEntityInvincible(entity, true);
      game.setPedFleeAttributes(entity.scriptID, 0, false);
      game.setPedCombatAttributes(entity.scriptID, 58, true);
      game.setPedSeeingRange(entity.scriptID, 0);
    });
  }
}