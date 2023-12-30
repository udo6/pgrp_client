import alt from 'alt-client';

export abstract class ScriptBase {
  public readonly calls: Array<number>;
  public readonly name: string;

  protected constructor(name: string) {
    this.name = name;
    this.calls = [];
  }

  protected triggerServer(event: string, ...args: any[]): void {
    alt.emitServer(event, ...args);
  }
}