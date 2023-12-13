import { KeyCode } from "../../utils/enums/keys.mjs";
import { InteractionWindow } from "../../utils/models/baseModels/window.base.mjs";
import { ColshapeType } from '../../utils/enums/colshapeType.mjs';

class BankWindow extends InteractionWindow {
  constructor() {
    super('Bank', KeyCode.KEY_E, false, true, ColshapeType.BANK);
  }
}

export default new BankWindow();