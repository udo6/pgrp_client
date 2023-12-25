import alt from 'alt-client';
import game from 'natives';
import { ModuleBase } from '../utils/models/baseModels/module.base.mjs';
import { YaCAClientModule } from '../utils/yaca.voice.mjs';
import browserModule from './browser.module.mjs';
import { clearTasks, playAnim2 } from '../utils/animation.handler.mjs';

enum TransmitState {
  OFF,
  PTT,
  ACTIVE
}

export default new class VoiceModule extends ModuleBase {
  private voice: YaCAClientModule;
  private range: number;
  private muted: boolean;
  private canTransmit: boolean;
  private radioTransmitting: boolean;
  private radioTransmitState: TransmitState;

  constructor() {
    super('VoiceModule');

    this.range = 1;
    this.muted = false;
    this.canTransmit = false;
    this.radioTransmitting = false;
    this.radioTransmitState = TransmitState.OFF;

    this.voice = YaCAClientModule.getInstance();

    alt.onServer('Client:VoiceModule:SetRadioState', this.onServerRadioStatusChange.bind(this));
  }

  private onServerRadioStatusChange(state: boolean): void {
    this.radioTransmitState = state ? TransmitState.PTT : TransmitState.OFF;
    this.radioTransmitting = false;
    this.canTransmit = state;

    this.updateHud();
  }

  public toggleRange(): void {
    this.range++;
    if(this.range > 3) this.range = 1;
    this.voice.changeVoiceRange(this.range);
    this.updateHud();
  }

  public setTransmitting(state: boolean): void {
    if(!this.canTransmit || this.radioTransmitting == state || (state && this.radioTransmitState != TransmitState.PTT)) return;
    this.triggerServer('server:yaca:radioTalkingState', state);
    this.radioTransmitting = state;
    if(state) playAnim2('random@arrests', 'generic_radio_chatter', 49);
    else clearTasks();
  }

  public toggleTransmitting(): void {
    if(!this.canTransmit || (this.radioTransmitting && this.radioTransmitState == TransmitState.PTT)) return;
    
    this.radioTransmitState++;
    if(this.radioTransmitState > 2) this.radioTransmitState = 0;

    if(this.radioTransmitState == TransmitState.OFF) {
      this.triggerServer('server:yaca:radioTalkingState', false);
      this.triggerServer('server:yaca:enableRadio', false);
      this.radioTransmitting = false;
    }

    if(this.radioTransmitState == TransmitState.PTT) {
      this.triggerServer('server:yaca:enableRadio', true);
    }

    if(this.radioTransmitState == TransmitState.ACTIVE) {
      this.triggerServer('server:yaca:radioTalkingState', true);
      this.radioTransmitting = true;
    }

    playAnim2('random@arrests', 'generic_radio_chatter', 49);
    alt.setTimeout(() => {
      clearTasks();
    }, 200);

    this.updateHud();
  }

  public onMute(state: boolean): void {
    this.muted = state;
    this.updateHud();
  }

  private updateHud(): void {
    browserModule.call('Hud:UpdateVoice', this.muted, this.range-1, this.radioTransmitState);
  }
}