export interface Marker {
  Id: number;
  Type: number;
  PosX: number;
  PosY: number;
  PosZ: number;
  DirX: number;
  DirY: number;
  DirZ: number;
  RotX: number;
  RotY: number;
  RotZ: number;
  ScaleX: number;
  ScaleY: number;
  ScaleZ: number;
  ColorR: number;
  ColorG: number;
  ColorB: number;
  Alpha: number;
  DrawRange: number;
  BobUpDown: boolean;
  FaceCamera: boolean;
  Rotate: boolean;
  Dimension: number;
}