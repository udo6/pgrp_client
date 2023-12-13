import alt from 'alt-client';

export interface Object {
  Id: number;
  Hash: number;
  PosX: number;
  PosY: number;
  PosZ: number;
  RotX: number;
  RotY: number;
  RotZ: number;
  Network: boolean;
  Dynamic: boolean;
  GameObject: alt.Object | null;
  Dimension: number;
}