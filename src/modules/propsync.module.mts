import alt from 'alt-client';
import game from 'natives';

import { ModuleBase } from "../utils/models/baseModels/module.base.mjs";
import { Entity } from 'alt-client';
import { BaseObjectType } from 'alt-client';

export default new class PropSyncModule extends ModuleBase {
  public temporaryProp: number | null;
  public propData: { propName: string, bone: number, posX: number, posY: number, posZ: number, rotX: number, rotY: number, rotZ: number } | null;
  private clearing: boolean;

  constructor() {
    super('PropSyncModule');

    this.temporaryProp = null;
    this.propData = null;
    this.clearing = false;

    alt.onServer("Client:PropSyncModule:AddProp", this.addProp.bind(this));
    alt.onServer("Client:PropSyncModule:Clear", this.clearProps.bind(this));

    alt.on('syncedMetaChange', this.syncedMetaChange.bind(this));
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

    this.clearing = true;
  }

  private syncedMetaChange(entity: Entity, key: any, newValue: any, oldValue: any): void {
    if (entity.type !== BaseObjectType.Player) return;
    if (!entity.hasSyncedMeta('Player:PropSyncModule:Prop')) return;

    let value = JSON.parse(entity.getSyncedMeta('Player:PropSyncModule:Prop') as string) as { propName: string, bone: number, posX: number, posY: number, posZ: number, rotX: number, rotY: number, rotZ: number } | null;
    if (value == null) return;

    game.attachEntityToEntity(
      this.temporaryProp,
      entity.scriptID,
      game.getPedBoneIndex(entity.scriptID, value.bone),
      value.posX,
      value.posY,
      value.posZ,
      value.rotX,
      value.rotY,
      value.rotZ,
      false,
      false,
      false,
      false,
      2,
      true,
      0
    );
  }
}