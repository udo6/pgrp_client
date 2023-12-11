import alt from 'alt-client';
import game from 'natives';

const loadIpl = (ipl: string): void => {
  alt.requestIpl(ipl);
}

const removeIpl = (ipl: string): void => {
  alt.removeIpl(ipl);
}

alt.onServer('LoadIPL', loadIpl);
alt.onServer('UnloadIPL', removeIpl);

export const loadIPLs = (): void => {
  alt.loadDefaultIpls();

  alt.requestIpl('apa_v_mp_h_08_b');
  alt.requestIpl('ex_exec_warehouse_placement_interior_1_int_warehouse_s_dlc_milo');
  alt.requestIpl('ex_exec_warehouse_placement_interior_0_int_warehouse_m_dlc_milo');
  alt.requestIpl('ex_exec_warehouse_placement_interior_2_int_warehouse_l_dlc_milo');
  alt.requestIpl('ex_dt1_02_office_02b');
  alt.requestIpl('chop_props');
  alt.requestIpl('FIBlobby');
  alt.removeIpl('FIBlobbyfake');
  alt.requestIpl('FBI_colPLUG');
  alt.requestIpl('FBI_repair');
  alt.requestIpl('v_tunnel_hole');
  alt.requestIpl('TrevorsMP');
  alt.requestIpl('TrevorsTrailer');
  alt.requestIpl('TrevorsTrailerTidy');
  alt.removeIpl('farm_burnt');
  alt.removeIpl('farm_burnt_lod');
  alt.removeIpl('farm_burnt_props');
  alt.removeIpl('farmint_cap');
  alt.removeIpl('farmint_cap_lod');
  alt.requestIpl('farm');
  alt.requestIpl('farmint');
  alt.requestIpl('farm_lod');
  alt.requestIpl('farm_props');
  alt.requestIpl('facelobby');
  alt.removeIpl('CS1_02_cf_offmission');
  alt.requestIpl('CS1_02_cf_onmission1');
  alt.requestIpl('CS1_02_cf_onmission2');
  alt.requestIpl('CS1_02_cf_onmission3');
  alt.requestIpl('CS1_02_cf_onmission4');
  alt.requestIpl('v_rockclub');
  alt.requestIpl('v_janitor');
  alt.removeIpl('hei_bi_hw1_13_door');
  alt.requestIpl('bkr_bi_hw1_13_int');
  alt.requestIpl('ufo');
  alt.requestIpl('ufo_lod');
  alt.requestIpl('ufo_eye');
  alt.removeIpl('v_carshowroom');
  alt.removeIpl('shutter_open');
  alt.removeIpl('shutter_closed');
  alt.removeIpl('shr_int');
  alt.requestIpl('csr_afterMission');
  alt.requestIpl('v_carshowroom');
  alt.requestIpl('shr_int');
  alt.requestIpl('shutter_closed');
  alt.requestIpl('smboat');
  alt.requestIpl('smboat_distantlights');
  alt.requestIpl('smboat_lod');
  alt.requestIpl('smboat_lodlights');
  alt.requestIpl('cargoship');
  alt.requestIpl('railing_start');
  alt.removeIpl('sp1_10_fake_interior');
  alt.removeIpl('sp1_10_fake_interior_lod');
  alt.requestIpl('sp1_10_real_interior');
  alt.requestIpl('sp1_10_real_interior_lod');
  alt.removeIpl('id2_14_during_door');
  alt.removeIpl('id2_14_during1');
  alt.removeIpl('id2_14_during2');
  alt.removeIpl('id2_14_on_fire');
  alt.removeIpl('id2_14_post_no_int');
  alt.removeIpl('id2_14_pre_no_int');
  alt.removeIpl('id2_14_during_door');
  alt.requestIpl('id2_14_during1');
  alt.removeIpl('Coroner_Int_off');
  alt.requestIpl('coronertrash');
  alt.requestIpl('Coroner_Int_on');
  alt.removeIpl('bh1_16_refurb');
  alt.removeIpl('jewel2fake');
  alt.removeIpl('bh1_16_doors_shut');
  alt.requestIpl('refit_unload');
  alt.requestIpl('post_hiest_unload');
  alt.requestIpl('Carwash_with_spinners');
  alt.requestIpl('KT_CarWash');
  alt.requestIpl('ferris_finale_Anim');
  alt.removeIpl('ch1_02_closed');
  alt.requestIpl('ch1_02_open');
  alt.requestIpl('AP1_04_TriAf01');
  alt.requestIpl('CS2_06_TriAf02');
  alt.requestIpl('CS4_04_TriAf03');
  alt.removeIpl('scafstartimap');
  alt.requestIpl('scafendimap');
  alt.removeIpl('DT1_05_HC_REMOVE');
  alt.requestIpl('DT1_05_HC_REQ');
  alt.requestIpl('DT1_05_REQUEST');
  alt.requestIpl('dt1_05_hc_remove');
  alt.requestIpl('dt1_05_hc_remove_lod');
  alt.requestIpl('FINBANK');
  alt.removeIpl('DT1_03_Shutter');
  alt.removeIpl('DT1_03_Gr_Closed');
  alt.requestIpl('golfflags');
  alt.requestIpl('airfield');
  alt.requestIpl('v_garages');
  alt.requestIpl('v_foundry');
  alt.requestIpl('hei_yacht_heist');
  alt.requestIpl('hei_yacht_heist_Bar');
  alt.requestIpl('hei_yacht_heist_Bedrm');
  alt.requestIpl('hei_yacht_heist_Bridge');
  alt.requestIpl('hei_yacht_heist_DistantLights');
  alt.requestIpl('hei_yacht_heist_enginrm');
  alt.requestIpl('hei_yacht_heist_LODLights');
  alt.requestIpl('hei_yacht_heist_Lounge');
  alt.requestIpl('hei_carrier');
  alt.requestIpl('hei_Carrier_int1');
  alt.requestIpl('hei_Carrier_int2');
  alt.requestIpl('hei_Carrier_int3');
  alt.requestIpl('hei_Carrier_int4');
  alt.requestIpl('hei_Carrier_int5');
  alt.requestIpl('hei_Carrier_int6');
  alt.requestIpl('hei_carrier_LODLights');
  alt.requestIpl('bkr_bi_id1_23_door');
  alt.requestIpl('lr_cs6_08_grave_closed');
  alt.requestIpl('hei_sm_16_interior_v_bahama_milo_');
  alt.requestIpl('CS3_07_MPGates');
  alt.requestIpl('cs5_4_trains');
  alt.requestIpl('v_lesters');
  alt.requestIpl('v_trevors');
  alt.requestIpl('v_michael');
  alt.requestIpl('v_comedy');
  alt.requestIpl('v_cinema');
  alt.requestIpl('V_Sweat');
  alt.requestIpl('V_35_Fireman');
  alt.requestIpl('redCarpet');
  alt.requestIpl('triathlon2_VBprops');
  alt.requestIpl('jetstenativeurnel');
  alt.requestIpl('Jetsteal_ipl_grp1');
  alt.requestIpl('v_hospital');
  alt.requestIpl('canyonriver01');
  alt.requestIpl('canyonriver01_lod');
  alt.requestIpl('cs3_05_water_grp1');
  alt.requestIpl('cs3_05_water_grp1_lod');
  alt.requestIpl('trv1_trail_start');
  alt.requestIpl('CanyonRvrShallow');

  // PILLBOX KH
  alt.requestIpl('gabz_pillbox_milo_');
  const pbkh = game.getInteriorAtCoords(311.2546, -592.4204, 42.32737);
  const pbkhValid = game.isValidInterior(pbkh);
  alt.log('PBKH: ' + pbkhValid);

  if(pbkhValid) {
    alt.removeIpl('rc12b_fixed');
    alt.removeIpl('rc12b_destroyed');
    alt.removeIpl('rc12b_default');
    alt.removeIpl('rc12b_hospitalinterior_lod');
    alt.removeIpl('rc12b_hospitalinterior');
    game.refreshInterior(pbkh);
  }

  // WEED LAB
  const bike2IntId = game.getInteriorAtCoords(1051.491, -3196.536, -39.14842);
  alt.requestIpl("bkr_biker_interior_placement_interior_3_biker_dlc_int_ware02_milo");
  game.activateInteriorEntitySet(bike2IntId, "light_growthc_stage23_upgrade");
  game.activateInteriorEntitySet(bike2IntId, "weed_chairs");
  game.activateInteriorEntitySet(bike2IntId, "weed_drying");
  game.activateInteriorEntitySet(bike2IntId, "weed_growtha_stage3");
  game.activateInteriorEntitySet(bike2IntId, "weed_growthb_stage3");
  game.activateInteriorEntitySet(bike2IntId, "weed_growthc_stage3");
  game.activateInteriorEntitySet(bike2IntId, "weed_growthd_stage3");
  game.activateInteriorEntitySet(bike2IntId, "weed_growthe_stage3");
  game.activateInteriorEntitySet(bike2IntId, "weed_growthf_stage3");
  game.activateInteriorEntitySet(bike2IntId, "weed_growthg_stage3");
  game.activateInteriorEntitySet(bike2IntId, "weed_growthh_stage3");
  game.activateInteriorEntitySet(bike2IntId, "weed_growthi_stage3");
  game.activateInteriorEntitySet(bike2IntId, "weed_set_up");
  game.activateInteriorEntitySet(bike2IntId, "weed_upgrade_equip");
  game.refreshInterior(bike2IntId);

  // COKE LAB
  const bike3IntId = game.getInteriorAtCoords(1093.6, -3196.6, -38.99841);
  alt.requestIpl("bkr_biker_interior_placement_interior_4_biker_dlc_int_ware03_milo");
  game.activateInteriorEntitySet(bike3IntId, "bkr_biker_dlc_int_ware03");
  game.activateInteriorEntitySet(bike3IntId, "coke_cut_01");
  game.activateInteriorEntitySet(bike3IntId, "coke_cut_02");
  game.activateInteriorEntitySet(bike3IntId, "coke_cut_03");
  game.activateInteriorEntitySet(bike3IntId, "coke_cut_04");
  game.activateInteriorEntitySet(bike3IntId, "coke_cut_05");
  game.activateInteriorEntitySet(bike3IntId, "coke_press_upgrade");
  game.activateInteriorEntitySet(bike3IntId, "equipment_upgrade");
  game.activateInteriorEntitySet(bike3IntId, "production_upgrade");
  game.activateInteriorEntitySet(bike3IntId, "security_high");
  game.activateInteriorEntitySet(bike3IntId, "tabe_equipment_upgrade");
  game.refreshInterior(bike3IntId);

  // CASINO
  alt.requestIpl('vw_casino_penthouse');
  alt.requestIpl('vw_casino_main');
  alt.requestIpl('vw_casino_carpark');
  alt.requestIpl('vw_dlc_casino_door');
  alt.requestIpl('vw_casino_door');
  alt.requestIpl('hei_dlc_windows_casino');
  alt.requestIpl('hei_dlc_casino_door');
  alt.requestIpl('hei_dlc_casino_aircon');
  alt.requestIpl('vw_casino_garage');

  const i1 = game.getInteriorAtCoords(1100.0, 220.0, -50.0);
  if (game.isValidInterior(i1)) {
    game.activateInteriorEntitySet(i1, '0x30240D11');
    game.activateInteriorEntitySet(i1, '0xA3C89BB2');
    game.refreshInterior(i1);
  }

  const i2 = game.getInteriorAtCoords(976.6364, 70.29476, 115.1641);
  if (game.isValidInterior(i2)) {
    game.activateInteriorEntitySet(i2, 'Set_Pent_Tint_Shell');
    game.activateInteriorEntitySet(i2, 'Set_Pent_Pattern_09');
    game.activateInteriorEntitySet(i2, 'Set_Pent_Spa_Bar_Open');
    game.activateInteriorEntitySet(i2, 'Set_Pent_Media_Bar_Open');
    game.activateInteriorEntitySet(i2, 'Set_Pent_Arcade_Modern');
    game.activateInteriorEntitySet(i2, 'Set_Pent_Bar_Clutter');
    game.activateInteriorEntitySet(i2, 'Set_Pent_Clutter_03');
    game.activateInteriorEntitySet(i2, 'Set_pent_bar_light_02');
    game.refreshInterior(i2);
  }
}