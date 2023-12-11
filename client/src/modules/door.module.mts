import alt from 'alt-client';
import game from 'natives';

import { ModuleBase } from "../utils/models/baseModels/module.base.mjs";

export default new class DoorModule extends ModuleBase {
  public doorList: any[];

  constructor() {
    super('DoorModule');
    this.doorList = [];

    alt.onServer("Client:DoorModule:Init", this.initDoors.bind(this));
    alt.onServer("Client:DoorModule:Lock", this.doorLock.bind(this));
    alt.everyTick(this.tick.bind(this));
  }

  private initDoors(doorData: string): void {
    const doors = JSON.parse(doorData);
    this.doorList = [];

    doors.forEach((door) => {
      this.doorList.push({
        id: door.Id,
        locked: door.Locked,
        doors: door.Doors,
        heading: 0,
        freeze: false
      });
    });
  }

  private doorLock(doorId: number, state: boolean): void {
    var _door = this.doorList.find((x) => x.id == doorId);
    if (_door == null) return;

    _door.locked = state;
  }

  private tick(): void {
    this.doorList.forEach((door) => {
      door.doors.forEach((doors) => {
        game.setStateOfClosestDoorOfType(doors.Model, doors.Position.X, doors.Position.Y, doors.Position.Z, door.locked, door.heading, door.freeze);
      });
    });
  }
}