import { KeyCode } from "../../utils/enums/keys.mjs";
import { InteractionWindow } from "../../utils/models/baseModels/window.base.mjs";

class MMenuWindow extends InteractionWindow {
  constructor() {
    super('MMenu', KeyCode.KEY_M, true, false, 0, true, false, true, true);
  }
}

export default new MMenuWindow();