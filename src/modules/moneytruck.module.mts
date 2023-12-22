import alt from 'alt-client';
import game from 'natives';

import { ModuleBase } from "../utils/models/baseModels/module.base.mjs";
import playerModule from './player.module.mjs';

export default new class MoneyTruckModule extends ModuleBase {
  public tempProp: alt.Object | null;

  constructor() {
    super('MoneyTruckModule');

    alt.onServer("Client:MoneyTruckModule:AddProp", this.addProp.bind(this));
    alt.on('keydown', (key: number) => this.onKeyDown(key));
    alt.everyTick(this.tick.bind(this));

    this.tempProp = null;
  }

  private addProp(value): void {
    if (value) {
      if (this.tempProp != null) {
        this.tempProp.destroy();
        this.tempProp = null;
      }

      const player = alt.Player.local;
      const prop = game.createObject(game.getHashKey('prop_money_bag_01'), player.pos.x, player.pos.y, player.pos.z, false, true, false);
      game.attachEntityToEntity(prop, player.scriptID, game.getPedBoneIndex(player.scriptID, 57005), 0, 0, 0, 0, 0, 0, false, false, false, true, 2, true, false);

      this.tempProp = alt.Object.all.find(x => x.id == prop);
    } else {
      if (this.tempProp != null) {
        game.detachEntity(this.tempProp.scriptID, true, true);
        game.deleteObject(this.tempProp.scriptID);

        this.tempProp.destroy();
        this.tempProp = null;
      }
    }
  }

  private tick(): void {
    if (this.tempProp != null) {
      const player = alt.Player.local;
      game.attachEntityToEntity(this.tempProp.scriptID, player.scriptID, game.getPedBoneIndex(player.scriptID, 57005), 0, 0, 0, 0, 0, 0, false, false, false, true, 2, true, false);
    }
  }

  private onKeyDown(key: number): void {
    if (!playerModule.alive || alt.Player.local.getStreamSyncedMeta('ROPED') || alt.Player.local.getStreamSyncedMeta('CUFFED')) return;

    const vehicle = alt.Vehicle.all.filter(x => x.model == 1917016601).find(x => x.pos.distanceTo(alt.Player.local.pos) <= 10); // 1917016601 = Money truck
    if (vehicle != null) {
      const trunkCoords = game.getWorldPositionOfEntityBone(vehicle.scriptID, game.getEntityBoneIndexByName(vehicle.scriptID, 'platelight'));
      const distance = game.getDistanceBetweenCoords(alt.Player.local.pos.x, alt.Player.local.pos.y, alt.Player.local.pos.z, trunkCoords.x, trunkCoords.y, trunkCoords.z, true);
      if (distance <= 1.5) {
        this.triggerServer("Server:GarbageJob:Throw", vehicle.id);
      }
    }
  }
}