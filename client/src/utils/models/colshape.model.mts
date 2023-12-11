import { ColshapeType } from "../enums/colshapeType.mjs";

export class Colshape {
  public id: number;
  public type: ColshapeType;

  constructor(id: number, type: ColshapeType) {
    this.id = id;
    this.type = type;
  }
}