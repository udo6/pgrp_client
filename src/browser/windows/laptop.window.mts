import { KeyCode } from "../../utils/enums/keys.mjs";
import { InteractionWindow } from "../../utils/models/baseModels/window.base.mjs";

class LaptopWindow extends InteractionWindow {
  constructor() {
    super('Laptop', KeyCode.F4, true, false, 0, true, false, true, true, true);
  }
}

export default new LaptopWindow();