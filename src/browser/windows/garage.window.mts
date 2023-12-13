import { ColshapeType } from "../../utils/enums/colshapeType.mjs";
import { KeyCode } from "../../utils/enums/keys.mjs";
import { InteractionWindow } from "../../utils/models/baseModels/window.base.mjs";

class GarageWindow extends InteractionWindow {
  constructor() {
    super('Garage', KeyCode.KEY_E, false, true, ColshapeType.GARAGE);
  }
}

export default new GarageWindow();