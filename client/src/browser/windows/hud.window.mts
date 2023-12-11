import alt from 'alt-client';
import game from 'natives';
import browserModule from '../../modules/browser.module.mjs';
import { KeyCode } from '../../utils/enums/keys.mjs';

import { WindowBase } from "../../utils/models/baseModels/window.base.mjs";

export class HudWindow extends WindowBase {
  public chatActive: boolean;
  public progressbar: boolean;
  public nativeMenu: boolean;

  public notifyMute: boolean;

  private _vehicleHudInterval: number;

  constructor() {
    super('Hud', false, true, false);

    this.chatActive = false;
    this.progressbar = false;
    this.nativeMenu = false;

    const notifyMute = alt.LocalStorage.get('NotificationsMuted');
    this.notifyMute = notifyMute == null ? false : notifyMute;

    this._vehicleHudInterval = -1;

    alt.onServer('Client:Hud:Phone:SetData', this.setPhoneSettings.bind(this));
    browserModule.on('Client:Hud:Phone:UpdateNotifyMute', this.updateNotifyMute.bind(this));

    browserModule.on('Client:Hud:Chat:Toggle', this.toggleChat.bind(this));
    browserModule.on('Client:Hud:SetProgressbarState', this.setProgressbar.bind(this));
    browserModule.on('Client:Hud:CloseNativeMenu', () => this.showNativeMenu(false, ''));
    browserModule.on('Client:Hud:PushNotification', this.pushNotification.bind(this));

    alt.onServer('Client:Hud:SetProgressbarState', this.setProgressbar.bind(this));
    alt.onServer('Client:Hud:PushNotification', this.pushNotification.bind(this));
    alt.onServer('Client:Hud:ShowNativeMenu', this.showNativeMenu.bind(this));

    alt.on('keydown', this.onKeyDown.bind(this));
    alt.on('enteredVehicle', this.enterVehicle.bind(this));
    alt.on('leftVehicle', this.exitVehicle.bind(this));
    alt.on('streamSyncedMetaChange', this.metaChange.bind(this));

    game.displayRadar(false);
    game.displayAreaName(false);
  }

  private setPhoneSettings(): void {
    browserModule.call('Phone:Settings:SetData', this.notifyMute);
  }

  private updateNotifyMute(state: boolean): void {
    this.notifyMute = state;
    alt.LocalStorage.set('NotificationsMuted', state);
  }

  private vehicleTick(): void {
    const player = alt.Player.local;
    const veh = player.vehicle as alt.Vehicle;
    if (veh == null) {
      alt.clearEveryTick(this._vehicleHudInterval);
      browserModule.call('Hud:ShowVehicle', false);
      return;
    }

    const rpm = veh.engineOn ? veh.rpm * 100 : 0;
    const speed = Math.floor(game.getEntitySpeed(veh) * 3.6);

    browserModule.call('Hud:Vehicle:Update', speed, rpm);
  }

  private metaChange(entity: alt.Entity, key: string, value: any, oldValue: any): void {
    if (alt.Player.local.vehicle != entity) return;

    const vehicle = entity as alt.Vehicle;

    if (key == 'ENGINE' || key == 'LOCKED' || key == 'FUEL' || key == 'MAX_FUEL') {
      const engine = vehicle.getStreamSyncedMeta('ENGINE');
      const locked = vehicle.getStreamSyncedMeta('LOCKED');
      const fuel = vehicle.getStreamSyncedMeta('FUEL');
      const maxFuel = vehicle.getStreamSyncedMeta('MAX_FUEL');

      browserModule.call('Hud:SetVehicleData', engine, locked, fuel, maxFuel);
    }
  }

  private enterVehicle(vehicle: alt.Vehicle, seat: number): void {
    const engine = vehicle.getStreamSyncedMeta('ENGINE');
    const locked = vehicle.getStreamSyncedMeta('LOCKED');
    const fuel = vehicle.getStreamSyncedMeta('FUEL');
    const maxFuel = vehicle.getStreamSyncedMeta('MAX_FUEL');

    browserModule.call('Hud:ShowVehicle', true, engine, locked, fuel, maxFuel);
    this._vehicleHudInterval = alt.everyTick(this.vehicleTick.bind(this));
  }

  private exitVehicle(vehicle: alt.Vehicle, seat: number): void {
    alt.clearEveryTick(this._vehicleHudInterval);
    browserModule.call('Hud:ShowVehicle', false);
  }

  private onKeyDown(key: number): void {
    if (browserModule.isAnyComponentActive('Death', 'Chat', 'NativeMenu')) return;

    switch (key) {
      case KeyCode.KEY_T:
        if (!this.chatActive) this.toggleChat();
        break;
      case KeyCode.ESCAPE:
        if (this.chatActive) this.toggleChat();
        if (this.nativeMenu) this.showNativeMenu(false, '')
        break;
    }
  }

  private toggleChat(): void {
    this.chatActive = !this.chatActive;
    browserModule.call('Hud:ShowChat', this.chatActive);
    browserModule.focus(this.chatActive);
    alt.showCursor(this.chatActive);
    alt.toggleGameControls(!this.chatActive);
    if(this.chatActive) browserModule.disablePauseMenu();
    else browserModule.enablePauseMenu();
  }

  private setProgressbar(state: boolean, duration: number = 0): void {
    this.progressbar = state;
    browserModule.call('Hud:ShowProgress', state, duration);
  }

  private pushNotification(data: string): void {
    if(!this.notifyMute){
      game.playSoundFrontend(1, 'ATM_WINDOW', 'HUD_FRONTEND_DEFAULT_SOUNDSET', true);
    }
    
    browserModule.call('Hud:PushNotification', data);
  }

  private showNativeMenu(state: boolean, data: string): void {
    this.nativeMenu = state;
    browserModule.call('Hud:ShowNative', state, data);
    browserModule.focus(state);
    if(state) browserModule.disablePauseMenu();
    else browserModule.enablePauseMenu();
  }

  public setVoiceData(micRange: number, micMute: number, radio: number): void {
    browserModule.call('Hud:SetVoice', micRange, micMute, radio);
  }

  public onShow(state: boolean, data: string): void {
    game.displayRadar(state);
    browserModule.call('Hud:ShowVoice', state, false, 0, 0);
  }
}



export default new HudWindow();