import alt from 'alt-client';
import game from 'natives';
import { WindowBase } from "../../utils/models/baseModels/window.base.mjs";

class LoginWindow extends WindowBase {
  private _camera: number | null;

  constructor() {
    super('Login', true, false, true);

    this._camera = null;

    alt.Utils.requestModel(1885233650).then(() => alt.Utils.requestModel(2627665880).then(async () => {
      try {
        const token = await alt.Discord.requestOAuth2Token('1191214265483411526');
        this.triggerServer('Server:Login:PlayerLoaded', token);
      } catch(e: any) {
        this.triggerServer('Server:Login:Kick', 'Du musst die Anfrage im Discord annehmen!');
      }
    }));
  }

  public onShow(state: boolean, data: string): void {
    if(state) {
      this._camera = game.createCamWithParams('DEFAULT_SCRIPTED_CAMERA', -468.90988, -803.3011, 171.77881, 0, 0, 0, 75, true, 2);
      game.pointCamAtCoord(this._camera, -369.69232, -483.3362, 182.78174);
      game.setCamActive(this._camera, true);

      game.triggerScreenblurFadeIn(100);
    } else {
      game.setCamActive(this._camera, false);
      this._camera = null;

      game.triggerScreenblurFadeOut(100);
    }

    game.renderScriptCams(state, false, 0, true, false, 0);
  }
}

export default new LoginWindow();