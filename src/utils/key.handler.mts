import alt from 'alt-client';
import game from 'natives';
import adminModule from '../modules/admin.module.mjs';
import browserModule from '../modules/browser.module.mjs';
import playerModule from '../modules/player.module.mjs';
import { KeyCode } from './enums/keys.mjs';

import { ScriptBase } from "./models/baseModels/script.base.mjs";
import { clearTasks, playAnim } from './animation.handler.mjs';
import voiceModule from '../modules/voice.module.mjs';

type interaction = [KeyCode, string, string, boolean];

class KeyHandler extends ScriptBase {
  private _activeInteractions: object;
  private _interactions: interaction[];

  constructor() {
    super('KeyHandler');

    this._activeInteractions = {};
    this._interactions = [
      [KeyCode.KEY_E, 'INTERACTION', 'Server:Player:StopInteraction', false],
      [KeyCode.KEY_E, 'JUMPPOINT', 'Server:JumpPoint:Enter', false],
      [KeyCode.KEY_E, 'WAREHOUSE', 'Server:Warehouse:Open', false],
      [KeyCode.KEY_E, 'WAREHOUSE_UPGRADE', 'Server:Warehouse:Upgrader', false],
      [KeyCode.KEY_E, 'PROCESSOR', 'Server:Processor:Open', false],
      [KeyCode.KEY_E, 'TEAM', 'Server:Team:Interact', false],
      [KeyCode.KEY_E, 'GANGWAR', 'Server:Gangwar:Interact', false],
      [KeyCode.KEY_E, 'GANGWARSPAWN', 'Server:Gangwar:OpenMenu', false],
      [KeyCode.KEY_E, 'LABORATORY', 'Server:Team:ToggleLaboratory', false],
      [KeyCode.KEY_E, 'DEALER', 'Server:Dealer:Open', false],
      [KeyCode.KEY_E, 'FARMING', 'Server:Farming:Start', false],
      [KeyCode.KEY_E, 'VEHICLE_SHOP', 'Server:VehicleShop:Open', false],
      [KeyCode.KEY_E, 'SWAT_SHOP', 'Server:SWAT:OpenShop', false],
      [KeyCode.KEY_E, 'HOUSE', 'Server:House:Open', false],
      [KeyCode.KEY_E, 'WARDROBE', 'Server:Wardrobe:Open', false],
      [KeyCode.KEY_E, 'TRAINING', 'Server:TrainingStation:Start', false],
      [KeyCode.KEY_E, 'POST_JOB_POST_RETURN', 'Server:PostJob:Return', false],
      [KeyCode.KEY_E, 'POST_JOB_POST_JOIN', 'Server:PostJob:Open', false],
      [KeyCode.KEY_E, 'MONEY_TRANSPORT_JOB_JOIN', 'Server:MoneyTransportJob:Open', false],
      [KeyCode.KEY_E, 'MONEY_TRANSPORT_JOB_RETURN', 'Server:MoneyTransportJob:Return', false],
      [KeyCode.KEY_E, 'LIFEINVADER', 'Server:Lifeinvader:Open', false],
      [KeyCode.KEY_E, 'PIZZA_JOB_JOIN', 'Server:PizzaDeliveryJob:Open', false],
      [KeyCode.KEY_E, 'PIZZA_JOB_RETURN', 'Server:PizzaDeliveryJob:Return', false],
      [KeyCode.KEY_E, 'EXPORT_DEALER', 'Server:ExportDealer:Open', false],
      [KeyCode.KEY_E, 'IMPOUND', 'Server:Impound:Open', false],
      [KeyCode.KEY_E, 'FFA', 'Server:FFA:Open', false],
      [KeyCode.KEY_E, 'LOOTDROP', 'Server:Lootdrop:Pickup', false],
      [KeyCode.KEY_E, 'DEALER', 'Server:Dealer:Open', false],
      [KeyCode.KEY_E, 'DMV', 'Server:DMV:Open', false],
      [KeyCode.KEY_E, 'SOCIAL_BONUS', 'Server:SocialBonus:Open', false],
      [KeyCode.KEY_E, 'TUNER', 'Server:Tuner:Open', true],
      [KeyCode.KEY_E, 'LSPD_TELEPORTER', 'Server:Police:OpenTeleporter', false],
      [KeyCode.KEY_E, 'CREATOR', 'Server:Creator:Enter', false],

      [KeyCode.KEY_L, 'JUMPPOINT', 'Server:JumpPoint:Lock', false],
      [KeyCode.KEY_L, 'HOUSE', 'Server:House:Lock', false],
      [KeyCode.KEY_L, 'DOOR_LOCK', 'Server:Door:Lock', false],

      // JOBS
      [KeyCode.KEY_E, 'GARBAGE_JOB_START', 'Server:GarbageJob:Open', false],
      [KeyCode.KEY_E, 'GARBAGE_JOB_RETURN', 'Server:GarbageJob:Return', false],
      [KeyCode.KEY_E, 'MONEY_TRUCK_JOB_START', 'Server:MoneyTruckJob:Open', false],
      [KeyCode.KEY_E, 'MONEY_TRUCK_JOB_PICKUP', 'Server:MoneyTruckJob:Pickup', false],
      [KeyCode.KEY_E, 'GARDENER_JOB_START', 'Server:GardenerJob:Open', false],
    ];

    alt.onServer('Client:KeyHandler:SetInteraction', this.setInteraction.bind(this));
    alt.on('keydown', (key: number) => this.onKeyDown(key));
    alt.on('keyup', (key: number) => this.onKeyUp(key));
  }

  private setInteraction(key: string, interaction: string): void {
    this._activeInteractions[key] = interaction;
  }

  private onKeyDown(key: number): void {
    if (!playerModule.alive || alt.Player.local.getStreamSyncedMeta('ROPED') || alt.Player.local.getStreamSyncedMeta('CUFFED')) return;

    switch (key) {
      case KeyCode.PERIOD:
        if (browserModule.isAnyComponentActive() || playerModule.isFarming || alt.Player.local.isInRagdoll) return;

        this.triggerServer('Server:Inventory:QuickUse', 2);
        break;
      case KeyCode.COMMA:
        if (browserModule.isAnyComponentActive() || playerModule.isFarming || alt.Player.local.isInRagdoll) return;

        this.triggerServer('Server:Inventory:QuickUse', 1);
        break;
      case KeyCode.KEY_E:
        if (browserModule.isAnyComponentActive('Progressbar') || alt.Player.local.isInRagdoll) return;

        if (playerModule.isFarming) {
          this.triggerServer('Server:Farming:Stop');
          return;
        }

        const eInteractions = this._interactions.filter(x => x[0] == KeyCode.KEY_E);
        const eInteraction = eInteractions.find(x => x[1] == this._activeInteractions['KEY_E']);
        if (eInteraction == null || (!eInteraction[3] && alt.Player.local.vehicle != null)) break;

        this.triggerServer(eInteraction[2]);
        break;
      case KeyCode.KEY_L:
        if (browserModule.isAnyComponentActive() || playerModule.isFarming || alt.Player.local.isInRagdoll) return;

        const lInteractions = this._interactions.filter(x => x[0] == KeyCode.KEY_L);
        const lInteraction = lInteractions.find(x => x[1] == this._activeInteractions['KEY_L']);
        if (lInteraction != null) {
          this.triggerServer(lInteraction[2]);
          break;
        }

        const lockPossible1 = (alt.Player.local.vehicle != null || alt.Vehicle.all.find(x => x.pos.distanceToSquared(alt.Player.local.pos) < 7) != null);
        if (lockPossible1) this.triggerServer('Server:Vehicle:Lock');
        break;
      case KeyCode.KEY_K:
        if (browserModule.isAnyComponentActive() || playerModule.isFarming || alt.Player.local.isInRagdoll) return;

        const lockPossible2 = (alt.Player.local.vehicle != null || alt.Vehicle.all.find(x => x.pos.distanceToSquared(alt.Player.local.pos) < 7) != null);
        if (lockPossible2) this.triggerServer('Server:Vehicle:LockTrunk');
        break;
      case KeyCode.F10:
        alt.showCursor(!alt.isCursorVisible());
        browserModule.focus(alt.isCursorVisible());
        break;
      case KeyCode.KEY_J:
        if (browserModule.isAnyComponentActive() || alt.Player.local.vehicle == null || alt.Player.local.seat != 1 || !game.isVehicleSirenOn((alt.Player.local.vehicle as alt.Vehicle).scriptID)) return;
        this.triggerServer('Server:Vehicle:ToggleSirenState');
        break;
      case KeyCode.F6:
        if (browserModule.isAnyComponentActive() || playerModule.isFarming) return;
        this.triggerServer('Server:Admin:ToggleDuty');
        break;
      case KeyCode.F7:
        if(playerModule.isFarming) return;
        adminModule.noclip.toggle();
        break;
      case KeyCode.KEY_H:
        if (browserModule.isAnyComponentActive() || !playerModule.alive || playerModule.isFarming || alt.Player.local.vehicle != null || alt.Player.local.isInRagdoll) return;
        if (game.isEntityPlayingAnim(alt.Player.local, "missfbi5ig_21", "hand_up_scientist", 49)) clearTasks();
        else playAnim(16);
        break;
      case KeyCode.F5:
        if (browserModule.isAnyComponentActive() || !playerModule.alive || playerModule.isFarming || alt.Player.local.vehicle != null || alt.Player.local.isInRagdoll) return;
        this.triggerServer("Server:Animation:Open");
        break;
      case KeyCode.KEY_Y:
        if (browserModule.isAnyComponentActive() || !playerModule.alive) return;
        voiceModule.toggleRange();
        break;
      case KeyCode.DOWN_ARROW:
        if (browserModule.isAnyComponentActive() || !playerModule.alive || playerModule.isFarming) return;
        voiceModule.setTransmitting(true);
        break;
      case KeyCode.UP_ARROW:
        if (browserModule.isAnyComponentActive() || !playerModule.alive || playerModule.isFarming) return;
        voiceModule.toggleTransmitting();
        break;
      case KeyCode.KEY_M:
        if(!alt.isKeyDown(alt.KeyCode.Shift) || browserModule.isAnyComponentActive() || playerModule.isFarming) return;

        this.triggerServer('Server:MMenu:QuickMask');
        break;
    }
  }

  private onKeyUp(key: KeyCode): void {
    switch(key) {
      case KeyCode.DOWN_ARROW:
        if (browserModule.isAnyComponentActive() || !playerModule.alive) return;
        voiceModule.setTransmitting(false);
        break;
    }
  }
}

export default new KeyHandler();