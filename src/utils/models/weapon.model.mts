export class WeaponModel {
  public hash: number;
  public ammo: number;
  public components: number[];

  constructor(hash: number, ammo: number, components: number[]) {
    this.hash = hash;
    this.ammo = ammo;
    this.components = components;
  }
}