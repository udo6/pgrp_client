import alt from 'alt-client';
import game from 'natives';
import playerModule from '../modules/player.module.mjs';
import { Marker } from '../utils/interfaces/marker.mjs';
import { ScriptBase } from "../utils/models/baseModels/script.base.mjs";
import { distanceTo2 } from '../utils/math.mjs';

export default new class MarkerStreamer extends ScriptBase {
  private _markers: Marker[];

  constructor() {
    super('MarkerStreamer');

    this._markers = [];

    alt.onServer('Client:MarkerStreamer:AddMarker', this.addMarker.bind(this));
    alt.onServer('Client:MarkerStreamer:RemoveMarker', this.removeMarker.bind(this));
    alt.onServer('Client:MarkerStreamer:RemoveMarkers', this.removeMarkers.bind(this));
    alt.onServer('Client:MarkerStreamer:SetMarkers', this.setMarkers.bind(this));
    alt.everyTick(this.render.bind(this));
  }

  private addMarker(json: string): void {
    this._markers.push(JSON.parse(json));
  }

  private removeMarker(id: number): void {
    const index = this._markers.findIndex(x => x.Id == id);
    if(index == -1) return;

    this._markers.splice(index, 1);
  }

  private removeMarkers(json: string): void {
    const ids = JSON.parse(json);

    this._markers.forEach((x, i) => {
      if(ids.find(e => x.Id == e) == null) return;

      this._markers.splice(i, 1);
    });
  }

  private setMarkers(json: string): void {
    this._markers.push(...JSON.parse(json));
  }

  private render(): void {
    const p = alt.Player.local.pos;
    this._markers.forEach((x: Marker, i: number): void => {
      if(x.Dimension != playerModule.dimension || (x.DrawRange > 0 && distanceTo2(p.x, p.y, p.z, x.PosX, x.PosY, x.PosZ) > x.DrawRange)) return;
      
      game.drawMarker(
        x.Type,
        x.PosX,
        x.PosY,
        x.PosZ,
        x.DirX,
        x.DirY,
        x.DirZ,
        x.RotX,
        x.RotY,
        x.RotZ,
        x.ScaleX,
        x.ScaleY,
        x.ScaleZ,
        x.ColorR,
        x.ColorG,
        x.ColorB,
        x.Alpha,
        x.BobUpDown,
        x.FaceCamera,
        2,
        x.Rotate,
        undefined,
        undefined,
        false
      );
    });
  }
}