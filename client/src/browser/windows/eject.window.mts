import alt from 'alt-client';
import browserModule from '../../modules/browser.module.mjs';
import { KeyCode } from "../../utils/enums/keys.mjs";
import { WindowBase } from "../../utils/models/baseModels/window.base.mjs";

class EjectWindow extends WindowBase {
  constructor() {
    super('Eject');

    alt.on('keydown', this.keydown.bind(this));
  }

  private keydown(key: number): void {
    if(!this.visible || key != KeyCode.ESCAPE) return;

    browserModule.showComponent('Eject', false);
  }
}

export default new EjectWindow();