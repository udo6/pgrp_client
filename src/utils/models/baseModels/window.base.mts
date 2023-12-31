import alt from 'alt-client';
import browserModule from '../../../modules/browser.module.mjs';
import playerModule from '../../../modules/player.module.mjs';

import { ColshapeType } from '../../enums/colshapeType.mjs';
import { KeyCode } from '../../enums/keys.mjs';
import { ScriptBase } from './script.base.mjs';
import { clearTasks } from '../../animation.handler.mjs';

export abstract class WindowBase extends ScriptBase {
  public visible: boolean;
  public readonly cursor: boolean;
  public readonly disableDefaultShow: boolean;
  public readonly toggleGameControls: boolean;

  protected constructor(name: string, cursor: boolean = true, disableDefaultShow: boolean = false, toggleGameControls: boolean = true) {
    super(name);

    this.visible = false;
    this.cursor = cursor;
    this.disableDefaultShow = disableDefaultShow;
    this.toggleGameControls = toggleGameControls;

    browserModule.registerWindow(this);
  }

  public onShow(state: boolean, data: string): void { }
}

export abstract class InteractionWindow extends WindowBase {
  private _isTimeout: boolean;
  private readonly _key: number;
  private readonly _keyMutliFunction: boolean;
  private readonly _useColShapes: boolean;
  private readonly _colShapeType: ColshapeType;
  private readonly _inVehicle: boolean;
  private readonly _cancelAnim: boolean;
  private readonly _disableESC: boolean;
  private readonly _disableShift: boolean;

  protected constructor(name: string, key: number, keyMutliFunction: boolean,  useColshapes: boolean, colshapeType: ColshapeType, cursor: boolean = true, disableDefaultShow: boolean = false, toggleGameControls: boolean = true, inVehicle: boolean = false, cancelAnim: boolean = false, disableESC: boolean = false, disableShift: boolean = false) {
    super(name, cursor, disableDefaultShow, toggleGameControls);

    this._isTimeout = false;
    this._key = key;
    this._keyMutliFunction = keyMutliFunction;
    this._useColShapes = useColshapes;
    this._colShapeType = colshapeType;
    this._inVehicle = inVehicle;
    this._cancelAnim = cancelAnim;
    this._disableESC = disableESC;
    this._disableShift = disableShift;

    alt.on('keydown', (key: number) => this.onKeyDown(key));
  }

  private onKeyDown(key: number): void {
    switch(key) {
      case this._key: {
        if(this._disableShift && alt.isKeyDown(alt.KeyCode.Shift)) return;

        if(!this.visible) this.open();
        else if(this._keyMutliFunction) this.close();
        break;
      }
      case KeyCode.ESCAPE: {
        if(this._disableESC) return;
        
        this.close();
        break;
      }
    }
  }

  protected open(): void {
    if(this.visible || this._isTimeout || browserModule.isAnyComponentActive(this.name) || !playerModule.alive || alt.Player.local.getStreamSyncedMeta('CUFFED') || alt.Player.local.getStreamSyncedMeta('ROPED') || playerModule.isFarming || (!this._inVehicle && alt.Player.local.vehicle != null) || (this._useColShapes && this._colShapeType != playerModule.colshape?.type)) return;

    this._isTimeout = true;
    this.triggerServer(`Server:${this.name}:Open`, playerModule.colshape?.id);
    alt.setTimeout(() => this._isTimeout = false, 300);
  }

  protected close(): void {
    if(!this.visible) return;

    browserModule.showComponent(this.name, false);
    if(this._cancelAnim) clearTasks();
  }
}