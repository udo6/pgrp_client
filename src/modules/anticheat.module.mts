import alt from 'alt-client';
import game, { getWeaponComponentHudStats } from 'natives';
import { AnticheatComponent } from '../utils/models/anticheat.component.mjs';
import { ModuleBase } from "../utils/models/baseModels/module.base.mjs";
import weaponData from '../utils/data/weaponData.mjs';
import adminModule from './admin.module.mjs';
import { distanceTo2D } from '../utils/math.mjs';

const meeleWeapons: number[] = [
  0x92A27487,
  0x958A4A8F,
  0xF9E6AA4B,
  0x84BD7BFD,
  0x8BB05FD7,
  0x440E4788,
  0x4E875F73,
  0xF9DCBF2D,
  0xD8DF3C3C,
  0x99B507EA,
  0xDD5DF8D9,
  0xDFE37640,
  0x678B81B1,
  0x19044EE0,
  0xCD274149,
  0x94117305,
  0x3813FC08,
  0x6589186A
];

const vehicleParachuteWhitelist: number[] = [
  0x381E10BD
];

const vehicleRocketboostWhitelist: number[] = [
  0x3AF76F4A,
  0xB5EF4C33
];

// todo: noclip
export default new class AnticheatModule extends ModuleBase {
  public static tpMaxDist: number = 25;
  public static tpVehicleMaxDist: number = 50;

  public active: boolean;
  public position: AnticheatComponent<alt.Vector3>;
  public fly: AnticheatComponent<boolean>;
  public ammoInMag: number;
  public lastShot: number;
  public useWeaponModifier: boolean;

  constructor() {
    super('AnticheatModule');

    this.active = true;
    this.position = new AnticheatComponent(alt.Player.local.pos, 750);
    this.fly = new AnticheatComponent(false, 750);
    this.ammoInMag = 0;
    this.lastShot = new Date().getTime();
    this.useWeaponModifier = true;

    alt.everyTick(this.tick.bind(this));

    alt.on('playerWeaponChange', this.onWeaponSwitch.bind(this));
    alt.on('playerWeaponShoot', this.onWeaponShoot.bind(this));
    alt.on('enteredVehicle', this.enterVehicle.bind(this));
    alt.on('leftVehicle', this.extiVehicle.bind(this));

    alt.onServer('Client:AnticheatModule:SetPosition', this.setPosition.bind(this));
  }

  private enterVehicle(veh: alt.Vehicle, seat: number): void {
    this.position.reset(alt.Player.local.pos);
  }

  private extiVehicle(veh: alt.Vehicle, seat: number): void {
    this.position.reset(alt.Player.local.pos);
  }

  public setPosition(pos: alt.Vector3): void {
    this.position.value = pos;
    this.position.flags = 0;
  }

  private tick(): void {
    if (!this.active) return;

    const player = alt.Player.local;

    if (!adminModule.spectating) {
      const noclip = adminModule.noclip.active;
      const tpDist = distanceTo2D(this.position.value.x, this.position.value.y, player.pos.x, player.pos.y);
      const allowedTpDist = player.vehicle == null ? AnticheatModule.tpMaxDist : AnticheatModule.tpVehicleMaxDist;

      if (this.position.active && (!noclip && tpDist > allowedTpDist)) {
        this.position.flag();
      }
      else {
        this.position.unflag();
        this.position.value = player.pos;
      }
    }

    this.checkFlags();

    if (player.isReloading || game.isPedClimbing(player) || player.isLeavingVehicle) {
      const clipSize = game.getWeaponClipSize(player.currentWeapon);
      this.ammoInMag = clipSize;
    }

    if (alt.Player.local.vehicle != null) {
      const veh = alt.Player.local.vehicle;

      if (!vehicleParachuteWhitelist.includes(veh.model) && (game.isVehicleParachuteDeployed(veh.scriptID) || game.getVehicleCanDeployParachute(veh.scriptID) || game.getVehicleHasParachute(veh.scriptID))) {
        this.triggerServer('Server:Anticheat:VehicleParachute');
      }

      if (!vehicleRocketboostWhitelist.includes(veh.model) && game.isRocketBoostActive(veh.scriptID)) {
        this.triggerServer('Server:Anticheat:RocketBoost');
      }
    }
  }

  private checkFlags(): void {
    const player = alt.Player.local;

    if (this.position.flags > this.position.maxFlags) {
      this.triggerServer('Server:Anticheat:Teleport', this.position.value);
      this.timeout();
      this.position.reset(player.pos);
      return;
    }
  }

  private onWeaponSwitch(oldWeapon: number, newWeapon: number): void {
    if (!this.useWeaponModifier || newWeapon == 2725352035 || meeleWeapons.find(x => x == newWeapon) != null) return;

    const clipSize = game.getWeaponClipSize(newWeapon);
    this.ammoInMag = clipSize;

    const altvData = alt.WeaponData.getForHash(newWeapon);
    const data = (weaponData as any)[`${newWeapon}`];

    if (data != null && weaponData != null) {
      let detected = false;
      let args = [];
      if (altvData.recoilShakeAmplitude != data.recoilShakeAmplitude) {
        args = ['recoilShakeAmplitude', altvData.recoilShakeAmplitude];
        detected = true;
      }

      if (altvData.recoilAccuracyMax != data.recoilAccuracyMax) {
        args = ['recoilAccuracyMax', altvData.recoilAccuracyMax];
        detected = true;
      }

      if (altvData.recoilAccuracyToAllowHeadshotPlayer != data.recoilAccuracyToAllowHeadshotPlayer) {
        args = ['recoilAccuracyToAllowHeadshotPlayer', altvData.recoilAccuracyToAllowHeadshotPlayer];
        detected = true;
      }

      if (altvData.recoilRecoveryRate != data.recoilRecoveryRate) {
        args = ['recoilRecoveryRate', altvData.recoilRecoveryRate];
        detected = true;
      }

      if (altvData.animReloadRate != data.animReloadRate) {
        args = ['animReloadRate', altvData.animReloadRate];
        detected = true;
      }

      if (altvData.vehicleReloadTime != data.vehicleReloadTime) {
        args = ['vehicleReloadTime', altvData.vehicleReloadTime];
        detected = true;
      }

      if (altvData.accuracySpread != data.accuracySpread) {
        args = ['accuracySpread', altvData.accuracySpread];
        detected = true;
      }

      if (altvData.range != data.range) {
        args = ['range', altvData.range];
        detected = true;
      }

      if (altvData.timeBetweenShots != data.timeBetweenShots) {
        args = ['timeBetweenShots', altvData.timeBetweenShots];
        detected = true;
      }

      if (altvData.playerDamageModifier != data.playerDamageModifier) {
        args = ['playerDamageModifier', altvData.playerDamageModifier];
        detected = true;
      }

      if (detected) {
        this.useWeaponModifier = false;
        this.triggerServer('Server:Anticheat:WeaponModification', newWeapon, ...args);
        alt.setTimeout(() => {
          this.useWeaponModifier = true;
        }, 10000);
      }
    }
  }

  private onWeaponShoot(weapon: number, ammo: number, clip: number): void {
    const data = (weaponData as any)[`${weapon}`];
    const now = new Date().getTime();

    if (data != null) {
      const time = now - this.lastShot;
      if (time < data.rapidFireMinTime) {
        this.triggerServer('Server:Anticheat:Rapidfire', weapon, time);
      }
    }

    this.lastShot = now;

    if(alt.Player.local.vehicle != null) return;
    
    this.ammoInMag--;
    if(this.ammoInMag < 0) {
      this.triggerServer('Server:Anticheat:NoReload', weapon);
      const clipSize = game.getWeaponClipSize(alt.Player.local.currentWeapon);
      this.ammoInMag = clipSize;
    }
  }

  private timeout(duration: number = 500): void {
    this.active = false;
    alt.setTimeout(() => {
      this.active = true;
    }, duration);
  }
}