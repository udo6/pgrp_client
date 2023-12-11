import alt, { Vehicle } from 'alt-client';
import game from 'natives';

import { ModuleBase } from "../utils/models/baseModels/module.base.mjs";

export default new class VehicleModule extends ModuleBase {
  constructor() {
    super('VehicleModule');

    alt.onServer('Client:Vehicle:Exit', this.getKickedFromVehicle.bind(this));

    alt.on('streamSyncedMetaChange', this.sirenSoundChange.bind(this));
    alt.on('gameEntityCreate', this.streamIn.bind(this));
    alt.on('enteredVehicle', this.enterVehicle.bind(this));
    alt.on('streamSyncedMetaChange', this.metaChange.bind(this));
    alt.on('spawned', this.spawn.bind(this));

    alt.setInterval(this.tick.bind(this), 15000);
  }

  private spawn(): void {
    this.applyFlags();
  }

  private getKickedFromVehicle(): void {
    if(alt.Player.local.vehicle == null) return;

    game.taskLeaveVehicle(alt.Player.local, alt.Player.local.vehicle as Vehicle, 4160);
  }

  private metaChange(entity: alt.Entity, key: string, value: any, oldValue: any): void {
    if (alt.Player.local.vehicle != entity) return;

    const vehicle = entity as alt.Vehicle;

    switch(key) {
      case 'ENGINE':
        game.setVehicleEngineOn(vehicle, value, true, true);
        break;
      case 'FUEL':
        if(value <= 0) game.setVehicleEngineOn(vehicle, false, true, true);
        break;
    }
  }

  private enterVehicle(vehicle: alt.Vehicle, seat: number): void {
    this.applyFlags();

    const locked = vehicle.getStreamSyncedMeta('LOCKED') as boolean;
    if(locked) {
      game.taskLeaveVehicle(alt.Player.local, vehicle, 16);
      return;
    }

    if(seat != 1) return;

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
    if(vehicle == null || player.seat != 1 || !vehicle.engineOn) return;

    const fuel = vehicle.getStreamSyncedMeta('FUEL') as number;
    if(fuel <= 0) return;
    const maxFuel = vehicle.getStreamSyncedMeta('MAX_FUEL') as number;
    const usedFuel = parseFloat((maxFuel * 0.015 * vehicle.rpm).toFixed(2));

    this.triggerServer('Server:Vehicle:UpdateFuel', usedFuel);
  }

  private sirenSoundChange(entity: alt.Entity, key: string, value: any, oldValue: any): void {
    if(key != 'SIREN_SOUND' || entity.type != alt.BaseObjectType.Vehicle) return;

    const veh = (entity as alt.Vehicle);
    game.setVehicleHasMutedSirens(veh.scriptID, value);
  }

  private streamIn(entity: alt.Entity): void {
    if(entity.type != alt.BaseObjectType.Vehicle) return;

    const vehicle = entity as alt.Vehicle;

    if(vehicle.hasStreamSyncedMeta('SIREN_SOUND')) {
      const sirenSound = vehicle.getStreamSyncedMeta('SIREN_SOUND') as boolean;
      game.setVehicleHasMutedSirens(vehicle.scriptID, sirenSound);
    }
  }
}