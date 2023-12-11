import alt from 'alt-client';
import browserModule from "../../modules/browser.module.mjs";
import { KeyCode } from "../../utils/enums/keys.mjs";
import { InteractionWindow } from "../../utils/models/baseModels/window.base.mjs";
import { clearTasks } from '../../utils/animation.handler.mjs';

class PhoneWindow extends InteractionWindow {
  constructor() {
    super('Phone', KeyCode.F2, true, false, 0, true, true, true, true, true, true);
  }

  public onShow(state: boolean, data: string): void {
    this.visible = state;
    browserModule.call('Hud:ShowPhone', state, data);
    browserModule.focus(state);
    alt.showCursor(state);
    alt.toggleGameControls(!state);
    if(state) {
      browserModule.disablePauseMenu();
    } else {
      browserModule.enablePauseMenu();
      clearTasks();
    }
  }
}

export default new PhoneWindow();