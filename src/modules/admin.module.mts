import alt from 'alt-client';
import game from 'natives';
import { ModuleBase } from '../utils/models/baseModels/module.base.mjs';
import { NoclipModel } from '../utils/models/noclip.model.mjs';

export default new class AdminModule extends ModuleBase {
  public duty: boolean;
  public noclip: NoclipModel;
  public spectating: boolean;

  private _namesTick: number | null;
  private _spectateTarget: alt.Player | null;
  private _spectateCam: number | null;
  private _spectateTick: number | null;

  constructor() {
    super('AdminModule');

    this.duty = false;
    this.noclip = new NoclipModel();
    this._namesTick = null;
    this._spectateTarget = null;
    this._spectateCam = null;
    this._spectateTick = null;

    alt.onServer('Client:AdminModule:StartSpectating', this.startSpectating.bind(this));
    alt.onServer('Client:AdminModule:StopSpectating', this.stopSpectating.bind(this));
    alt.onServer('Client:AdminModule:SetDuty', this.setDuty.bind(this));
    alt.onServer('Client:AdminModule:ToggleNames', this.toggleNames.bind(this));
  }

  private startSpectating(target: alt.Player): void {
    if(target == null || !target.valid || this._spectateTick != null) return;

    this.spectating = true;
    this._spectateTarget = target;
    this._spectateCam = game.createCamWithParams('DEFAULT_SCRIPTED_CAMERA', target.pos.x, target.pos.y, target.pos.z, 0, 0, 0, 75, true, 2);
    game.pointCamAtPedBone(this._spectateCam, target, 39317, 0, 0, 0, true);
    game.setCamActive(this._spectateCam, true);
    game.renderScriptCams(true, false, 0, true, false, 0);

    this._spectateTick = alt.everyTick(this.renderSpectate.bind(this));
  }

  private stopSpectating(): void {
    if(this._spectateCam != null) {
      game.detachCam(this._spectateCam);
      game.setCamActive(this._spectateCam, false);
      game.destroyCam(this._spectateCam, false);
      game.renderScriptCams(false, false, 0, true, false, 0);
      this._spectateCam = null;
    }

    if(this._spectateTick != null) {
      alt.clearEveryTick(this._spectateTick);
      this._spectateTick = null;
    }

    this._spectateTarget = null;
    this.spectating = false;
  }

  private renderSpectate(): void {
    if(this._spectateCam == null) return;
    if(this._spectateTarget == null || !this._spectateTarget.valid) return this.stopSpectating();

    game.attachCamToPedBone(this._spectateCam, this._spectateTarget, 39317, 0, -5.0, 1.0, true);
    alt.Player.local.pos = new alt.Vector3(this._spectateTarget.pos.x, this._spectateTarget.pos.y, this._spectateTarget.pos.z - 100);
  }

  private setDuty(state: boolean): void {
    this.duty = state;
    this.setNames(state);
    this.noclip.disable();
  }

  private toggleNames(): void {
    this.setNames(this._namesTick == null);
  }

  private setNames(state: boolean): void {
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
      const name = player.getStreamSyncedMeta('PLAYER_NAME');
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
      game.addTextComponentSubstringPlayerName(`~w~${name} ~g~${game.getEntityHealth(player.scriptID)} ~b~${game.getPedArmour(player.scriptID)}`);
      game.endTextCommandDisplayText(0, 0, 0);
      game.clearDrawOrigin();
    });
  }
}