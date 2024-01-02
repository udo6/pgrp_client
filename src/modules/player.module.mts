import alt from 'alt-client';
import game from 'natives';

import { ModuleBase } from "../utils/models/baseModels/module.base.mjs";
import { loadIPLs } from '../utils/ipl.mjs';
import { Colshape } from '../utils/models/colshape.model.mjs';
import { clearTasks, playAnim } from '../utils/animation.handler.mjs';
import { WeaponModel } from '../utils/models/weapon.model.mjs';
import browserModule from './browser.module.mjs';

const weathers = [
  "CLEAR",
  "EXTRASUNNY",
  "CLOUDS",
  "OVERCAST",
  "RAIN",
  "CLEARING",
  "THUNDER",
  "SMOG",
  "FOGGY"
];

export default new class PlayerModule extends ModuleBase {
  public alive: boolean;
  public freezed: boolean;
  public isFarming: boolean;
  public colshape: Colshape | null;
  public weapons: number[];
  public dimension: number;
  public team: number;
  public admin: number;
  public cuffed: boolean;
  public roped: boolean;
  public superSecretFeature: boolean;

  public gargabeProp: number;

  constructor() {
    super('PlayerModule');

    this.alive = true;
    this.freezed = false;
    this.isFarming = false;
    this.colshape = null;
    this.weapons = [];
    this.dimension = 0;
    this.team = 0;
    this.admin = 0;
    this.cuffed = false;
    this.roped = false;
    this.superSecretFeature = false;

    this.setMaxStats();
    loadIPLs();
    this.setTime();

    alt.onServer('Client:PlayerModule:SetIdentifier', this.setLocalIdentifier.bind(this));
    alt.onServer('Client:PlayerModule:SetAdmin', this.setAdmin.bind(this));
    alt.onServer('Client:PlayerModule:SetTeam', this.setTeam.bind(this));
    alt.onServer('Client:PlayerModule:SetDimension', this.setDimension.bind(this));
    alt.onServer('Client:PlayerModule:Freeze', this.setPlayerFreezed.bind(this));
    alt.onServer('Client:PlayerModule:SetWeather', this.setWeather.bind(this));
    alt.onServer('Client:PlayerModule:SetFarming', this.setPlayerFarming.bind(this));
    alt.onServer('Client:PlayerModule:SetRunSpeedMultiplier', this.setRunSpeedMultiplier.bind(this));
    alt.onServer('Client:PlayerModule:SetWaypoint', this.setWaypoint.bind(this));
    alt.onServer('Client:PlayerModule:AddWeapon', this.addWeapon.bind(this));
    alt.onServer('Client:PlayerModule:RemoveWeapon', this.removeWeapon.bind(this));
    alt.onServer('Client:PlayerModule:SetAmmo', this.setAmmo.bind(this));
    alt.onServer('Client:PlayerModule:AddAmmo', this.addAmmo.bind(this));
    alt.onServer('Client:PlayerModule:EnterColshape', this.enterColshape.bind(this));
    alt.onServer('Client:PlayerModule:ExitColshape', this.exitColshape.bind(this));
    alt.onServer('Client:PlayerModule:LoadIpl', this.loadIpl.bind(this));
    alt.onServer('Client:PlayerModule:UnloadIpl', this.unloadIpl.bind(this));
    alt.onServer('Client:PlayerModule:SetSuperSecretFeature', this.setSuperSecretFeature.bind(this));

    alt.on('streamSyncedMetaChange', this.onMetaChange.bind(this));

    browserModule.on('Client:PlayerModule:SetWaypoint', this.setWaypoint.bind(this));

    alt.everyTick(this.tick.bind(this));
    alt.setInterval(this.deathTick.bind(this), 800);
    alt.setInterval(this.disableIdleCam.bind(this), 15000);

    alt.Utils.requestModel(1885233650).then(() => alt.Utils.requestModel(2627665880).then(async () => {
      let identifier = alt.LocalStorage.get('UNIQUE_IDENTIFIER');
      if(identifier == null) identifier = 0;

      try {
        const token = await alt.Discord.requestOAuth2Token('1191214265483411526');
        this.triggerServer('Server:Login:Auth', token, identifier);
      } catch(e: any) {
        this.triggerServer('Server:Login:Kick', 'Authentication failed! (Code: 1)');
      }
    }));
  }

  private setLocalIdentifier(identifier: number): void {
    alt.LocalStorage.set('UNIQUE_IDENTIFIER', identifier);
  }

  private disableIdleCam(): void {
    game.invalidateIdleCam();
    game.invalidateCinematicVehicleIdleMode();
  }

  private tick(): void {
    if (game.isPedUsingActionMode(alt.Player.local)) {
      game.setPedUsingActionMode(alt.Player.local, false, -1, "-1");
    }

    if (game.isPedArmed(alt.Player.local.scriptID, 6)) {
      game.disableControlAction(0, 140, true);
      game.disableControlAction(0, 141, true);
      game.disableControlAction(0, 142, true);

      if(this.superSecretFeature) {
        game.setWeaponDamageModifier(alt.Player.local.currentWeapon, 0.7);
      }
    }

    if (this.freezed) {
      game.disablePlayerFiring(alt.Player.local.scriptID, true);
      game.disableControlAction(0, 30, true); //Move LR
      game.disableControlAction(0, 31, true); //Move UD
      game.disableControlAction(0, 22, true); //Space
      game.disableControlAction(0, 23, true); //Veh Enter
      game.disableControlAction(0, 25, true); //Right Mouse
      game.disableControlAction(0, 44, true); //Q
      game.disableControlAction(2, 75, true); //Exit Vehicle
      game.disableControlAction(2, 140, true); //R
      game.disableControlAction(2, 141, true); //Left Mouse
    }

    game.disableControlAction(0, 36, true);
    game.disableControlAction(0, 345, true);
  }

  private setAdmin(rank: number): void {
    this.admin = rank;
  }

  private setTeam(team: number): void {
    this.team = team;
  }

  private setDimension(dim: number): void {
    this.dimension = dim;
  }

  public setWeather(id: number): void {
    game.setWeatherTypeNow(weathers[id]);
  }

  public setPlayerFarming(state: boolean): void {
    this.isFarming = state;
  }

  public setPlayerFreezed(state: boolean): void {
    this.freezed = state;
  }

  private addWeapon(weapon: number): void {
    this.weapons.push(weapon);
  }

  private removeWeapon(weapon: number): void {
    this.weapons.splice(this.weapons.findIndex(x => x == weapon), 1);
    game.setPedAmmo(alt.Player.local.scriptID, weapon, 0, true);
  }

  private setAmmo(hash: number, ammo: number): void {
    game.setPedAmmo(alt.Player.local.scriptID, hash, ammo, true);
  }

  private addAmmo(hash: number, ammo: number): void {
    const currentAmmo = game.getAmmoInPedWeapon(alt.Player.local.scriptID, hash);
    const newAmmo = currentAmmo + ammo;
    game.setPedAmmo(alt.Player.local.scriptID, hash, newAmmo, true);
  }

  private setTime(): void {
    const now = new Date();
    game.setClockTime(now.getHours(), now.getMinutes(), 0);
  }

  private deathTick(): void {
    this.setTime();

    if (!this.alive) {
      const stabilized = alt.Player.local.getStreamSyncedMeta('STABILIZED') as boolean;

      if (alt.Player.local.vehicle == null) {
        if (stabilized) {
          if (!game.isEntityPlayingAnim(alt.Player.local, "combat@damage@rb_writhe", "rb_writhe_loop", 1)) playAnim(12);
        } else {
          if (!game.isEntityPlayingAnim(alt.Player.local, "missarmenian2", "corpse_search_exit_ped", 1)) playAnim(0);
        }
      } else {
        clearTasks();
      }
    }
  }

  private onMetaChange(entity: alt.Entity, key: string, value: any, oldValue: any): void {
    if (entity != alt.Player.local) return;

    if (key == 'ALIVE') {
      this.alive = value;
      this.freezed = !value;
      game.setPlayerCanDoDriveBy(alt.Player.local.scriptID, value);

      if (!value) game.animpostfxPlay("DeathFailOut", 0, true);
      else game.animpostfxStopAll();
      browserModule.disableAllComponents();
      browserModule.showComponent('Death', !value, '0');
    }

    if (key == 'CUFFED') {
      game.setEnableHandcuffs(alt.Player.local, value);
      this.freezed = value;
      game.setPlayerCanDoDriveBy(alt.Player.local.scriptID, !value);
      this.cuffed = value;
    }

    if (key == 'ROPED') {
      game.setEnableHandcuffs(alt.Player.local, value);
      this.freezed = value;
      game.setPlayerCanDoDriveBy(alt.Player.local.scriptID, !value);
      this.roped = value;
    }
  }

  private setRunSpeedMultiplier(multi: number): void {
    game.setRunSprintMultiplierForPlayer(alt.Player.local.scriptID, multi);
  }

  private setWaypoint(x: number, y: number): void {
    game.setNewWaypoint(x, y);
  }

  public enterColshape(id: number, type: number): void {
    this.colshape = new Colshape(id, type);
  }

  public exitColshape(id: number, type: number): void {
    this.colshape = null;
  }

  private setMaxStats() {
    alt.setStat('stamina', 200);
    alt.setStat('strength', 100);
    alt.setStat('lung_capacity', 100);
    alt.setStat('wheelie_ability', 100);
    alt.setStat('flying_ability', 100);
    alt.setStat('shooting_ability', 200);
    alt.setStat('stealth_ability', 100);
  }

  private loadIpl(ipl: string) {
    alt.requestIpl(ipl);
  }

  private unloadIpl(ipl: string) {
    alt.removeIpl(ipl);
  }

  private setSuperSecretFeature(state: boolean): void {
    this.superSecretFeature = state;
  }
}