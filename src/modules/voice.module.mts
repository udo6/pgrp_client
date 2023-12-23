import alt from 'alt-client';
import game from 'natives';
import { ModuleBase } from '../utils/models/baseModels/module.base.mjs';
import { YaCAClientModule } from '../utils/yaca.voice.mjs';

export default new class VoiceModule extends ModuleBase {
  private voice: YaCAClientModule;

  constructor() {
    super('VoiceModule');

    this.voice = YaCAClientModule.getInstance();
  }
}