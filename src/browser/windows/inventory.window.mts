import { KeyCode } from "../../utils/enums/keys.mjs";
import { InteractionWindow } from "../../utils/models/baseModels/window.base.mjs";

class InventoryWindow extends InteractionWindow {
  constructor() {
    super('Inventory', KeyCode.KEY_I, true, false, 0, true, false, true, true);
  }
}

export default new InventoryWindow();