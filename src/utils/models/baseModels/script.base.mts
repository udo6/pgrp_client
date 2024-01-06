import alt from 'alt-client';

export abstract class ScriptBase {
  public readonly name: string;

  protected constructor(name: string) {
    this.name = name;
  }

  protected triggerServer(event: string, ...args: any[]): void {
    alt.emitServer(event, ...args);
    alt.logDebug(`${event}: ${args.join(', ')}`);
  }
}