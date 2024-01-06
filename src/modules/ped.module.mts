import alt, { BaseObjectType } from 'alt-client';
import game from 'natives';

import { ModuleBase } from "../utils/models/baseModels/module.base.mjs";

export default new class PedModule extends ModuleBase {
  constructor() {
    super('PedModule');

    alt.on('worldObjectStreamIn', this.streamIn.bind(this));
    alt.setInterval(this.freezePeds.bind(this), 5000);
  }

  private streamIn(object: alt.WorldObject): void {
    if(object.type != BaseObjectType.Ped) return;

    this.freezePed(object as alt.Ped);
  }

  private freezePeds(): void {
    alt.Ped.streamedIn.forEach(ped => {
      if(ped.type != BaseObjectType.Ped) return;

      this.freezePed(ped);
    });
  }

  private freezePed(ped: alt.Ped): void {
    game.freezeEntityPosition(ped, true);
      game.taskSetBlockingOfNonTemporaryEvents(ped.scriptID, true);
      game.setEntityProofs(
        ped,
        true, // bullet
        true, // fire
        true, // explosion
        true, // collision
        true, // melee
        true, // steam
        true, // DontResetDamageFlagsOnCleanupMissionState (?)
        true // water
      );
      game.setPedTreatedAsFriendly(ped, 1, 0);
      game.setRagdollBlockingFlags(ped.scriptID, 262143);
      game.setPedResetFlag(ped.scriptID, 458, true);
      game.setPedResetFlag(ped.scriptID, 64, true);
      game.setPedResetFlag(ped.scriptID, 249, true);
  }
}