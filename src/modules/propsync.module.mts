import alt from 'alt-client';
import game from 'natives';

import { ModuleBase } from "../utils/models/baseModels/module.base.mjs";

export default new class PropSyncModule extends ModuleBase {
  public tempProp: alt.Object | null;

  constructor() {
    super('PropSyncModule');

    alt.onServer("Client:PropSyncModule:AddProp", this.addProp.bind(this));
    alt.onServer("Client:PropSyncModule:Clear", this.clearProps.bind(this));
    alt.everyTick(this.tick.bind(this));

    this.tempProp = null;
  }

  private addProp(propName: string, bone: number, posX: number, posY: number, posZ: number, rotX: number, rotY: number, rotZ: number): void {
    if (this.tempProp != null) {
      this.tempProp.destroy();
      this.tempProp = null;
    }

    const player = alt.Player.local;
    const prop = game.createObject(game.getHashKey(propName), player.pos.x, player.pos.y, player.pos.z, false, true, false);

    game.attachEntityToEntity(prop, player.scriptID, game.getPedBoneIndex(player.scriptID, bone), posX, posY, posZ, rotX, rotY, rotZ, false, false, false, true, 2, true, false);
    this.tempProp = alt.Object.all.find(x => x.id == prop);
  }

  private clearProps(): void {
    if (this.tempProp == null) return;

    game.detachEntity(this.tempProp.scriptID, true, true);
    game.deleteObject(this.tempProp.scriptID);

    this.tempProp.destroy();
    this.tempProp = null;
  }

  private tick(): void {
    if (this.tempProp != null) {
      const player = alt.Player.local;
      game.attachEntityToEntity(this.tempProp.scriptID, player.scriptID, game.getPedBoneIndex(player.scriptID, 57005), 0, 0, 0, 0, 0, 0, false, false, false, true, 2, true, false);
    }
  }
}