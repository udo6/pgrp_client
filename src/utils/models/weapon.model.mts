export class WeaponModel {
  public Hash: number;
  public Ammo: number;
  public Components: number[];

  constructor(hash: number, ammo: number, components: number[]) {
    this.Hash = hash;
    this.Ammo = ammo;
    this.Components = components;
  }
}