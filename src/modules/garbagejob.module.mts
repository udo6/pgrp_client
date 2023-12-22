import alt from 'alt-client';
import game from 'natives';

import { ModuleBase } from "../utils/models/baseModels/module.base.mjs";
import { KeyCode } from '../utils/enums/keys.mjs';

export default new class GarbageJobModule extends ModuleBase {

  constructor() {
    super('GarbageJobModule');

    alt.on("keydown", this.keyDown.bind(this));
  }

  private keyDown(key: number): void {
    if (KeyCode.KEY_E != key) return;

    const vehicle = alt.Vehicle.all.filter(x => x.model == 1917016601).find(x => x.pos.distanceTo(alt.Player.local.pos) <= 10); // 1917016601 = Trash truck
    if (vehicle != null) {
      const trunkCoords = game.getWorldPositionOfEntityBone(vehicle.scriptID, game.getEntityBoneIndexByName(vehicle.scriptID, 'platelight'));
      const distance = game.getDistanceBetweenCoords(alt.Player.local.pos.x, alt.Player.local.pos.y, alt.Player.local.pos.z, trunkCoords.x, trunkCoords.y, trunkCoords.z, true);
      if (distance <= 1.5) {
        this.triggerServer("Server:GarbageJob:Throw", vehicle.id);
      }
    }
  }
}