import alt from 'alt-client';
import browserModule from '../../modules/browser.module.mjs';
import playerModule from '../../modules/player.module.mjs';
import { KeyCode } from "../../utils/enums/keys.mjs";
import { WindowBase } from "../../utils/models/baseModels/window.base.mjs";

class NMenuWindow extends WindowBase {
  private _canOpen: boolean;

  constructor() {
    super('NMenu');

    this._canOpen = true;

    alt.on('keydown', this.keydown.bind(this));
    alt.on('keyup', this.keyup.bind(this));
  }

  private keyup(key: number): void {
    if(key != KeyCode.KEY_N) return;

    alt.setTimeout(() => {
      if(!this.visible) return;
      browserModule.showComponent('NMenu', false);
    }, 50);
  }

  private keydown(key: number): void {
    if(key != KeyCode.KEY_N || !this._canOpen || browserModule.isAnyComponentActive('NMenu') || !playerModule.alive || alt.Player.local.getStreamSyncedMeta('ROPED') || alt.Player.local.getStreamSyncedMeta('CUFFED')) return;

    this._canOpen = false;

    const {x, y} = alt.getScreenResolution();
    alt.setCursorPos({ x: x / 2, y: y / 2 });

    this.triggerServer("Server:NMenu:Open");
    alt.setTimeout(() => this._canOpen = true, 50);
  }
}

export default new NMenuWindow();