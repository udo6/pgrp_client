import { WindowBase } from "../../utils/models/baseModels/window.base.mjs";

class DeathWindow extends WindowBase {
  constructor() {
    super('Death', false, false, false);
  }
}

export default new DeathWindow();