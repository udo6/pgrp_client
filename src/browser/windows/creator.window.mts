import alt from 'alt-client';
import game from 'natives';
import browserModule from '../../modules/browser.module.mjs';
import { WindowBase } from "../../utils/models/baseModels/window.base.mjs";

class CreatorWindow extends WindowBase {
  private _camera: number | null;
  private _lastData: any | null;
  private _ped: number;

  constructor() {
    super('Creator');

    this._camera = null;
    this._lastData = null;
    this._ped = 0;

    browserModule.on('Client:Creator:Rotate', this.rotate.bind(this));
    browserModule.on('Client:Creator:SetGender', this.changeGender.bind(this));
    browserModule.on('Client:Creator:Update', this.update2.bind(this));

    alt.onServer('Client:Creator:SetCustomization', this.update2.bind(this));
  }

  private async changeGender(gender: number): Promise<void> {
    game.deletePed(this._ped);
    let modelHash = gender == 1 ? 1885233650 : 2627665880;
    this._ped = game.createPed(26, modelHash, 402.8664, -996.4108, -100, 0, false, true);
    game.freezeEntityPosition(this._ped, true);
    game.setEntityHeading(this._ped, 180);
    game.taskSetBlockingOfNonTemporaryEvents(this._ped, true);

    this.update(this._lastData!);
  }

  private rotate(mod: number): void {
    game.setEntityHeading(alt.Player.local.scriptID, alt.Player.local.rot.z + ((mod * 3) * -1));
  }

  private update2(json: string, player: boolean = false): void {
    this.update(JSON.parse(json), player);
  }

  private update(data: any, player: boolean = false): void {
    const ped = (player ? alt.Player.local.scriptID : this._ped);

    this._lastData = data;

    game.setPedHeadBlendData(ped, parseFloat(data.Mother), parseFloat(data.Father), 0, parseFloat(data.Mother), parseInt(data.Father), 0, parseFloat(data.ShapeSimilarity), parseFloat(data.SkinSimilarity), 0, true);
    game.setPedComponentVariation(ped, 2, parseFloat(data.Hair), 0, 2);
    game.setPedHairTint(ped, parseFloat(data.HairColor), parseFloat(data.HairColor2));
    game.setPedHeadOverlay(ped, 1, parseFloat(data.Beard), parseFloat(data.BeardOpacity));
    game.setPedHeadOverlayTint(ped, 1, 1, parseFloat(data.BeardColor), parseFloat(data.BeardColor));

    game.setPedHeadOverlay(ped, 2, parseFloat(data.Eyebrow), 1);
    game.setPedHeadOverlayTint(ped, 2, 1, parseInt(data.EyebrowColor), parseInt(data.EyebrowColor));

    game.setHeadBlendEyeColor(ped, parseFloat(data.EyeColor));

    game.setPedMicroMorph(ped, 0, parseFloat(data.NoseWidth));
    game.setPedMicroMorph(ped, 1, parseFloat(data.NosePeak));
    game.setPedMicroMorph(ped, 2, parseFloat(data.NoseLength));
    game.setPedMicroMorph(ped, 3, parseFloat(data.NoseBridge));
    game.setPedMicroMorph(ped, 4, parseFloat(data.NoseHeight));
    game.setPedMicroMorph(ped, 5, parseFloat(data.NoseMovement));
    game.setPedMicroMorph(ped, 12, parseFloat(data.LipWidth));
    game.setPedMicroMorph(ped, 19, parseFloat(data.NeckWidth));

    game.setPedHeadOverlay(ped, 3, parseFloat(data.Age), 1);

    game.setPedHeadOverlay(ped, 4, parseFloat(data.MakeUp), parseFloat(data.MakeupOpacity));
    game.setPedHeadOverlayTint(ped, 4, 2, parseFloat(data.MakeupColor), parseFloat(data.MakeupColor));

    game.setPedHeadOverlay(ped, 5, parseFloat(data.Blush), parseFloat(data.BlushOpacity));
    game.setPedHeadOverlayTint(ped, 5, 2, parseFloat(data.BlushColor), parseFloat(data.BlushColor));

    game.setPedHeadOverlay(ped, 8, parseFloat(data.Lipstick), parseFloat(data.LipstickOpacity));
    game.setPedHeadOverlayTint(ped, 8, 2, parseFloat(data.LipstickColor), parseFloat(data.LipstickColor));
  }

  public onShow(state: boolean, data: string): void {
    if (state) {
      this._lastData = JSON.parse(data);
      this._camera = game.createCamWithParams('DEFAULT_SCRIPTED_CAMERA', 402.8664, -997.5515, -98.5, 0, 0, 0, 75, true, 2);
      game.pointCamAtCoord(this._camera, 402.8664, -996.4108, -98.5);
      game.setCamActive(this._camera, true);
      this.changeGender(parseInt(this._lastData!.Gender));
    } else {
      game.deletePed(this._ped);
      this._camera = null;
    }

    game.renderScriptCams(state, false, 0, true, false, 0);
    game.freezeEntityPosition(alt.Player.local.scriptID, state);
  }
}

export default new CreatorWindow();