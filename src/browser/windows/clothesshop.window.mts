import { ColshapeType } from "../../utils/enums/colshapeType.mjs";
import { KeyCode } from "../../utils/enums/keys.mjs";
import { InteractionWindow } from "../../utils/models/baseModels/window.base.mjs";
import alt from 'alt-client';
import game from 'natives';

class ClothesShopWindow extends InteractionWindow {
  private _camera: number;

  constructor() {
    super('ClothesShop', KeyCode.KEY_E, false, true, ColshapeType.CLOTHES_SHOP);

    this._camera = -1;
  }

  public onShow(state: boolean, data: string): void {
    if (state) {
      const pos = alt.Player.local.pos;
      const fwdVector = game.getEntityForwardVector(alt.Player.local);
      const range = 2;
      const fwd = new alt.Vector3(pos.x + fwdVector.x * range, pos.y + fwdVector.y * range, pos.z + fwdVector.z + 0.5);
      this._camera = game.createCamWithParams('DEFAULT_SCRIPTED_CAMERA', fwd.x, fwd.y, fwd.z, 0, 0, 0, 85, true, 2);
      game.pointCamAtCoord(this._camera, pos.x, pos.y, pos.z);
      game.setCamActive(this._camera, true);
      game.renderScriptCams(true, false, 0, true, false, 0);
    } else {
      this.triggerServer('Server:ClothesShop:ResetClothes');
    }

    game.renderScriptCams(state, false, 0, true, false, 0);
    game.freezeEntityPosition(alt.Player.local, state);
  }
}

export default new ClothesShopWindow();