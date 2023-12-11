import alt from 'alt-client';
import game from 'natives';
import { ModuleBase } from '../utils/models/baseModels/module.base.mjs';
import { NoclipModel } from '../utils/models/noclip.model.mjs';

export default new class AdminModule extends ModuleBase {
  public duty: boolean;
  public noclip: NoclipModel;
  private _namesTick: number | null;

  constructor() {
    super('AdminModule');

    this.duty = false;
    this.noclip = new NoclipModel();
    this._namesTick = null;

    alt.onServer('Client:AdminModule:SetDuty', (state: boolean) => this.setDuty(state));
  }

  private setDuty(state: boolean): void {
    this.duty = state;

    if(state) {
      if(this._namesTick != null) {
        alt.clearEveryTick(this._namesTick);
        this._namesTick = null;
      }

      this._namesTick = alt.everyTick(this.drawNames.bind(this));
    } else if(this._namesTick != null) {
      alt.clearEveryTick(this._namesTick);
      this._namesTick = null;
    }

    this.noclip.disable();
  }

  private distance(vector1, vector2) {
    return Math.sqrt(
        Math.pow(vector1.x - vector2.x, 2) +
        Math.pow(vector1.y - vector2.y, 2) +
        Math.pow(vector1.z - vector2.z, 2)
    );
  }

  private drawNames(): void {
    alt.Player.all.forEach(player => {
      if(player == alt.Player.local || player.scriptID == 0) return;
      if(this.distance(player.pos, alt.Player.local.pos) > 75) return;

      const velocity = game.getEntityVelocity(player);
      const frameTime = game.getFrameTime();
      game.setDrawOrigin(
        player.pos.x + velocity.x * frameTime,
        player.pos.y + velocity.y * frameTime,
        player.pos.z + velocity.z * frameTime + 1.1,
        false);
        
      game.beginTextCommandDisplayText("STRING");
      game.setTextFont(4);
      game.setTextCentre(true);
      game.setTextOutline();

      const fontSize = (1 - (0.8 * this.distance(player.pos, alt.Player.local.pos)) / 100) * 0.4;
      game.setTextScale(fontSize, fontSize);
      game.setTextProportional(true);
      game.addTextComponentSubstringPlayerName(`~w~${player.name} ~g~${game.getEntityHealth(player.scriptID)} ~b~${game.getPedArmour(player.scriptID)}`);
      game.endTextCommandDisplayText(0, 0, 0);
      game.clearDrawOrigin();
    });
  }
}