import alt, { BaseObjectType } from 'alt-client';
import game from 'natives';

import { ModuleBase } from "../utils/models/baseModels/module.base.mjs";

export default new class PedModule extends ModuleBase {
  constructor() {
    super('PedModule');

    alt.on('gameEntityCreate', this.streamIn.bind(this));
  }

  private streamIn(entity: alt.Entity): void {
    if(!game.isEntityAPed(entity) || entity.type != BaseObjectType.Ped) return;

    game.setEntityInvincible(entity, true);
    game.setPedFleeAttributes(entity.scriptID, 0, false);
    game.setPedCombatAttributes(entity.scriptID, 58, true);
    game.setPedSeeingRange(entity.scriptID, 0);
  }
}