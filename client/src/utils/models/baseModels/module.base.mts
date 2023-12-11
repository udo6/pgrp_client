import { ScriptBase } from './script.base.mjs';

export abstract class ModuleBase extends ScriptBase {
  constructor(name: string) {
    super(name);
  }
}