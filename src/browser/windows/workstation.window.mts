import { ColshapeType } from "../../utils/enums/colshapeType.mjs";
import { KeyCode } from "../../utils/enums/keys.mjs";
import { InteractionWindow } from "../../utils/models/baseModels/window.base.mjs";

class WorkstationWindow extends InteractionWindow {
  constructor() {
    super('Workstation', KeyCode.KEY_E, false, true, ColshapeType.WORKSTATION);
  }
}

export default new WorkstationWindow();