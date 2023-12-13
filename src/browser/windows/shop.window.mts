import { ColshapeType } from "../../utils/enums/colshapeType.mjs";
import { KeyCode } from "../../utils/enums/keys.mjs";
import { InteractionWindow } from "../../utils/models/baseModels/window.base.mjs";

class ShopWindow extends InteractionWindow {
  constructor() {
    super('Shop', KeyCode.KEY_E, false, true, ColshapeType.SHOP);
  }
}

export default new ShopWindow();