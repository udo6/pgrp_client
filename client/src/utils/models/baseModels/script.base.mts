import alt from 'alt-client';

export abstract class ScriptBase {
  public readonly calls: Array<number>;
  public readonly name: string;

  protected constructor(name: string) {
    this.name = name;
    this.calls = [];

    alt.log(`[Client] Script ${name} loaded!`);
  }

  protected triggerServer(event: string, ...args: any[]): void {
    alt.emitServer(event, ...args);
    alt.logDebug(`[Client] Server event triggered (${event}, ${args})`);
  }
}