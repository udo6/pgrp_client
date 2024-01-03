import alt, { Vehicle } from 'alt-client';
import game from 'natives';

import { ModuleBase } from "../utils/models/baseModels/module.base.mjs";
import { distanceTo } from '../utils/math.mjs';
import browserModule from './browser.module.mjs';

export default new class VehicleModule extends ModuleBase {
  private _bones: string[];

  constructor() {
    super('VehicleModule');

    this._bones = [
      "seat_pside_f",//0
      "seat_dside_r",//1
      "seat_pside_r",//2
      "seat_dside_r1",//3
      "seat_pside_r1",//4
      "seat_dside_r2",//5
      "seat_pside_r2",//6
      "seat_dside_r3",//7
      "seat_pside_r3",//8
      "seat_dside_r4",//9
      "seat_pside_r4",//10
      "seat_dside_r5",//11
      "seat_pside_r5",//12
      "seat_dside_r6",//13
      "seat_pside_r6",//14
      "seat_dside_r7",//15
      "seat_pside_r7"//16
    ];

    alt.onServer('Client:Vehicle:Exit', this.getKickedFromVehicle.bind(this));

    alt.on('leftVehicle', this.exitVehicle.bind(this));
    alt.on('keydown', this.keydown.bind(this));
    alt.on('streamSyncedMetaChange', this.sirenSoundChange.bind(this));
    alt.on('gameEntityCreate', this.streamIn.bind(this));
    alt.on('enteredVehicle', this.onEnterVehicle.bind(this));
    alt.on('streamSyncedMetaChange', this.metaChange.bind(this));
    alt.on('spawned', this.spawn.bind(this));

    alt.setInterval(this.tick.bind(this), 15000);
  }

  private exitVehicle(vehicle: alt.Vehicle, seat: number): void {
    game.setPedConfigFlag(alt.Player.local.scriptID, 184, false);
  }

  private keydown(key: alt.KeyCode): void {
    if (key != alt.KeyCode.G || alt.Player.local.vehicle != null || browserModule.isAnyComponentActive()) return;

    const vehicle = this.getClosestVehicle();
    if (vehicle == null) return;

    const seat = this.getClosestVehicleSeat(vehicle);
    game.taskEnterVehicle(alt.Player.local.scriptID, vehicle.scriptID, -1, seat, 2, 0, '0');
    game.setPedConfigFlag(alt.Player.local.scriptID, 184, true);
  }

  private getClosestVehicle(): alt.Vehicle | null {
    let closestDistance = 5;
    let closestVehicle = null;
    for (const vehicle of alt.Vehicle.all) {
      if (vehicle.scriptID == 0) continue;

      const dist = distanceTo(alt.Player.local.pos, vehicle.pos, false);
      if (dist > closestDistance) continue;

      closestDistance = dist;
      closestVehicle = vehicle;
    }

    return closestVehicle;
  }

  private getClosestVehicleSeat(vehicle: alt.Vehicle): number {
    let closestSeat = 0;
    let closestDistance = 5;

    for(let i = 0; i < this._bones.length; i++) {
      const boneIndex = game.getEntityBoneIndexByName(vehicle.scriptID, this._bones[i]);
      const bonePos = game.getWorldPositionOfEntityBone(vehicle.scriptID, boneIndex);
      const dist = distanceTo(alt.Player.local.pos, bonePos, false);
      if(dist > closestDistance || !game.isVehicleSeatFree(vehicle.scriptID, i, false)) continue;

      closestSeat = i;
      closestDistance = dist;
    }

    return closestSeat;
  }

  private spawn(): void {
    this.applyFlags();
  }

  private getKickedFromVehicle(): void {
    if (alt.Player.local.vehicle == null) return;

    game.taskLeaveVehicle(alt.Player.local, alt.Player.local.vehicle as Vehicle, 4160);
  }

  private metaChange(entity: alt.Entity, key: string, value: any, oldValue: any): void {
    if (alt.Player.local.vehicle != entity) return;

    const vehicle = entity as alt.Vehicle;

    switch (key) {
      case 'ENGINE':
        game.setVehicleEngineOn(vehicle, value, true, true);
        break;
      case 'FUEL':
        if (value <= 0) game.setVehicleEngineOn(vehicle, false, true, true);
        break;
    }
  }

  private onEnterVehicle(vehicle: alt.Vehicle, seat: number): void {
    this.applyFlags();

    const locked = vehicle.getStreamSyncedMeta('LOCKED') as boolean;
    if (locked) {
      game.taskLeaveVehicle(alt.Player.local, vehicle, 16);
      return;
    }

    if (seat != 1) return;

    const engine = vehicle.getStreamSyncedMeta('ENGINE') as boolean;

    game.setVehicleEngineOn(vehicle, engine, true, true);
  }

  private applyFlags(): void {
    game.setPedConfigFlag(alt.Player.local, 429, true); // DISABLE AUTO START ENGINE
    game.setPedConfigFlag(alt.Player.local, 241, true); // PREVENT ENGINE STOP ON EXIT
    game.setPedConfigFlag(alt.Player.local, 32, true); // SET CAN FLY OUT OF WINDOW
    game.setPedConfigFlag(alt.Player.local, 35, false); // DISABLE USING HELMET
  }

  private tick(): void {
    const player = alt.Player.local;
    const vehicle = player.vehicle as Vehicle;
    if (vehicle == null || player.seat != 1 || !vehicle.engineOn) return;

    const engine = vehicle.getStreamSyncedMeta('ENGINE');
    if(!engine) {
      game.setVehicleEngineOn(vehicle, false, true, true);
      this.triggerServer('Server:Anticheat:VehicleEngineToggle');
    }

    const fuel = vehicle.getStreamSyncedMeta('FUEL') as number;
    if (fuel <= 0) return;
    const maxFuel = vehicle.getStreamSyncedMeta('MAX_FUEL') as number;
    const usedFuel = parseFloat((maxFuel * 0.0003 * vehicle.rpm).toFixed(2));

    this.triggerServer('Server:Vehicle:UpdateFuel', usedFuel);
  }

  private sirenSoundChange(entity: alt.Entity, key: string, value: any, oldValue: any): void {
    if (key != 'SIREN_SOUND' || entity.type != alt.BaseObjectType.Vehicle) return;

    const veh = (entity as alt.Vehicle);
    game.setVehicleHasMutedSirens(veh.scriptID, value);
  }

  private streamIn(entity: alt.Entity): void {
    if (entity.type != alt.BaseObjectType.Vehicle) return;

    const vehicle = entity as alt.Vehicle;

    if (vehicle.hasStreamSyncedMeta('SIREN_SOUND')) {
      const sirenSound = vehicle.getStreamSyncedMeta('SIREN_SOUND') as boolean;
      game.setVehicleHasMutedSirens(vehicle.scriptID, sirenSound);
    }
  }
}