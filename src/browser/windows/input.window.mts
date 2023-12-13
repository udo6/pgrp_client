import alt from 'alt-client';
import browserModule from "../../modules/browser.module.mjs";
import { KeyCode } from "../../utils/enums/keys.mjs";
import { WindowBase } from "../../utils/models/baseModels/window.base.mjs";

class InputWindow extends WindowBase {
  constructor() {
    super('Input');

    alt.on('keydown', this.keydown.bind(this));
  }

  private keydown(key: number): void {
    if(!this.visible || key != KeyCode.ESCAPE) return;

    browserModule.showComponent('Input', false);
  }
}

export default new InputWindow();