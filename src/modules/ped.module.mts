import alt, { BaseObjectType } from 'alt-client';
import game from 'natives';

import { ModuleBase } from "../utils/models/baseModels/module.base.mjs";

export default new class PedModule extends ModuleBase {
  constructor() {
    super('PedModule');

    alt.on('spawned', this.freezePeds.bind(this));
    alt.setInterval(this.freezePeds.bind(this), 5000);
  }

  private freezePeds(): void {
    alt.Ped.all.forEach(entity => {
      if(entity.type != BaseObjectType.Ped) return;

      game.freezeEntityPosition(entity.scriptID, true);
      game.taskSetBlockingOfNonTemporaryEvents(entity.scriptID, true);
      game.setEntityProofs(
        entity,
        true, // bullet
        true, // fire
        true, // explosion
        true, // collision
        true, // melee
        true, // steam
        true, // DontResetDamageFlagsOnCleanupMissionState (?)
        true // water
      );
      game.setPedTreatedAsFriendly(entity, 1, 0);
      game.setRagdollBlockingFlags(entity.scriptID, 262143);
      game.setPedResetFlag(entity.scriptID, 458, true);
      game.setPedResetFlag(entity.scriptID, 64, true);
      game.setPedResetFlag(entity.scriptID, 249, true);
    });
  }
}