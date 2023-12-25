import * as alt from 'alt-client';
import * as natives from 'natives';
import voiceModule from '../modules/voice.module.mjs';

declare module "alt-client" {
  export interface LocalPlayer {
    yacaPluginLocal: {
      canChangeVoiceRange: boolean;
      maxVoiceRange: number;

      lastMegaphoneState: boolean;
      canUseMegaphone: boolean;
    }
  }

  export interface Player {
    yacaPlugin: {
      clientId: string,
      forceMuted: boolean,
      range: number,
      phoneCallMemberIds?: number[],
      isTalking: boolean
    },
    isOnPhone: boolean
  }
}

const YacaFilterEnum = {
  "RADIO": "RADIO",
  "MEGAPHONE": "MEGAPHONE",
  "PHONE": "PHONE",
  "PHONE_SPEAKER": "PHONE_SPEAKER",
  "INTERCOM": "INTERCOM",
  "PHONE_HISTORICAL": "PHONE_HISTORICAL",
};

const YacaStereoMode = {
  "MONO_LEFT": "MONO_LEFT",
  "MONO_RIGHT": "MONO_RIGHT",
  "STEREO": "STEREO",
};

const YacaBuildType = {
  "RELEASE": 0,
  "DEVELOP": 1
};

const CommDeviceMode = {
  SENDER: 0,
  RECEIVER: 1,
  TRANSCEIVER: 2,
};

/**
 * @typedef {Object} YacaResponse
 * @property {"RENAME_CLIENT" | "MOVE_CLIENT" | "MUTE_STATE" | "TALK_STATE" | "OK" | "WRONG_TS_SERVER" | "NOT_CONNECTED" | "MOVE_ERROR" | "OUTDATED_VERSION" | "WAIT_GAME_INIT"} code - The response code.
 * @property {string} requestType - The type of the request.
 * @property {string} message - The response message.
 */

const settings = {
  // Max Radio Channels
  maxRadioChannels: 9, // needs to be sync with serverside setting

  // Max phone speaker range
  maxPhoneSpeakerRange: 5,
}

const lipsyncAnims = {
  true: {
    name: "mic_chatter",
    dict: "mp_facial"
  },
  false: {
    name: "mood_normal_1",
    dict: "facials@gen_male@variations@normal"
  }
}

const defaultRadioChannelSettings = {
  volume: 1,
  stereo: YacaStereoMode.STEREO,
  muted: false,
  frequency: 0,
}

// Values are in meters
const voiceRangesEnum = {
  1: 2,
  2: 6,
  3: 12
}

const translations = {
  "plugin_not_activated": "Please activate your voiceplugin!",
  "connect_error": "Error while connecting to voiceserver, please reconnect!",
  "plugin_not_initializiaed": "Plugin not initialized!",

  // Error message which comes from the plugin
  "OUTDATED_VERSION": "You dont use the required plugin version!",
  "WRONG_TS_SERVER": "You are on the wrong teamspeakserver!",
  "NOT_CONNECTED": "You are on the wrong teamspeakserver!",
  "MOVE_ERROR": "Error while moving into ingame teamspeak channel!",
  "WAIT_GAME_INIT": ""
}

export class YaCAClientModule {
  static instance = null;

  localPlayer = alt.Player.local;
  rangeInterval = null;
  monitorInterval = null;
  websocket = null;
  noPluginActivated = 0;
  messageDisplayed = false;
  visualVoiceRangeTimeout = null;
  visualVoiceRangeTick = null;
  uirange = 2;
  lastuiRange = 2;
  isTalking = false;
  firstConnect = true;
  isPlayerMuted = false;

  radioFrequenceSetted = false;
  radioToggle = false;
  radioEnabled = false;
  radioTalking = false;
  radioChannelSettings = {};
  radioInited = false;
  activeRadioChannel = 1;
  playersWithShortRange = new Map();
  playersInRadioChannel = new Map();

  useWhisper = false;

  //webview = WebView.getInstance();

  mhinTimeout = null;
  mhintTick = null;
  /**
   * Displays a hint message.
   *
   * @param {string} head - The heading of the hint.
   * @param {string} msg - The message to be displayed.
   * @param {number} [time=0] - The duration for which the hint should be displayed. If not provided, defaults to 0.
   */
  mhint(head, msg, time = 0) {
    const scaleform = natives.requestScaleformMovie("MIDSIZED_MESSAGE");

    this.mhinTimeout = alt.setTimeout(() => {
      this.mhinTimeout = null;

      if (!natives.hasScaleformMovieLoaded(scaleform)) {
        this.mhint(head, msg, time);
        return;
      }

      natives.beginScaleformMovieMethod(scaleform, "SHOW_MIDSIZED_MESSAGE");
      natives.beginTextCommandScaleformString("STRING");
      natives.scaleformMovieMethodAddParamPlayerNameString(head);
      natives.scaleformMovieMethodAddParamTextureNameString(msg);
      natives.scaleformMovieMethodAddParamInt(100);
      natives.scaleformMovieMethodAddParamBool(true);
      natives.scaleformMovieMethodAddParamInt(100);
      natives.endScaleformMovieMethod();

      this.mhintTick = new alt.Utils.EveryTick(() => {
        natives.drawScaleformMovieFullscreen(scaleform, 255, 255, 255, 255, 0);
      });

      if (time != 0) {
        alt.setTimeout(() => {
          this.mhintTick?.destroy();
        }, time * 1000);
      }
    }, natives.hasScaleformMovieLoaded(scaleform) ? 0 : 1000);
  }

  stopMhint() {
    if (this.mhinTimeout) alt.clearTimeout(this.mhinTimeout);
    this.mhinTimeout = null;
    this.mhintTick?.destroy();
  }

  /**
   * Clamps a value between a minimum and maximum value.
   *
   * @param {number} value - The value to be clamped.
   * @param {number} [min=0] - The minimum value. Defaults to 0 if not provided.
   * @param {number} [max=1] - The maximum value. Defaults to 1 if not provided.
   */
  clamp(value, min = 0, max = 1) {
    return Math.max(min, Math.min(max, value))
  }

  /**
   * Sends a radar notification.
   *
   * @param {string} message - The message to be sent in the notification.
   */
  radarNotification(message) {
    /*
    ~g~ --> green
    ~w~ --> white
    ~r~ --> white
    */

    natives.beginTextCommandThefeedPost("STRING");
    natives.addTextComponentSubstringPlayerName(message);
    natives.endTextCommandThefeedPostTicker(false, false);
  }

  constructor() {
    this.localPlayer.yacaPluginLocal = {
      canChangeVoiceRange: true,
      maxVoiceRange: 4,
      lastMegaphoneState: false,
      canUseMegaphone: false,
    };

    alt.onServer("client:yaca:init", (dataJson) => {
      const dataObj = JSON.parse(dataJson);
      if (this.rangeInterval) {
        alt.clearInterval(this.rangeInterval);
        this.rangeInterval = null;
      }

      if (!this.websocket) {
        this.websocket = new alt.WebSocketClient('ws://127.0.0.1:30125');
        this.websocket.on('message', msg => {
          this.handleResponse(msg);
        });

        this.websocket.on('error', reason => alt.logError('[YACA-Websocket] Error: ', reason));
        this.websocket.on('close', (code, reason) => alt.logError('[YACA-Websocket]: client disconnected', code, reason));
        this.websocket.on('open', () => {
          if (this.firstConnect) {
            this.initRequest(dataObj);
            this.firstConnect = false;
          } else {
            alt.emitServer("server:yaca:wsReady", this.firstConnect);
          }

          alt.log('[YACA-Websocket]: connected');
        });

        this.websocket.perMessageDeflate = true;
        this.websocket.autoReconnect = true;
        this.websocket.start();

        // Monitoring if player is in ingame voice channel
        this.monitorInterval = alt.setInterval(this.monitorConnectstate.bind(this), 1000);
      }

      if (this.firstConnect) return;

      this.initRequest(dataObj);
    });

    alt.onServer("client:yaca:addPlayers", (dataJson) => {
      let dataObjects = JSON.parse(dataJson);
      if (!Array.isArray(dataObjects)) dataObjects = [dataObjects];

      for (const dataObj of dataObjects) {
        if (!dataObj || typeof dataObj.range == "undefined" || typeof dataObj.clientId == "undefined" || typeof dataObj.playerId == "undefined") continue;

        const player = alt.Player.getByRemoteID(dataObj.playerId);
        if (!player?.valid) continue;

        player.yacaPlugin = {
          clientId: dataObj.clientId,
          forceMuted: dataObj.forceMuted,
          range: dataObj.range,
          isTalking: false,
          phoneCallMemberIds: player.yacaPlugin?.phoneCallMemberIds || undefined,
        }
      }
    });

    /**
     * Handles the "client:yaca:muteTarget" server event.
     *
     * @param {number} target - The target to be muted.
     * @param {boolean} muted - The mute status.
     */
    alt.onServer("client:yaca:muteTarget", (target, muted) => {
      const player = alt.Player.getByRemoteID(target)
      if (player?.valid && player.yacaPlugin) player.yacaPlugin.forceMuted = muted;
    });

    /**
     * Handles the "client:yaca:changeVoiceRange" server event.
     *
     * @param {number} target - The target whose voice range is to be changed.
     * @param {number} range - The new voice range.
     */
    alt.onServer("client:yaca:changeVoiceRange", (target, range) => {
      // if (target == this.localPlayer.remoteID && !this.isPlayerMuted) {
      //   this.webview.emit('webview:hud:voiceDistance', range);
      // }

      const player = alt.Player.getByRemoteID(target);
      if (player?.valid && player.yacaPlugin) player.yacaPlugin.range = range;
    });

    /**
     * Handles the "client:yaca:setMaxVoiceRange" server event.
     *
     * @param {number} maxRange - The maximum voice range to be set.
     */
    alt.onServer("client:yaca:setMaxVoiceRange", (maxRange) => {
      this.localPlayer.yacaPluginLocal.maxVoiceRange = maxRange;

      if (maxRange == 15) {
        this.uirange = 4;
        this.lastuiRange = 4;
      }
    });

    alt.onServer("client:yaca:setRadioEnabled", (state) => {
      this.radioEnabled = state;

      if (!state) {
        this.disableRadioFromPlayerInChannel(1);
      }

      if (state && !this.radioInited) {
        this.radioInited = true;
        this.initRadioSettings();
        this.updateRadioInWebview(this.activeRadioChannel);
      }
    });

    alt.onServer("client:yaca:setRadioFreq", (frequency) => {
      this.setRadioFrequency(1, frequency);
    });

    alt.onServer("client:yaca:radioTalking", (target, frequency, state, self = false) => {
      const player = alt.Player.getByRemoteID(target);
      if (!player?.valid) return;

      const yacaSettings = player.yacaPlugin;
      if (!yacaSettings) return;

      const channel = this.findRadioChannelByFrequency(frequency);
      if (!channel) return;

      // YaCAClientModule.setPlayersCommType(player, YacaFilterEnum.RADIO, state, channel, undefined, CommDeviceMode.RECEIVER, CommDeviceMode.SENDER);

      state ? this.playersInRadioChannel.get(channel)?.add(player.remoteID) : this.playersInRadioChannel.get(channel)?.delete(player.remoteID);

      if (!state) {
        this.playersWithShortRange.delete(player.remoteID)
      }
    });

    alt.onServer("client:yaca:setRadioMuteState", (state) => {
      this.radioChannelSettings[1].muted = state;
      this.updateRadioInWebview(1);
      this.disableRadioFromPlayerInChannel(1);
    });

    alt.onServer("client:yaca:leaveRadioChannel", (client_ids) => {
      if (!Array.isArray(client_ids)) client_ids = [client_ids];

      if (client_ids.includes(this.localPlayer.yacaPlugin.clientId)) this.setRadioFrequency(1, 0);

      // this.sendWebsocket({
      //   base: { "request_type": "INGAME" },
      //   comm_device_left: {
      //     comm_type: YacaFilterEnum.RADIO,
      //     client_ids: client_ids,
      //     channel: 1
      //   }
      // });
    });

    /* =========== PHONE SYSTEM =========== */
    /**
     * Handles the "client:yaca:phone" server event.
     *
     * @param {number} targetID - The ID of the target.
     * @param {boolean} state - The state of the phone.
     */
    alt.onServer("client:yaca:phone", (targetID, state) => {
      const target = alt.Player.getByRemoteID(targetID);
      if (!target?.valid) return;

      //YaCAClientModule.setPlayersCommType(target, YacaFilterEnum.PHONE, state, undefined, undefined, CommDeviceMode.TRANSCEIVER, CommDeviceMode.TRANSCEIVER);

      target.isOnPhone = state;
    });

    /* =========== alt:V Events =========== */
    // alt.on("syncedMetaChange", (entity, key, newValue, oldValue) => {
    //   if (!entity?.valid || !(entity instanceof alt.Player)) return;

    //   if (key == "yaca:isMutedOnPhone" && entity.isOnPhone) {
    //     if (newValue) {
    //       YaCAClientModule.setPlayersCommType(entity, YacaFilterEnum.PHONE, false);
    //     } else {
    //       YaCAClientModule.setPlayersCommType(entity, YacaFilterEnum.PHONE, true);
    //     }
    //     return;
    //   }
    // });

    alt.on("streamSyncedMetaChange", (entity, key, newValue, oldValue) => {
      if (!entity?.valid || !(entity instanceof alt.Player) || !entity.isSpawned) return;

      // Handle megaphone on meta-change
      // if (key === "yaca:megaphoneactive") {
      //   YaCAClientModule.setPlayersCommType(
      //     entity,
      //     YacaFilterEnum.MEGAPHONE,
      //     typeof newValue !== "undefined",
      //     undefined,
      //     newValue,
      //     entity.id === this.localPlayer.id ? CommDeviceMode.SENDER : CommDeviceMode.RECEIVER,
      //     entity.id === this.localPlayer.id ? CommDeviceMode.RECEIVER : CommDeviceMode.SENDER);
      //   return;
      // }

      // if (key == "yaca:phoneSpeaker") {
      //   if (typeof newValue == "undefined") {
      //     this.removePhoneSpeakerFromEntity(entity);
      //     delete entity.yacaPlugin.phoneCallMemberIds;
      //   } else {
      //     if (oldValue && newValue) this.removePhoneSpeakerFromEntity(entity);
      //     this.setPlayerVariable(entity, "phoneCallMemberIds", Array.isArray(newValue) ? newValue : [newValue]);
      //   }
      //   return;
      // }

      if (key == "yaca:lipsync") {
        this.syncLipsPlayer(entity, !!newValue);
        return;
      }
    });

    alt.on("gameEntityCreate", (entity) => {
      if (!entity?.valid || !(entity instanceof alt.Player)) return;

      const entityID = entity.remoteID;

      // Handle megaphone on stream-in
      // if (entity?.valid && entity.hasStreamSyncedMeta("yaca:megaphoneactive")) {
      //   YaCAClientModule.setPlayersCommType(
      //     entity,
      //     YacaFilterEnum.MEGAPHONE,
      //     true,
      //     undefined,
      //     entity.getStreamSyncedMeta("yaca:megaphoneactive"),
      //     CommDeviceMode.RECEIVER,
      //     CommDeviceMode.SENDER
      //   );
      // }

      // // Handle phonecallspeaker on stream-in
      // if (entity?.valid && entity.hasStreamSyncedMeta("yaca:phoneSpeaker")) {
      //   const value = entity.getStreamSyncedMeta("yaca:phoneSpeaker");

      //   this.setPlayerVariable(entity, "phoneCallMemberIds", Array.isArray(value) ? value : [value]);
      // }

      // // Handle shortrange radio on stream-in
      // if (this.playersWithShortRange.has(entityID)) {
      //   const channel = this.findRadioChannelByFrequency(this.playersWithShortRange.get(entityID));
      //   if (channel) {
      //     YaCAClientModule.setPlayersCommType(entity, YacaFilterEnum.RADIO, true, channel);
      //   }
      // }

      if (entity?.valid) {
        this.syncLipsPlayer(entity, !!entity.getStreamSyncedMeta("yaca:lipsync"));
      }
    });

    alt.on("gameEntityDestroy", (entity) => {
      if (!entity?.valid || !(entity instanceof alt.Player)) return;

      const entityID = entity.remoteID;

      // Handle phonecallspeaker on stream-out
      // if (entity.yacaPlugin?.phoneCallMemberIds) {
      //   this.removePhoneSpeakerFromEntity(entity);
      //   delete entity.yacaPlugin.phoneCallMemberIds;
      // }

      // // Handle megaphone on stream-out
      // if (entity?.hasStreamSyncedMeta("yaca:megaphoneactive")) {
      //   YaCAClientModule.setPlayersCommType(entity, YacaFilterEnum.MEGAPHONE, false, undefined, undefined, CommDeviceMode.RECEIVER, CommDeviceMode.SENDER);
      // }

      // // Handle shortrange radio on stream-out
      // if (this.playersWithShortRange.has(entityID)) {
      //   YaCAClientModule.setPlayersCommType(entity, YacaFilterEnum.RADIO, false);
      // }
    });

    /*NKeyhandler.registerKeybind(107, "yaca:changeVoiceRangeAdd", "Mirkofon-Reichweite +", () => { this.changeVoiceRange(1) });
    NKeyhandler.registerKeybind(109, "yaca:changeVoiceRangeRemove", "Mirkofon-Reichweite -", () => { this.changeVoiceRange(-1) });

    NKeyhandler.registerKeybind(80, "yaca:radioUI", "Funkgerät öffnen/schließen", () => { this.openRadio() });
    NKeyhandler.registerKeybind(220, "yaca:radioTalking", "Funk Sprechen", () => { this.radioTalkingStart(true) });
    NKeyhandler.registerKeybind(220, "yaca:radioTalking", null, () => { this.radioTalkingStart(false) }, { onKeyDown: false });

    NKeyhandler.registerKeybind(96, "yaca:megaphone", "Megaphone", () => { this.useMegaphone(true) })
    NKeyhandler.registerKeybind(96, "yaca:megaphone", null, () => { this.useMegaphone(false) }, { onKeyDown: false })*/

    alt.log('[Client] YaCA Client loaded');
  }

  /***
   * Gets the singleton of YaCAClientModule
   * 
   * @returns {YaCAClientModule}
   */
  static getInstance() {
    if (!this.instance) {
      this.instance = new YaCAClientModule();
    }

    return this.instance;
  }

  /* ======================== Helper Functions ======================== */

  initRequest(dataObj) {
    if (!dataObj || !dataObj.suid || typeof dataObj.chid != "number"
      || !dataObj.deChid || !dataObj.ingameName || !dataObj.channelPassword
    ) return this.radarNotification(translations.connect_error)

    this.sendWebsocket({
      base: { "request_type": "INIT" },
      server_guid: dataObj.suid,
      ingame_name: dataObj.ingameName,
      ingame_channel: dataObj.chid,
      default_channel: dataObj.deChid,
      ingame_channel_password: dataObj.channelPassword,
      excluded_channels: [9801, 9802, 9804], // Channel ID's where users can be in while being ingame
      /**
       * default are 2 meters
       * if the value is set to -1, the player voice range is taken
       * if the value is >= 0, you can set the max muffling range before it gets completely cut off
       */
      muffling_range: 2,
      build_type: YacaBuildType.RELEASE, // 0 = Release, 1 = Debug,
      unmute_delay: 400,
      operation_mode: dataObj.useWhisper ? 1 : 0,
    });

    this.useWhisper = dataObj.useWhisper;
  }

  isPluginInitialized() {
    const inited = !!alt.Player.local.yacaPlugin;

    if (!inited) this.radarNotification(translations.plugin_not_initializiaed);

    return inited;
  }

  /**
   * Sends a message to the voice plugin via websocket.
   *
   * @param {Object} msg - The message to be sent.
   */
  sendWebsocket(msg) {
    if (!this.websocket) return alt.logError("[Voice-Websocket]: No websocket created");

    if (this.websocket.readyState == 1) this.websocket.send(JSON.stringify(msg));
  }

  /**
   * Handles messages from the voice plugin.
   *
   * @param {YacaResponse} payload - The response from the voice plugin.
   */
  handleResponse(payload) {
    if (!payload) return;

    try {
      // @ts-ignore
      payload = JSON.parse(payload);
    } catch (e) {
      alt.logError("[YaCA-Websocket]: Error while parsing message: ", e);
      return;
    }

    if (payload.code === "OK") {
      if (payload.requestType === "JOIN") {
        alt.emitServer("server:yaca:addPlayer", parseInt(payload.message));

        if (this.rangeInterval) {
          alt.clearInterval(this.rangeInterval);
          this.rangeInterval = null;
        }

        this.rangeInterval = alt.setInterval(this.calcPlayers.bind(this), 250);

        // Set radio settings on reconnect only, else on first opening
        if (this.radioInited) this.initRadioSettings();
        return;
      }

      return;
    }

    if (payload.code === "TALK_STATE" || payload.code === "MUTE_STATE") {
      this.handleTalkState(payload);
      return;
    }

    const message = translations[payload.code] ?? "Unknown error!";
    if (!translations[payload.code]) alt.log(`[YaCA-Websocket]: Unknown error code: ${payload.code}`);
    if (message.length < 1) return;

    natives.beginTextCommandThefeedPost("STRING");
    natives.addTextComponentSubstringPlayerName(`Voice: ${message}`);
    natives.thefeedSetBackgroundColorForNextPost(6);
    natives.endTextCommandThefeedPostTicker(false, false);
  }

  /**
   * Synchronizes the lip movement of a player based on whether they are talking or not.
   *
   * @param {alt.Player} player - The player whose lips are to be synchronized.
   * @param {boolean} isTalking - Indicates whether the player is talking.
   */
  syncLipsPlayer(player, isTalking) {
    const animationData = lipsyncAnims[isTalking];
    natives.playFacialAnim(player, animationData.name, animationData.dict);

    if (player.yacaPlugin) player.yacaPlugin.isTalking = isTalking;
  }

  /**
   * Convert camera rotation to direction vector.
   */
  getCamDirection() {
    const rotVector = natives.getGameplayCamRot(0);
    const num = rotVector.z * 0.0174532924;
    const num2 = rotVector.x * 0.0174532924;
    const num3 = Math.abs(Math.cos(num2));

    return new alt.Vector3(
      -Math.sin(num) * num3,
      Math.cos(num) * num3,
      natives.getEntityForwardVector(this.localPlayer).z
    );
  }

  /**
   * Sets a variable for a player.
   *
   * @param {alt.Player} player - The player for whom the variable is to be set.
   * @param {string} variable - The name of the variable.
   * @param {*} value - The value to be set for the variable.
   */
  setPlayerVariable(player, variable, value) {
    if (!player?.valid) return;

    if (!player.yacaPlugin) player.yacaPlugin = {};
    player.yacaPlugin[variable] = value;
  }

  /**
   * Changes the voice range.
   *
   * @param {number} toggle - The new voice range.
   */
  changeVoiceRange(newRange) {
    if (!this.localPlayer.yacaPluginLocal.canChangeVoiceRange) return false;

    if (this.visualVoiceRangeTimeout) {
      alt.clearTimeout(this.visualVoiceRangeTimeout);
      this.visualVoiceRangeTimeout = null;
    }

    if (this.visualVoiceRangeTick) {
      alt.clearEveryTick(this.visualVoiceRangeTick);
      this.visualVoiceRangeTick = null;
    }

    this.uirange = newRange;
    this.lastuiRange = newRange;

    const voiceRange = voiceRangesEnum[this.uirange];

    this.visualVoiceRangeTimeout = alt.setTimeout(() => {
      if (this.visualVoiceRangeTick) {
        alt.clearEveryTick(this.visualVoiceRangeTick);
        this.visualVoiceRangeTick = null;
      }

      this.visualVoiceRangeTimeout = null;
    }, 1000),

      this.visualVoiceRangeTick = alt.everyTick(() => {
        let pos = this.localPlayer.pos;
        natives.drawMarker(1, pos.x, pos.y, pos.z - 0.98, 0, 0, 0, 0, 0, 0, (voiceRange * 2) - 1, (voiceRange * 2) - 1, 1, 0, 255, 0, 50, false, true, 2, true, null, null, false);
      });

    alt.emitServer("server:yaca:changeVoiceRange", voiceRange);

    return true;
  };

  /**
   * Checks if the communication type is valid.
   *
   * @param {string} type - The type of communication to be validated.
   * @returns {boolean} Returns true if the type is valid, false otherwise.
   */
  isCommTypeValid(type) {
    const valid = YacaFilterEnum[type];
    if (!valid) alt.logError(`[YaCA-Websocket]: Invalid commtype: ${type}`);

    return !!valid;
  }

  /**
   * Set the communication type for the given players.
   *
   * @param {alt.Player | alt.Player[]} players - The player or players for whom the communication type is to be set.
   * @param {string} type - The type of communication.
   * @param {boolean} state - The state of the communication.
   * @param {number} [channel] - The channel for the communication. Optional.
   * @param {number} [range] - The range for the communication. Optional.
   */
  static setPlayersCommType(players, type, state, channel = null, range = null, ownMode = null, otherPlayersMode = null) {
    if (!Array.isArray(players)) players = [players];

    let cids = [{
      client_id: alt.Player.local.yacaPlugin.clientId,
      mode: ownMode
    }];
    for (const player of players) {
      if (!player?.valid || !player.yacaPlugin) continue;

      cids.push({
        client_id: player.yacaPlugin.clientId,
        mode: otherPlayersMode
      });
    }

    const protocol = {
      on: !!state,
      comm_type: type,
      members: cids
    }

    // @ts-ignore
    if (typeof channel !== "undefined") protocol.channel = channel;
    // @ts-ignore
    if (typeof range !== "undefined") protocol.range = range;

    YaCAClientModule.getInstance().sendWebsocket({
      base: { "request_type": "INGAME" },
      comm_device: protocol
    });
  }

  /**
   * Update the volume for a specific communication type.
   *
   * @param {string} type - The type of communication.
   * @param {number} volume - The volume to be set.
   * @param {number} channel - The channel for the communication.
   */
  setCommDeviceVolume(type, volume, channel) {
    if (!this.isCommTypeValid(type)) return;

    const protocol = {
      comm_type: type,
      volume: this.clamp(volume, 0, 1)
    }

    // @ts-ignore
    if (typeof channel !== "undefined") protocol.channel = channel;

    this.sendWebsocket({
      base: { "request_type": "INGAME" },
      comm_device_settings: protocol
    })
  }

  /**
   * Update the stereo mode for a specific communication type.
   *
   * @param {YacaFilterEnum} type - The type of communication.
   * @param {YacaStereoMode} mode - The stereo mode to be set.
   * @param {number} channel - The channel for the communication.
   */
  setCommDeviceStereomode(type, mode, channel) {
    if (!this.isCommTypeValid(type)) return;

    const protocol = {
      comm_type: type,
      output_mode: mode
    }

    // @ts-ignore
    if (typeof channel !== "undefined") protocol.channel = channel;

    this.sendWebsocket({
      base: { "request_type": "INGAME" },
      comm_device_settings: protocol
    })
  }

  /* ======================== BASIC SYSTEM ======================== */

  /**
   * Monitoring if player is connected to teamspeak.
   */
  monitorConnectstate() {
    if (this.websocket?.readyState == 0 || this.websocket?.readyState == 1) {
      if (this.messageDisplayed && this.websocket.readyState == 1) {
        this.stopMhint();
        this.messageDisplayed = false;
        this.noPluginActivated = 0;
      }
      return;
    }

    this.noPluginActivated++;

    if (!this.messageDisplayed) {
      this.mhint("Voiceplugin", translations.plugin_not_activated);
      this.messageDisplayed = true;
    }

    if (this.noPluginActivated >= 120) alt.emitServer("server:yaca:noVoicePlugin")
  }

  /**
   * Handles the talk and mute state from teamspeak, displays it in UI and syncs lip to other players.
   *
   * @param {YacaResponse} payload - The response from teamspeak.
   */
  handleTalkState(payload) {
    // Update state if player is muted or not
    if (payload.code === "MUTE_STATE") {
      this.isPlayerMuted = !!parseInt(payload.message);
      voiceModule.onMute(this.isPlayerMuted);
    }

    const isTalking = !this.isPlayerMuted && !!parseInt(payload.message);
    if (this.isTalking != isTalking) {
      this.isTalking = isTalking;

      alt.emitServer("server:yaca:lipsync", isTalking)
    }
  }

  /**
   * Calculate the players in streamingrange and send them to the voiceplugin.
   */
  calcPlayers() {
    const players = [];
    const allPlayers = alt.Player.streamedIn;
    const localPos = this.localPlayer.pos;
    const localRadioChannel = alt.Player.local.getStreamSyncedMeta('RADIO_CHANNEL');
    const callPartner = alt.Player.local.getStreamSyncedMeta('CALL_PARTNER');

    for (const player of allPlayers) {
      if (!player?.valid || player.remoteID == this.localPlayer.remoteID) continue;

      const voiceSetting = player.yacaPlugin;
      if (!voiceSetting?.clientId) continue;

      // workaround to disable radio effect
      const targetRadioChannel = player.getStreamSyncedMeta('RADIO_CHANNEL');
      const pos = ((this.radioEnabled && localRadioChannel == targetRadioChannel) || (callPartner == player.remoteID)) ? localPos : player.pos;

      players.push({
        client_id: voiceSetting.clientId,
        position: pos,
        direction: natives.getEntityForwardVector(player),
        range: voiceSetting.range,
        is_underwater: natives.isPedSwimmingUnderWater(player),
        muffle_intensity: 0,
        is_muted: voiceSetting.forceMuted
      });

      // Phone speaker handling.
      // if (voiceSetting.phoneCallMemberIds) {
      //   let applyPhoneSpeaker = new Set();
      //   let phoneSpeakerRemove = new Set();
      //   for (const phoneCallMemberId of voiceSetting.phoneCallMemberIds) {
      //     let phoneCallMember = alt.Player.getByRemoteID(phoneCallMemberId);
      //     if (!phoneCallMember?.valid) continue;

      //     if (phoneCallMember.hasSyncedMeta("yaca:isMutedOnPhone") || phoneCallMember.yacaPlugin?.forceMuted || this.localPlayer.pos.distanceTo(player.pos) > settings.maxPhoneSpeakerRange) {
      //       if (!applyPhoneSpeaker.has(phoneCallMember)) phoneSpeakerRemove.add(phoneCallMember);
      //       continue;
      //     }

      //     players.push({
      //       client_id: phoneCallMember.yacaPlugin.clientId,
      //       position: player.pos,
      //       direction: natives.getEntityForwardVector(player),
      //       range: settings.maxPhoneSpeakerRange,
      //       is_underwater: natives.isPedSwimmingUnderWater(player)
      //     });

      //     if (phoneSpeakerRemove.has(phoneCallMember)) phoneSpeakerRemove.delete(phoneCallMember)
      //     applyPhoneSpeaker.add(phoneCallMember)
      //   }

      //   if (applyPhoneSpeaker.size) YaCAClientModule.setPlayersCommType(Array.from(applyPhoneSpeaker), YacaFilterEnum.PHONE_SPEAKER, true);
      //   if (phoneSpeakerRemove.size) YaCAClientModule.setPlayersCommType(Array.from(phoneSpeakerRemove), YacaFilterEnum.PHONE_SPEAKER, false);
      // }
    }

    /** Send collected data to ts-plugin. */
    this.sendWebsocket({
      base: { "request_type": "INGAME" },
      player: {
        player_direction: this.getCamDirection(),
        player_position: localPos,
        player_range: this.localPlayer.yacaPlugin.range,
        player_is_underwater: natives.isPedSwimmingUnderWater(this.localPlayer),
        player_is_muted: this.localPlayer.yacaPlugin.forceMuted,
        players_list: players
      }
    });
  }

  /* ======================== RADIO SYSTEM ======================== */
  openRadio() {
    if (!this.radioToggle && !alt.isCursorVisible()) {
      this.radioToggle = true;
      alt.showCursor(true);
      //this.webview.emit('webview:radio:openState', true);
      //NKeyhandler.disableAllKeybinds("radioUI", true, ["yaca:radioUI", "yaca:radioTalking"], ["yaca:radioTalking"])
    } else if (this.radioToggle) {
      this.closeRadio();
    }
  }

  /**
   * Cleanup different things, if player closes his radio.
   */
  closeRadio() {
    this.radioToggle = false;

    alt.showCursor(false);
    //this.webview.emit('webview:radio:openState', false);
    //NKeyhandler.disableAllKeybinds("radioUI", false, ["yaca:radioUI", "yaca:radioTalking"], ["yaca:radioTalking"]);
  }

  /**
   * Set volume & stereo mode for all radio channels on first start and reconnect.
   */
  initRadioSettings() {
    for (let i = 1; i <= settings.maxRadioChannels; i++) {
      if (!this.radioChannelSettings[i]) this.radioChannelSettings[i] = Object.assign({}, defaultRadioChannelSettings);
      if (!this.playersInRadioChannel.has(i)) this.playersInRadioChannel.set(i, new Set());

      const volume = this.radioChannelSettings[i].volume;
      const stereo = this.radioChannelSettings[i].stereo;

      this.setCommDeviceStereomode(YacaFilterEnum.RADIO, stereo, i);
      this.setCommDeviceVolume(YacaFilterEnum.RADIO, volume, i);
    }
  }

  /**
   * Sends an event to the plugin when a player starts or stops talking on the radio.
   *
   * @param {boolean} state - The state of the player talking on the radio.
   */
  // radioTalkingStateToPlugin(state) {
  //   YaCAClientModule.setPlayersCommType(this.localPlayer, YacaFilterEnum.RADIO, state, this.activeRadioChannel);
  // }

  /**
   * Updates the UI when a player changes the radio channel.
   *
   * @param {number} channel - The new radio channel.
   */
  updateRadioInWebview(channel) {
    if (channel != this.activeRadioChannel) return;

    //this.webview.emit("webview:radio:setChannelData", this.radioChannelSettings[channel]);
    //this.webview.emit('webview:hud:radioChannel', channel, this.radioChannelSettings[channel].muted);
  }

  /**
   * Finds a radio channel by a given frequency.
   *
   * @param {string} frequency - The frequency to search for.
   * @returns {number | undefined} The channel number if found, undefined otherwise.
   */
  findRadioChannelByFrequency(frequency) {
    let foundChannel;
    for (const channel in this.radioChannelSettings) {
      const data = this.radioChannelSettings[channel];
      if (data.frequency == frequency) {
        foundChannel = parseInt(channel);
        break;
      }
    }

    return foundChannel;
  }

  setRadioFrequency(channel, frequency) {
    this.radioFrequenceSetted = true;

    if (this.radioChannelSettings[channel].frequency != frequency) {
      this.disableRadioFromPlayerInChannel(channel);
    }

    this.radioChannelSettings[channel].frequency = frequency;
  }

  /**
   * Disable radio effect for all players in the given channel.
   *
   * @param {number} channel - The channel number.
   */
  disableRadioFromPlayerInChannel(channel) {
    if (!this.playersInRadioChannel.has(channel)) return;

    const players = this.playersInRadioChannel.get(channel);
    if (!players?.size) return;

    // let targets = [];
    for (const playerId of players) {
      const player = alt.Player.getByRemoteID(playerId);
      if (!player?.valid) continue;

      // targets.push(player);
      players.delete(player.remoteID);
    }

    // if (targets.length) YaCAClientModule.setPlayersCommType(targets, YacaFilterEnum.RADIO, false, channel, undefined, CommDeviceMode.RECEIVER);
  }
}