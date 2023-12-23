import alt from 'alt-client';
import game from 'natives';

import { ModuleBase } from "../utils/models/baseModels/module.base.mjs";
import { KeyCode } from '../utils/enums/keys.mjs';

export default new class MoneyTruckJobModule extends ModuleBase {

  constructor() {
    super('MoneyTruckJobModule');

    alt.on("keydown", this.keyDown.bind(this));
  }

  private keyDown(key: number): void {
    if (KeyCode.KEY_E != key) return;
    const vehicle = alt.Vehicle.all.filter(x => x.model == 1747439474).find(x => x.pos.distanceTo(alt.Player.local.pos) <= 10); // 1747439474 = Stockade
    if (vehicle != null) {
      const trunkCoords = game.getWorldPositionOfEntityBone(vehicle.scriptID, game.getEntityBoneIndexByName(vehicle.scriptID, 'door_pside_r'));
      const distance = game.getDistanceBetweenCoords(alt.Player.local.pos.x, alt.Player.local.pos.y, alt.Player.local.pos.z, trunkCoords.x, trunkCoords.y, trunkCoords.z, true);
      if (distance <= 2.5) {
        this.triggerServer("Server:MoneyTruckJob:Store", vehicle.id);
      }
    }
  }
}