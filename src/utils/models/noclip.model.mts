import alt from 'alt-client';
import game from 'natives';
import adminModule from '../../modules/admin.module.mjs';
import browserModule from '../../modules/browser.module.mjs';
import playerModule from '../../modules/player.module.mjs';

export class NoclipModel {
  public active: boolean;
  public entity: number;
  public tick: number;

  constructor() {
    this.active = false;
    this.entity = -1;
    this.tick = -1;
  }

  public toggle(): void {
    if(!playerModule.alive || !adminModule.duty || browserModule.isAnyComponentActive()) return;
    
    this.active = !this.active;
    alt.emitServer('Server:Admin:ToggleNoclip', this.active);

    this.active ? this.tick = alt.everyTick(() => this.onTick()) : alt.clearEveryTick(this.tick);

    this.entity = (alt.Player.local.vehicle != null ? alt.Player.local.vehicle : alt.Player.local).scriptID;

    game.setVehicleGravity(this.entity, !this.active);
    game.freezeEntityPosition(this.entity, this.active);
    game.setEntityCollision(this.entity, !this.active, !this.active);
  }

  public disable(): void {
    if(!this.active) return;
    
    this.active = false;
    alt.clearEveryTick(this.tick);

    game.setVehicleGravity(this.entity, true);
    game.freezeEntityPosition(this.entity, false);
    game.setEntityCollision(this.entity, true, true);
    this.entity = -1;
  }

  private onTick(): void {
    let yoff = 0.0
    let xoff = 0.0
    let zoff = 0.0

    game.disableControlAction(0, 32, true); // W
    game.disableControlAction(0, 33, true); // S
    game.disableControlAction(0, 34, true); // A
    game.disableControlAction(0, 35, true); // D
    game.disableControlAction(0, 22, true); // Space
    game.disableControlAction(0, 21, true); // Shift
    game.disableControlAction(0, 268, true); // MoveUP
    game.disableControlAction(0, 269, true); // MoveDown
    game.disableControlAction(0, 266, true); // MoveLeft
    game.disableControlAction(0, 267, true); // MoveRight
    game.disableControlAction(0, 31, true); // MoveUD
    game.disableControlAction(0, 30, true); // MoveLR
    game.disableControlAction(0, 44, true); // Cover Q
    game.disableControlAction(0, 85, true); // RadioWheel Q
    game.disableControlAction(0, 86, true); // Horn E
    game.disableControlAction(0, 74, true); // HeadLight L
    game.disableControlAction(0, 36, true); // Duck Left CTRL

    let speedMultiplier = 1
    if (game.isDisabledControlPressed(0, 21)) speedMultiplier *= 2
    if (game.isDisabledControlPressed(0, 36)) speedMultiplier *= 0.3

    if (game.updateOnscreenKeyboard() !== 0 && alt.isGameFocused()) {
      if (game.isDisabledControlPressed(0, 32)) yoff = 1 * speedMultiplier; // W
      if (game.isDisabledControlPressed(0, 33)) yoff = -1 * speedMultiplier; // S
      if (game.isDisabledControlPressed(0, 34)) xoff = -1 * speedMultiplier; // A
      if (game.isDisabledControlPressed(0, 35)) xoff = 1 * speedMultiplier; // D
      if (game.isDisabledControlPressed(0, 86)) zoff = 1 * speedMultiplier; // E
      if (game.isDisabledControlPressed(0, 44)) zoff = -1 * speedMultiplier; // Q
    }

    const newPosition = game.getOffsetFromEntityInWorldCoords(this.entity, xoff, yoff, zoff);
    const rotation = game.getGameplayCamRot(0);

    game.setEntityRotation(this.entity, 0, 0, rotation.z, 0, false);
    game.setEntityCoordsNoOffset(this.entity, newPosition.x, newPosition.y, newPosition.z, true, true, true);
  }
}