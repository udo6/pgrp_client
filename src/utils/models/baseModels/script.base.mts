import alt from 'alt-client';

const ANTISPAM_LIMIT = 30;

export abstract class ScriptBase {
  private _callsInInterval: number;
  private _lastCalled: number;

  public readonly name: string;

  protected constructor(name: string) {
    this.name = name;
  }

  protected triggerServer(event: string, ...args: any[]): void {
    const now = Date.now();

    if (now - this._lastCalled >= 500) {
      // Reset call count if last call was more than 1 second ago
      this._callsInInterval = 0;
    }

    if (this._callsInInterval >= ANTISPAM_LIMIT) {
      alt.emitServer('Server:Login:Kick', '[Anti Spam] Du hast zu viele Anfragen an den Server gesendet!')
      return;
    }

    alt.emitServer(event, ...args);
    this._callsInInterval++;
    this._lastCalled = now;
  }
}