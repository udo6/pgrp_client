export class AnticheatComponent<T> {
  public active: boolean;
  public value: T;
  public flags: number;
  public maxFlags: number;
  public lastFlag: Date;

  public constructor(value: T, maxFlags: number) {
    this.active = true;
    this.value = value;
    this.flags = 0;
    this.maxFlags = maxFlags;
    this.lastFlag = new Date();
  }

  public flag(): void {
    this.flags++;
    this.lastFlag = new Date();
  }

  public unflag(): void {
    if(new Date().getTime() > this.lastFlag.getTime() + 1500 || this.flags <= 0) return;

    this.flags--;
  }

  public reset(val: T): void {
    this.value = val;
    this.flags = 0;
  }
}