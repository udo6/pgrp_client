import alt from 'alt-client';
import { WindowBase } from "../../utils/models/baseModels/window.base.mjs";

class LoginWindow extends WindowBase {
  constructor() {
    super('Login', true, false, true);

    alt.Utils.requestModel(1885233650).then(() => alt.Utils.requestModel(2627665880).then(async () => {
      try {
        const token = await alt.Discord.requestOAuth2Token('1191214265483411526');
        this.triggerServer('Server:Login:PlayerLoaded', token);
      } catch(e: any) {
        this.triggerServer('Server:Login:Kick', 'Du musst die Anfrage im Discord annehmen!');
      }
    }));
  }
}

export default new LoginWindow();