import alt from "alt-client";
import game from "natives";

import { ModuleBase } from "../utils/models/baseModels/module.base.mjs";

export default new class GardenerJobModule extends ModuleBase {
  private jobStarted: boolean;
  private jobCounter: number;
  private jobInterval: number;

  constructor() {
    super("GardenerJobModule")

    this.jobStarted = false;
    this.jobCounter = 0;

    alt.onServer("Client:GardenerJob:StartJob", this.startJob.bind(this));
    alt.onServer("Client:GardenerJob:StopJob", this.stopJob.bind(this));
  }

  private startJob(): void {
    if (this.jobStarted) return;

    this.jobStarted = true;
    this.jobInterval = setInterval(() => {
      const player = alt.Player.local;
      if (!player.vehicle) return;

      const vehicle = player.vehicle;
      if (vehicle.model !== game.getHashKey("mower")) return;

      const surface = vehicle.getWheelSurfaceMaterial(0);
      if (surface != 46 && surface != 47 && surface != 48) return;

      this.jobCounter += 1;
    }, 1000 * 5);
  }

  private stopJob(): void {
    if (!this.jobStarted) return;
    if (this.jobInterval != 0) clearInterval(this.jobInterval);

    alt.emitServer("Server:GardenerJob:StopJob", this.jobCounter);

    this.jobStarted = false;
    this.jobCounter = 0;
  }
}