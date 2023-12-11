import { ColshapeType } from "../../utils/enums/colshapeType.mjs";
import { KeyCode } from "../../utils/enums/keys.mjs";
import { InteractionWindow } from "../../utils/models/baseModels/window.base.mjs";

class TeamWindow extends InteractionWindow {
  constructor() {
    super('Team', KeyCode.KEY_E, false, true, ColshapeType.TEAM);
  }
}

export default new TeamWindow();