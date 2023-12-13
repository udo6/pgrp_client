import alt from 'alt-client';
import game from 'natives';
import { HudWindow } from '../browser/windows/hud.window.mjs';

import { ModuleBase } from "../utils/models/baseModels/module.base.mjs";
import { WindowBase } from '../utils/models/baseModels/window.base.mjs';

export default new class BrowserModule extends ModuleBase {
  private readonly _browser: alt.WebView;
  private readonly _windows: WindowBase[];

  private _tick: number | null;

  constructor() {
    super('BrowserModule');

    this._browser = new alt.WebView('http://resource/client/ui/index.html');
    this._windows = [];
    this._tick = null;

    this.on('Client:BrowserModule:ShowComponent', this.showComponent.bind(this));
    this.on('Client:BrowserModule:TriggerServerEvent', this.triggerServer.bind(this));

    alt.onServer('Client:BrowserModule:ShowComponent', this.showComponent.bind(this));
    alt.onServer('Client:BrowserModule:CallEvent', this.serverCall.bind(this));
    alt.onServer('Client:BrowserModule:Copy', this.copy.bind(this));
  }

  public on(event: string, handler: (...args: any[]) => void): void {
    this._browser.on(event, handler);
  }

  public off(event: string, handler: (...args: any[]) => void): void {
    this._browser.off(event, handler);
  }

  public call(event: string, ...args: any[]): void {
    this._browser.emit(event, ...args);
  }

  public serverCall(event: string, ...args: any[]): void {
    this.call(event, ...args[0]);
  }

  public focus(state: boolean): void {
    state ? this._browser.focus() : this._browser.unfocus();
  }

  public registerWindow(window: WindowBase): void {
    this._windows.push(window);
  }

  public isAnyComponentActive(...exclude: string[]): boolean {
    const hud = (this._windows.find(x => x.name == 'Hud') as HudWindow);

    return this._windows.find(x => x.visible && !exclude.includes(x.name)) != null ||
    !exclude.includes('Chat') && hud.chatActive ||
    !exclude.includes('Progressbar') && hud.progressbar ||
    !exclude.includes('NativeMenu') && hud.nativeMenu ||
    alt.isConsoleOpen() ||
    game.isPauseMenuActive();
  }

  public disableAllComponents(): void {
    const activeComponent = this._windows.find(x => x.visible);
    if(activeComponent != null) {
      this.showComponent(activeComponent.name, false, '');
      return;
    }
  }

  public showComponent(name: string, state: boolean, data: string = ''): void {
    const window = this._windows.find(x => x.name == name);
    if(window == null) {
      alt.log(`[Client] BrowserModule ${name} not found!`);
      return;
    }

    if(!window.disableDefaultShow) {
      window.visible = state;
      this.call('App:ShowComponent', name, state, data);
      this.focus(this.isAnyComponentActive('Progressbar'));

      if(window.cursor && (state || alt.isCursorVisible())) alt.showCursor(state);
      if(window.toggleGameControls) alt.toggleGameControls(!state);
      if(state) {
        this.disablePauseMenu();
      } else {
        this.enablePauseMenu();
      }
    }

    window.onShow(state, data);
  }

  private copy(value: string): void {
    alt.copyToClipboard(value);
  }

  public disablePauseMenu(): void {
    if(this._tick != null) return;
    this._tick = alt.everyTick(this.render.bind(this));
  }

  public enablePauseMenu(): void {
    alt.setTimeout(() => {
      if (this._tick == null) return;

      alt.clearEveryTick(this._tick)
      this._tick = null;
    }, 150);
  }

  private render(): void {
    game.disableControlAction(0, 199, true);
    game.disableControlAction(0, 200, true);
  }
}