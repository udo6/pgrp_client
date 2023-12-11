import { KeyCode } from "../../utils/enums/keys.mjs";
import { ColshapeType } from "../../utils/enums/colshapeType.mjs";
import { InteractionWindow } from "../../utils/models/baseModels/window.base.mjs";

class FFAWindow extends InteractionWindow {
    constructor(){
        super('FFA', KeyCode.KEY_E, false, true, ColshapeType.FFA);
    }
}

export default new FFAWindow(); 