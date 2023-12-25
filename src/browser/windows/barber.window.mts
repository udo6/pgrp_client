import alt from 'alt-client';
import game from 'natives';
import { KeyCode } from "../../utils/enums/keys.mjs";
import { InteractionWindow } from "../../utils/models/baseModels/window.base.mjs";
import { ColshapeType } from '../../utils/enums/colshapeType.mjs';
import browserModule from '../../modules/browser.module.mjs';

class BarberWindow extends InteractionWindow {
  private _camera: number;

  constructor() {
    super('Barber', KeyCode.KEY_E, false, true, ColshapeType.BARBER);

    this._camera = 0;
    browserModule.on('Client:Barber:Try', this.try.bind(this));
  }

  private try(style: string, color: string, highlightColor: string, beardStyle: string, beardColor: string): void {
    game.setPedComponentVariation(alt.Player.local, 2, parseInt(style), 0, 2);
    game.setPedHairTint(alt.Player.local, parseInt(color), parseInt(highlightColor));
    game.setPedHeadOverlay(alt.Player.local, 1, parseInt(beardStyle), 1);
    game.setPedHeadOverlayTint(alt.Player.local, 1, 1, parseInt(beardColor), parseInt(beardColor));
  }

  public onShow(state: boolean, data: string): void {
    if (state) {
      const pos = alt.Player.local.pos;
      const fwdVector = game.getEntityForwardVector(alt.Player.local);
      const range = 0.8;
      const fwd = new alt.Vector3(pos.x + fwdVector.x * range, pos.y + fwdVector.y * range, pos.z + fwdVector.z + 0.7);
      this._camera = game.createCamWithParams('DEFAULT_SCRIPTED_CAMERA', fwd.x, fwd.y, fwd.z, 0, 0, 0, 85, true, 2);
      game.pointCamAtCoord(this._camera, pos.x, pos.y, pos.z + 0.5);
      game.setCamActive(this._camera, true);
      game.renderScriptCams(true, false, 0, true, false, 0);
    } else {
      this.triggerServer('Server:Barber:Reset');
    }

    game.renderScriptCams(state, false, 0, true, false, 0);
    game.freezeEntityPosition(alt.Player.local, state);
  }
}

export default new BarberWindow();