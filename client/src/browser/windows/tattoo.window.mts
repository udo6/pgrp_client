import alt from 'alt-client';
import game from 'natives';
import { KeyCode } from "../../utils/enums/keys.mjs";
import { InteractionWindow } from "../../utils/models/baseModels/window.base.mjs";
import { ColshapeType } from '../../utils/enums/colshapeType.mjs';
import browserModule from '../../modules/browser.module.mjs';

class TattooWindow extends InteractionWindow {
  private _camera: number;

  constructor() {
    super('Tattoo', KeyCode.KEY_E, false, true, ColshapeType.TATTOO_SHOP);

    this._camera = 0;

    browserModule.on('Client:Tattoo:Rotate', this.rotate.bind(this));
  }

  private rotate(val: number): void {
    game.setEntityRotation(alt.Player.local, 0, 0, val, 1, true);
  }

  public onShow(state: boolean, data: string): void {
    if (state) {
      const pos = alt.Player.local.pos;
      const fwdVector = game.getEntityForwardVector(alt.Player.local);
      const range = 1.7;
      const fwd = new alt.Vector3(pos.x + fwdVector.x * range, pos.y + fwdVector.y * range, pos.z + fwdVector.z + 0.5);
      this._camera = game.createCamWithParams('DEFAULT_SCRIPTED_CAMERA', fwd.x, fwd.y, fwd.z, 0, 0, 0, 85, true, 2);
      game.pointCamAtCoord(this._camera, pos.x, pos.y, pos.z);
      game.setCamActive(this._camera, true);
      game.renderScriptCams(true, false, 0, true, false, 0);
    } else {
      this.triggerServer('Server:Tattoo:Reset');
    }

    game.renderScriptCams(state, false, 0, true, false, 0);
    game.freezeEntityPosition(alt.Player.local, state);
  }
}

export default new TattooWindow();