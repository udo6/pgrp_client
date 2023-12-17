import alt, { BaseObjectType } from 'alt-client';
import game from 'natives';
import { AnticheatComponent } from '../utils/models/anticheat.component.mjs';
import { ModuleBase } from "../utils/models/baseModels/module.base.mjs";
import playerModule from './player.module.mjs';
import weaponData from '../utils/data/weaponData.mjs';
import adminModule from './admin.module.mjs';
import { distanceTo } from '../utils/math.mjs';

type godmodePlayer = { player: number, date: Date };

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
  public health: AnticheatComponent<number>;
  public godmode: AnticheatComponent<boolean>;
  public position: AnticheatComponent<alt.Vector3>;
  public fly: AnticheatComponent<boolean>;
  public magic: AnticheatComponent<null>;
  public godmodePlayers: godmodePlayer[];
  public lastShot: number;
  public fallingUnderground: boolean;

  constructor() {
    super('AnticheatModule');

    this.active = true;
    this.health = new AnticheatComponent(200, 1200);
    this.godmode = new AnticheatComponent(false, 750);
    this.position = new AnticheatComponent(alt.Player.local.pos, 750);
    this.fly = new AnticheatComponent(false, 750);
    this.magic = new AnticheatComponent(null, 300);
    this.godmodePlayers = [];
    this.lastShot = new Date().getTime();
    this.fallingUnderground = false;

    alt.everyTick(this.tick.bind(this));

    alt.on('playerWeaponChange', this.onWeaponSwitch.bind(this));
    alt.on('playerWeaponShoot', this.onWeaponShoot.bind(this));
    alt.on('weaponDamage', this.onWeaponDamage.bind(this));
    alt.on('enteredVehicle', this.enterVehicle.bind(this));
    alt.on('leftVehicle', this.extiVehicle.bind(this));

    alt.onServer('Client:AnticheatModule:SetHealth', this.setHealth.bind(this));
    alt.onServer('Client:AnticheatModule:SetGodmode', this.setGodmode.bind(this));
    alt.onServer('Client:AnticheatModule:SetPosition', this.setPosition.bind(this));
  }

  private enterVehicle(veh: alt.Vehicle, seat: number): void {
    this.position.reset(alt.Player.local.pos);
  }

  private extiVehicle(veh: alt.Vehicle, seat: number): void {
    this.position.reset(alt.Player.local.pos);
  }

  private setHealth(health: number): void {
    this.health.value = health;
    this.health.flags = 0;
  }

  public setGodmode(state: boolean): void {
    this.godmode.value = state;
    this.godmode.flags = 0;
  }

  public setPosition(pos: alt.Vector3): void {
    this.position.value = pos;
    this.position.flags = 0;
  }

  private tick(): void {
    if (!this.active) return;

    const player = alt.Player.local;

    if (this.health.active && (player.health + player.armour) > this.health.value) this.health.flag();
    else this.health.unflag();

    if (this.godmode.active && game.getPlayerInvincible(player) != this.godmode.value) this.godmode.flag();
    else this.godmode.unflag();

    const falling = game.isPedFalling(alt.Player.local);
    const noclip = adminModule.noclip.active;
    const tpDist = distanceTo(this.position.value, player.pos, false);
    const allowedTpDist = player.vehicle == null ? AnticheatModule.tpMaxDist : AnticheatModule.tpVehicleMaxDist;

    if(!this.fallingUnderground && falling) {
      const [_, groundZ] = game.getGroundZFor3dCoord(player.pos.x, player.pos.y, player.pos.z, 0, false, false);
      if(groundZ == 0)
        this.fallingUnderground = true;
    }

    if (this.position.active && (!falling && !noclip && tpDist > allowedTpDist)) {
      if(this.fallingUnderground) {
        this.position.flags = 0;
        this.position.value = player.pos;
        this.fallingUnderground = false;
      }
      this.position.flag();
    }
    else { 
      this.position.unflag();
      this.position.value = player.pos;
    }

    this.checkFlags();

    if (game.isPedArmed(alt.Player.local.scriptID, 6)) {
      const weaponData = player.currentWeaponData;
      const data = (weaponData as any)[`${player.currentWeapon}`];
      if (data != null && weaponData != null) {
        if (weaponData.recoilShakeAmplitude != data.recoilShakeAmplitude) alt.log(`[ANTICHEAT] Weapon: ${player.currentWeapon} recoilShakeAmplitude: ${weaponData.recoilShakeAmplitude} | ${data.recoilShakeAmplitude}`);
        if (weaponData.recoilAccuracyMax != data.recoilAccuracyMax) alt.log(`[ANTICHEAT] Weapon: ${player.currentWeapon} recoilAccuracyMax: ${weaponData.recoilAccuracyMax} | ${data.recoilAccuracyMax}`);
        if (weaponData.recoilAccuracyToAllowHeadshotPlayer != data.recoilAccuracyToAllowHeadshotPlayer) alt.log(`[ANTICHEAT] Weapon: ${player.currentWeapon} recoilAccuracyToAllowHeadshotPlayer: ${weaponData.recoilAccuracyToAllowHeadshotPlayer} | ${data.recoilAccuracyToAllowHeadshotPlayer}`);
        if (weaponData.recoilRecoveryRate != data.recoilRecoveryRate) alt.log(`[ANTICHEAT] Weapon: ${player.currentWeapon} recoilRecoveryRate: ${weaponData.recoilRecoveryRate} | ${data.recoilRecoveryRate}`);
        if (weaponData.animReloadRate != data.animReloadRate) alt.log(`[ANTICHEAT] Weapon: ${player.currentWeapon} animReloadRate: ${weaponData.animReloadRate} | ${data.animReloadRate}`);
        if (weaponData.vehicleReloadTime != data.vehicleReloadTime) alt.log(`[ANTICHEAT] Weapon: ${player.currentWeapon} vehicleReloadTime: ${weaponData.vehicleReloadTime} | ${data.vehicleReloadTime}`);
        if (weaponData.accuracySpread != data.accuracySpread) alt.log(`[ANTICHEAT] Weapon: ${player.currentWeapon} accuracySpread: ${weaponData.accuracySpread} | ${data.accuracySpread}`);
        if (weaponData.range != data.range) alt.log(`[ANTICHEAT] Weapon: ${player.currentWeapon} range: ${weaponData.range} | ${data.range}`);
        if (weaponData.timeBetweenShots != data.timeBetweenShots) alt.log(`[ANTICHEAT] Weapon: ${player.currentWeapon} timeBetweenShots: ${weaponData.timeBetweenShots} | ${data.timeBetweenShots}`);
        if (weaponData.playerDamageModifier != data.playerDamageModifier) alt.log(`[ANTICHEAT] Weapon: ${player.currentWeapon} recoilShakeAmplitude: ${weaponData.playerDamageModifier} | ${data.playerDamageModifier}`);
      }
    }

    const now = new Date();
    alt.Player.streamedIn.forEach(x => {
      const entries = this.godmodePlayers.filter(e => e.player == x.id);
      if (entries.length < 1) return;

      const lastEntry = entries[entries.length - 1];
      if (now.getTime() - lastEntry.date.getTime() < 1500) return;

      for (let i = 0; i < entries.length; i++)
        this.godmodePlayers.splice(this.godmodePlayers.findIndex(j => j.player == x.id), 1);
    });

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
    
    if (this.health.flags > this.health.maxFlags) {
      this.triggerServer('Server:Anticheat:Healkey', this.health.value);
      this.timeout();
      this.health.reset(player.health + player.armour);
      return;
    }

    if (this.godmode.flags > this.godmode.maxFlags) {
      const godmode = game.getPlayerInvincible(player.scriptID);
      this.triggerServer('Server:Anticheat:Godmode', this.godmode.value);
      this.timeout();
      this.godmode.reset(godmode);
      return;
    }

    if (this.position.flags > this.position.maxFlags) {
      this.triggerServer('Server:Anticheat:Teleport', this.position.value);
      this.timeout();
      this.position.reset(player.pos);
      return;
    }
  }

  private onWeaponSwitch(oldWeapon: number, newWeapon: number): void {
    if (newWeapon != 2725352035 && game.isPedArmed(alt.Player.local.scriptID, 6)) {
      const weapon = playerModule.weapons.find(e => e == newWeapon);
      if (weapon != null) return;

      this.triggerServer('Server:Anticheat:Weapon', newWeapon);
      this.timeout();
    }
  }

  private onWeaponShoot(weapon: number, ammo: number, clip: number): void {
    const data = (weaponData as any)[`${weapon}`];
    const now = new Date().getTime();

    if(data != null) {
      if(now - this.lastShot < data.rapidFireMinTime) {
        alt.log('[ANTICHEAT] Rapidfire time: ' + (now - this.lastShot));
        alt.log('[ANTICHEAT] Rapidfire data: ' + data.rapidFireMinTime);
      }
    }

    this.lastShot = now;
  }

  private onWeaponDamage(target: alt.Entity, weaponHash: number, damage: number, offset: alt.Vector3, bodyPart: alt.BodyPart): boolean | void {
    const data = (weaponData as any)[`${weaponHash}`];

    if (data != null && damage > data.damage) {
      this.triggerServer('Server:Anticheat:DamageModifier', weaponHash, damage, data.damage);
      this.timeout();
    }

    if (target.type != BaseObjectType.Player) return;
    const targetPlayer = target as alt.Player;
    if(targetPlayer.getStreamSyncedMeta('GODMODE') || targetPlayer.health <= 100) return;

    const beforeHealth = targetPlayer.health;
    const beforeArmor = targetPlayer.armour;

    alt.setTimeout(() => {
      if ((targetPlayer.getStreamSyncedMeta('GODMODE') || targetPlayer.health <= 100) || (!targetPlayer.valid || (targetPlayer.health + targetPlayer.armour) <= (beforeHealth + beforeArmor - damage))) return;

      this.godmodePlayers.push({ player: targetPlayer.id, date: new Date() });

      if (this.godmodePlayers.filter(x => x.player == targetPlayer.id).length > 5) {
        this.triggerServer('Server:Anticheat:GodmodeTarget', targetPlayer, beforeHealth + beforeArmor - damage);
      }
    }, 450);
  }

  private timeout(duration: number = 500): void {
    this.active = false;
    alt.setTimeout(() => {
      this.active = true;
    }, duration);
  }
}