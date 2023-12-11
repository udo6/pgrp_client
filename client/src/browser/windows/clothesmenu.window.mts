import { KeyCode } from "../../utils/enums/keys.mjs";
import { InteractionWindow } from "../../utils/models/baseModels/window.base.mjs";

class ClothesMenuWindow extends InteractionWindow {
  constructor() {
    super('ClothesMenu', KeyCode.KEY_M, true, false, 0, true, false, true, true);
  }
}

export default new ClothesMenuWindow();