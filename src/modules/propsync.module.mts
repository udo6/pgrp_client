import alt from 'alt-client';
import game from 'natives';

import { ModuleBase } from "../utils/models/baseModels/module.base.mjs";

export default new class PropSyncModule extends ModuleBase {
  public temporaryProp: number | null;
  public propData: { propName: string, bone: number, posX: number, posY: number, posZ: number, rotX: number, rotY: number, rotZ: number } | null;

  constructor() {
    super('PropSyncModule');

    this.temporaryProp = null;
    this.propData = null;

    alt.onServer("Client:PropSyncModule:AddProp", this.addProp.bind(this));
    alt.onServer("Client:PropSyncModule:Clear", this.clearProps.bind(this));

    // alt.everyTick(this.tick.bind(this));
  }

  private addProp(propName: string, bone: number, posX: number, posY: number, posZ: number, rotX: number, rotY: number, rotZ: number): void {
    const player = alt.Player.local;

    const prop = game.createObject(game.getHashKey(propName), player.pos.x, player.pos.y, player.pos.z, false, true, false);
    if (prop == -1) return;

    game.attachEntityToEntity(prop, player.scriptID, game.getPedBoneIndex(player.scriptID, bone), posX, posY, posZ, rotX, rotY, rotZ, false, false, false, false, 2, true, 0);
    this.temporaryProp = prop;
    this.propData = {
      propName: propName,
      bone: bone,
      posX: posX,
      posY: posY,
      posZ: posZ,
      rotX: rotX,
      rotY: rotY,
      rotZ: rotZ
    };
  }

  private clearProps(): void {
    if (this.temporaryProp == null) return;

    game.deleteObject(this.temporaryProp);
    game.detachEntity(this.temporaryProp, true, true);

    this.temporaryProp = null;
    this.propData = null;
  }

  // private tick(): void {
  //   if (this.tempProp != null) {
  //     const player = alt.Player.local;
  //     game.attachEntityToEntity(this.tempProp, player.scriptID, game.getPedBoneIndex(player.scriptID, this.propData.bone), this.propData.posX, this.propData.posY, this.propData.posZ, this.propData.rotX, this.propData.posY, this.propData.posZ, false, false, false, true, 2, true, 0);
  //   }
  // }
}