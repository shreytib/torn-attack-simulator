// =====================================================================
// SIMULATION CORE — torn_sim sim.js
// Depends on: data.js, armor.js, combat.js
// =====================================================================

// -----------------------------------------------------------------------
// calcHP — compute max HP from level, faction, merits, company, armor
// Mutates player.health and player.max_hp
// -----------------------------------------------------------------------
function calcHP(player) {
  console.log('[calcHP] player:', player);
  const lvl = player.level;
  console.log(`Running [calcHP] - lvl: ${lvl}`);
  let hp;
  if      (lvl < 9)  hp = 100 + (lvl - 1) * 25;
  else if (lvl < 96) hp = 325 + (lvl - 9) * 50;
  else               hp = 4700 + (lvl - 96) * 75;
  console.log(`Running [calcHP] - hp: ${hp}`);

  // Faction support life bonus
  hp += player.faction_sup.life * hp;
  console.log(`Running [calcHP] - hp: ${hp}`);

  // Life merit (+5% per level)
  hp += player.merit.life * 0.05 * hp;
  console.log(`Running [calcHP] - hp: ${hp}`);

  // Mining Corporation star>=7: +10% HP
  if (player.comp.name === 'Mining Corporation' && player.comp.star >= 7) {
    hp += 0.10 * hp;
    console.log(`Running [calcHP] - hp: ${hp}`);
  }

  // Imperviable (marauder) armor: HP bonus per piece + set bonus
  let imperviable = 0;
  for (const slot of ['helmet','body','pants','gloves','boots']) {
    if (player.armor[slot].bonus.name === 'Imperviable') {
      imperviable += player.armor[slot].bonus.level;
      console.log(`Running [calcHP] - imperviable: ${imperviable}`);
    }
  }
  if (setBonus(player) === 'Imperviable') imperviable += 0.05;
  console.log(`Running [calcHP] - imperviable: ${imperviable}`);
  hp += imperviable * hp;
  console.log(`Running [calcHP] - hp: ${hp}`);

  player.health  = hp;
  console.log(`Running [calcHP] - player.health: ${player.health}`);
  player.max_hp  = hp;
  console.log(`Running [calcHP] - player.max_hp: ${player.max_hp}`);
  return player;
}

// -----------------------------------------------------------------------
// applyPassives — apply all stat bonuses before combat starts
// Modifies player in-place; opponent needed for Adult Novelties debuff
// -----------------------------------------------------------------------
function applyPassives(player, opponent) {
  console.log('[applyPassives] player:', player, '| opponent:', opponent);
  // calcHP already called inside prepPlayer; call again to get updated health
  calcHP(player);

  // Immutable (sentinel) armor: passive defense bonus per piece
  for (const slot of ['helmet','body','pants','gloves','boots']) {
    if (player.armor[slot].bonus.name === 'Immutable') {
      player.passive.defense += player.armor[slot].bonus.level;
      console.log(`Running [applyPassives] - player.passive.defense: ${player.passive.defense}`);
    }
  }
  if (setBonus(player) === 'Immutable') player.passive.defense += 0.25;
  console.log(`Running [applyPassives] - player.passive.defense: ${player.passive.defense}`);

  // Irrepressible (vanguard) armor: passive dexterity bonus per piece
  for (const slot of ['helmet','body','pants','gloves','boots']) {
    if (player.armor[slot].bonus.name === 'Irrepressible') {
      player.passive.dexterity += player.armor[slot].bonus.level;
      console.log(`Running [applyPassives] - player.passive.dexterity: ${player.passive.dexterity}`);
    }
  }
  if (setBonus(player) === 'Irrepressible') player.passive.dexterity += 0.25;
  console.log(`Running [applyPassives] - player.passive.dexterity: ${player.passive.dexterity}`);

  // Crit rate from merits and education
  player.crit += player.merit.crit * 0.005 + player.edu.crit;
  console.log(`Running [applyPassives] - player.crit: ${player.crit}`);

  // Stat passives from merits, education, and faction
  player.passive.strength  += player.merit.strength  * 0.03 + player.edu.strength  + player.faction_agg.strength;
  player.passive.defense   += player.merit.defense   * 0.03 + player.edu.defense   + player.faction_sup.defense;
  player.passive.speed     += player.merit.speed     * 0.03 + player.edu.speed     + player.faction_agg.speed;
  player.passive.dexterity += player.merit.dexterity * 0.03 + player.edu.dexterity + player.faction_sup.dexterity;
  console.log(`Running [applyPassives] - player.passive.strength: ${player.passive.strength}`);
  console.log(`Running [applyPassives] - player.passive.defense: ${player.passive.defense}`);
  console.log(`Running [applyPassives] - player.passive.speed: ${player.passive.speed}`);
  console.log(`Running [applyPassives] - player.passive.dexterity: ${player.passive.dexterity}`);

  // ---- Company stat bonuses ----
  console.log('[applyPassives] player.comp:', player.comp);
  // Adult Novelties star>=7: opponent loses 25% speed passive
  if (player.comp.name === 'Adult Novelties' && player.comp.star >= 7) {
    opponent.passive.speed -= 0.25;
    console.log(`Running [applyPassives] - opponent.passive.speed: ${opponent.passive.speed}`);
  }

  // Clothing Store star>=5: +25% dexterity passive
  if (player.comp.name === 'Clothing Store' && player.comp.star >= 5) {
    player.passive.dexterity += 0.25;
    console.log(`Running [applyPassives] - player.passive.dexterity: ${player.passive.dexterity}`);
  }

  // Furniture Store star>=5: +25% strength passive
  if (player.comp.name === 'Furniture Store' && player.comp.star >= 5) {
    player.passive.strength += 0.25;
    console.log(`Running [applyPassives] - player.passive.strength: ${player.passive.strength}`);
  }

  // Gas Station star>=3: +25% speed passive
  if (player.comp.name === 'Gas Station' && player.comp.star >= 3) {
    player.passive.speed += 0.25;
    console.log(`Running [applyPassives] - player.passive.speed: ${player.passive.speed}`);
  }

  // Gents Strip Club star>=3: +25% dexterity passive
  if (player.comp.name === 'Gents Strip Club' && player.comp.star >= 3) {
    player.passive.dexterity += 0.25;
    console.log(`Running [applyPassives] - player.passive.dexterity: ${player.passive.dexterity}`);
  }

  // Ladies Strip Club star>=3: +25% defense passive
  if (player.comp.name === 'Ladies Strip Club' && player.comp.star >= 3) {
    player.passive.defense += 0.25;
    console.log(`Running [applyPassives] - player.passive.defense: ${player.passive.defense}`);
  }

  // Lingerie Store star>=5 with NO full armor set: +50% speed and dexterity
  if (player.comp.name === 'Lingerie Store' && player.comp.star >= 5 && setBonus(player) === 'NA') {
    player.passive.speed     += 0.50;
    player.passive.dexterity += 0.50;
    console.log(`Running [applyPassives] - player.passive.speed: ${player.passive.speed}`);
    console.log(`Running [applyPassives] - player.passive.dexterity: ${player.passive.dexterity}`);
  }

  // Music Store star==10: +15% to all stats
  if (player.comp.name === 'Music Store' && player.comp.star === 10) {
    player.passive.strength  += 0.15;
    player.passive.defense   += 0.15;
    player.passive.speed     += 0.15;
    player.passive.dexterity += 0.15;
    console.log(`Running [applyPassives] - player.passive.strength: ${player.passive.strength}`);
    console.log(`Running [applyPassives] - player.passive.defense: ${player.passive.defense}`);
    console.log(`Running [applyPassives] - player.passive.speed: ${player.passive.speed}`);
    console.log(`Running [applyPassives] - player.passive.dexterity: ${player.passive.dexterity}`);
  }

  // ---- Drug effects ----
  // Xanax: all 4 stats -25%
  if (player.drug === 'Xanax') {
    player.passive.strength  -= 0.25;
    player.passive.defense   -= 0.25;
    player.passive.speed     -= 0.25;
    player.passive.dexterity -= 0.25;
    console.log(`Running [applyPassives] Xanax - str: ${player.passive.strength}, def: ${player.passive.defense}, spd: ${player.passive.speed}, dex: ${player.passive.dexterity}`);
  }

  // Vicodin: all 4 stats +25%
  if (player.drug === 'Vicodin') {
    player.passive.strength  += 0.25;
    player.passive.defense   += 0.25;
    player.passive.speed     += 0.25;
    player.passive.dexterity += 0.25;
    console.log(`Running [applyPassives] Vicodin - str: ${player.passive.strength}, def: ${player.passive.defense}, spd: ${player.passive.speed}, dex: ${player.passive.dexterity}`);
  }

  // LSD: strength +30%, defense +50%, speed -50%, dexterity -50%
  if (player.drug === 'LSD') {
    player.passive.strength  += 0.30;
    player.passive.defense   += 0.50;
    player.passive.speed     -= 0.50;
    player.passive.dexterity -= 0.50;
    console.log(`Running [applyPassives] LSD - str: ${player.passive.strength}, def: ${player.passive.defense}, spd: ${player.passive.speed}, dex: ${player.passive.dexterity}`);
  }

  // Ketamine: defense +50%, strength -20%, speed -20%
  if (player.drug === 'Ketamine') {
    player.passive.defense   += 0.50;
    player.passive.strength  -= 0.20;
    player.passive.speed     -= 0.20;
    console.log(`Running [applyPassives] Ketamine - str: ${player.passive.strength}, def: ${player.passive.defense}, spd: ${player.passive.speed}, dex: ${player.passive.dexterity}`);
  }

  // Speed: speed +20%, dexterity -20%
  if (player.drug === 'Speed') {
    player.passive.speed     += 0.20;
    player.passive.dexterity -= 0.20;
    console.log(`Running [applyPassives] Speed - str: ${player.passive.strength}, def: ${player.passive.defense}, spd: ${player.passive.speed}, dex: ${player.passive.dexterity}`);
  }

  // PCP: strength +20%, dexterity +20%
  if (player.drug === 'PCP') {
    player.passive.strength  += 0.20;
    player.passive.dexterity += 0.20;
    console.log(`Running [applyPassives] PCP - str: ${player.passive.strength}, def: ${player.passive.defense}, spd: ${player.passive.speed}, dex: ${player.passive.dexterity}`);
  }

  // Opium: defense +30%
  if (player.drug === 'Opium') {
    player.passive.defense   += 0.30;
    console.log(`Running [applyPassives] Opium - str: ${player.passive.strength}, def: ${player.passive.defense}, spd: ${player.passive.speed}, dex: ${player.passive.dexterity}`);
  }

  // Addiction: reduces all 4 stat passives
  if (player.addiction > 0) {
    player.passive.strength  -= player.addiction;
    player.passive.defense   -= player.addiction;
    player.passive.speed     -= player.addiction;
    player.passive.dexterity -= player.addiction;
    console.log(`Running [applyPassives] Addiction(${player.addiction}) - str: ${player.passive.strength}, def: ${player.passive.defense}, spd: ${player.passive.speed}, dex: ${player.passive.dexterity}`);
  }
}

// -----------------------------------------------------------------------
// ammoControl — reduce ROF based on Conserve bonus, edu ammo, Recoil Pad
// -----------------------------------------------------------------------
function ammoControl(player, wep) {
  console.log('[ammoControl] player:', player, '| wep:', wep);
  const wi = player[`wep_${wep}`];
  console.log('[ammoControl] wi:', wi);
  let reduction = player.edu.ammo; // edu ammo control: 0 or 0.25
  console.log(`Running [applyPassives] - reduction: ${reduction}`);

  if (wi.bonus  === 'Conserve') reduction += wi.level;
  console.log(`Running [applyPassives] - reduction: ${reduction}`);
  if (wi.bonus2 === 'Conserve') reduction += wi.level2;
  console.log(`Running [applyPassives] - reduction: ${reduction}`);
  if (wi.mod1_name === 'Recoil Pad') reduction += 0.25;
  console.log(`Running [applyPassives] - reduction: ${reduction}`);
  if (wi.mod2_name === 'Recoil Pad') reduction += 0.25;
  console.log(`Running [applyPassives] - reduction: ${reduction}`);

  wi.info.rof_l = (1 - reduction) * wi.info.rof_l;
  console.log(`Running [applyPassives] - wi.info.rof_l: ${wi.info.rof_l}`);
  wi.info.rof_h = (1 - reduction) * wi.info.rof_h;
  console.log(`Running [applyPassives] - wi.info.rof_h: ${wi.info.rof_h}`);
}

// -----------------------------------------------------------------------
// prepPlayer — deep copy raw input and set up full combat state
// -----------------------------------------------------------------------
function prepPlayer(raw) {
  console.log('[prepPlayer] raw:', raw);
  const p = JSON.parse(JSON.stringify(raw));

  // Resolve armor bonus names from armor type names
  for (const slot of ['helmet','body','pants','gloves','boots']) {
    p.armor[slot].bonus.name = getArmorBonusName(p.armor[slot].name);
  }

  // Initialise combat state
  Object.assign(p, {
    passive:    { strength:0, defense:0, speed:0, dexterity:0 },
    debuff:     { strength:0, defense:0, speed:0, dexterity:0, temp:'' },
    buff:       { strength:0, defense:0, speed:0, dexterity:0 },
    crit:       0.12,
    demoralized:0, motivated:0, frozen:0, withered:0, weakened:0,
    slowed:0, crippled:0, eviscerated:0,
    last_wep:'', last_wep_hit:false, frenzy:0,
    paralyzed:false, stunned:false, suppressed:false,
    double_edge:false, winded_up:'',
    bleed_turn:0,       bleed_dmg:0,       bleed_apply:0,
    poison_turn:0,      poison_dmg:0,       poison_apply:0,
    burn_turn:0,        burn_dmg:0,         burn_apply:0,
    severe_burn_turn:0, severe_burn_dmg:0,  severe_burn_apply:0,
    lacerate_turn:0,    lacerate_dmg:0,     lacerate_apply:0,
    finale:0, focus:0, delta:0,
  });

  // Reset per-weapon combat stats
  for (const wt of ['p','s','m']) {
    Object.assign(p[`wep_${wt}`], { tot_dmg:0, tot_turn:0, tot_miss:0, disarmed:0 });
  }

  // Attach weapon info tables
  p.wep_p.info = WEAPON_PRIMARY[p.wep_p.name]
    ? Object.assign({}, WEAPON_PRIMARY[p.wep_p.name])
    : { clip_size:30, clips:3, rof_h:5, rof_l:3, weapon_type:'Rifle' };

  p.wep_s.info = WEAPON_SECONDARY[p.wep_s.name]
    ? Object.assign({}, WEAPON_SECONDARY[p.wep_s.name])
    : { clip_size:8, clips:3, rof_h:3, rof_l:2, weapon_type:'Pistol' };

  p.wep_m.info = WEAPON_MELEE[p.wep_m.name]
    ? Object.assign({}, WEAPON_MELEE[p.wep_m.name])
    : { jap:false, weapon_type:'Clubbing' };

  // Temp weapon stats (damaging temps only)
  if      (p.wep_t.name === 'HEG')     { p.wep_t.dmg = 90;  p.wep_t.acc = 116; }
  else if (p.wep_t.name === 'Grenade') { p.wep_t.dmg = 86;  p.wep_t.acc = 106; }
  else if (p.wep_t.name === 'Molotov Cocktail') { p.wep_t.dmg = 60; p.wep_t.acc = 80; }
  p.wep_t.info = { weapon_type:'Temporary' };

  // Gun mod clip/ammo adjustments (primary)
  if (p.wep_p.mod2_name === 'Extended Mags')      p.wep_p.info.clip_size = Math.floor(p.wep_p.info.clip_size * 1.2);
  if (p.wep_p.mod2_name === 'High Capacity Mags') p.wep_p.info.clip_size = Math.floor(p.wep_p.info.clip_size * 1.3);
  if (p.wep_p.mod2_name === 'Extra Clips x1')     p.wep_p.info.clips += 1;
  if (p.wep_p.mod2_name === 'Extra Clips x2')     p.wep_p.info.clips += 2;

  // Gun mod clip adjustments (secondary)
  if (p.wep_s.mod2_name === 'Extended Mags')      p.wep_s.info.clip_size = Math.floor(p.wep_s.info.clip_size * 1.2);
  if (p.wep_s.mod2_name === 'High Capacity Mags') p.wep_s.info.clip_size = Math.floor(p.wep_s.info.clip_size * 1.3);

  // Specialist: weapon only has 1 clip but higher damage
  if (p.wep_p.bonus === 'Specialist' || p.wep_p.bonus2 === 'Specialist') p.wep_p.info.clips = 1;
  if (p.wep_s.bonus === 'Specialist' || p.wep_s.bonus2 === 'Specialist') p.wep_s.info.clips = 1;

  // Initialise ammo to full clip; decrement clips since one is already loaded
  p.wep_p.info.ammo = p.wep_p.info.clip_size;
  p.wep_p.info.clips--;
  p.wep_s.info.ammo = p.wep_s.info.clip_size;
  p.wep_s.info.clips--;

  // Apply ammo control (ROF reduction)
  ammoControl(p, 'p');
  ammoControl(p, 's');

  console.log('[prepPlayer] result p:', p);
  return p;
}

// -----------------------------------------------------------------------
// getWeapon — select which weapon to use this turn
// isP1: only P1 gets forced Execute / Assassinate selection
// -----------------------------------------------------------------------
function getWeapon(player, opponent, turn, isP1) {
  console.log('[getWeapon] player:', player, '| opponent:', opponent, '| turn:', turn, '| isP1:', isP1);
  // P1 only: force Execute weapon if opponent is below threshold
  if (isP1) {
    for (const wep of ['s','p']) { // secondary checked first (matches Python)
      const wi    = player[`wep_${wep}`];
      console.log('[getWeapon] wi (execute check):', wi);
      const execLv = wi.bonus === 'Execute' ? wi.level : (wi.bonus2 === 'Execute' ? wi.level2 : 0);
      console.log(`Running [getWeapon] - execLv: ${execLv}`);
      if (execLv && opponent.health <= execLv * opponent.max_hp) {
        // Only use if weapon still has ammo or can reload
        if (wi.info.ammo > 0 || (wi.reload !== 0 && wi.info.clips > 0)) return wep;
      }
    }

    // P1 only: force Assassinate weapon on turn 1
    if (turn === 1) {
      for (const wep of ['p','s']) {
        const wi = player[`wep_${wep}`];
        console.log('[getWeapon] wi (assassinate check):', wi);
        if (wi.bonus === 'Assassinate' || wi.bonus2 === 'Assassinate') return wep;
      }
    }
  }

  // Build effective attack set weights (zero out disarmed weapons)
  let { p, s, m, t } = player.att_set;
  console.log(`Running [getWeapon] - p: ${p}, s: ${s}, m: ${m}, t: ${t}`);
  if (player.wep_p.disarmed > 0) p = 0;
  if (player.wep_s.disarmed > 0) s = 0;
  if (player.wep_m.disarmed > 0) m = 0;
  if (player.wep_t.used)         t = 0;
  console.log(`Running [getWeapon] - p: ${p}, s: ${s}, m: ${m}, t: ${t}`);

  const tot = p + s + m + t;
  console.log(`Running [getWeapon] - tot: ${tot}, p: ${p}, s: ${s}, m: ${m}, t: ${t}`);
  if (!tot) return player.fist ? 'fist' : 'kick';

  const r = Math.random() * tot;
  console.log(`Running [getWeapon] - r: ${r}`);
  let cum = 0;

  if ((cum += p) > r) {
    // FIX: reload=0 weapons can only be used while they have ammo
    if (player.wep_p.info.ammo > 0 || (player.wep_p.reload !== 0 && player.wep_p.info.clips > 0)) return 'p';
    return getWeaponFallback(player, 0, s, m, t);
  }
  if ((cum += s) > r) {
    if (player.wep_s.info.ammo > 0 || (player.wep_s.reload !== 0 && player.wep_s.info.clips > 0)) return 's';
    return getWeaponFallback(player, p, 0, m, t);
  }
  if ((cum += m) > r) return 'm';
  if (t > 0 && !player.wep_t.used) return 't';
  return player.fist ? 'fist' : 'kick';
}

// -----------------------------------------------------------------------
// getWeaponFallback — re-roll weapon selection excluding exhausted weapon
// -----------------------------------------------------------------------
function getWeaponFallback(player, p, s, m, t) {
  console.log('[getWeaponFallback] player:', player, '| p:', p, '| s:', s, '| m:', m, '| t:', t);
  const ntot = p + s + m + t;
  console.log(`Running [getWeaponFallback] - ntot: ${ntot}`);
  if (!ntot) return player.fist ? 'fist' : 'kick';

  const r = Math.random() * ntot;
  console.log(`Running [getWeaponFallback] - r: ${r}`);
  let cum = 0;
  if (p && (cum += p) > r) return 'p';
  if (s && (cum += s) > r) return 's';
  if (m && (cum += m) > r) return 'm';
  return (t && !player.wep_t.used) ? 't' : (player.fist ? 'fist' : 'kick');
}

// -----------------------------------------------------------------------
// runOneSim — run one complete fight, returns result object
// logDetail: if true, populate the log array for display
// -----------------------------------------------------------------------
function runOneSim(heroInput, villainInput, logDetail) {
  console.log('[runOneSim] heroInput:', heroInput, '| villainInput:', villainInput, '| logDetail:', logDetail);
  // Deep copy and prepare both players
  let p1 = prepPlayer(heroInput);
  let p2 = prepPlayer(villainInput);

  console.log('[runOneSim] after prepPlayer — p1:', p1, '| p2:', p2);

  // Apply all passives (must pass both so Adult Novelties can debuff opponent)
  applyPassives(p1, p2);
  console.log('[runOneSim] after applyPassives(p1) — p1:', p1, '| p2:', p2);
  applyPassives(p2, p1);
  console.log('[runOneSim] after applyPassives(p2) — p1:', p1, '| p2:', p2);

  // Compute delta (Invulnerable armor) after passives
  p1.delta = getDelta(p1);
  console.log(`Running [runOneSim] - p1.delta: ${p1.delta}`);
  p2.delta = getDelta(p2);
  console.log(`Running [runOneSim] - p2.delta: ${p2.delta}`);

  const log     = [];
  let winner    = 0;   // 0=draw, 1=p1 wins, 2=p2 wins
  let turns_taken = 25;

  for (let turn = 1; turn <= 25; turn++) {
    if (logDetail) log.push({ text:`— Turn ${turn} —`, cls:'turn-header' });

    // Weapon selection for this turn
    const wep1 = getWeapon(p1, p2, turn, true);
    const wep2 = getWeapon(p2, p1, turn, false);
    console.log(`Running [runOneSim] - wep1: ${wep1}, wep2: ${wep2}`);

    // ---- Bipod / Tripod: dex penalty for the whole turn ----
    // FIX: was using `includes(a || b)` — now correctly two separate includes() calls
    const p1BipodActive = ['p','s'].includes(wep1) && (
      ['Bipod','Tripod'].includes(p1[`wep_${wep1}`].mod1_name) ||
      ['Bipod','Tripod'].includes(p1[`wep_${wep1}`].mod2_name)
    );
    console.log(`Running [runOneSim] - p1BipodActive: ${p1BipodActive}`);
    const p2BipodActive = ['p','s'].includes(wep2) && (
      ['Bipod','Tripod'].includes(p2[`wep_${wep2}`].mod1_name) ||
      ['Bipod','Tripod'].includes(p2[`wep_${wep2}`].mod2_name)
    );
    console.log(`Running [runOneSim] - p2BipodActive: ${p2BipodActive}`);
    if (p1BipodActive) p1.passive.dexterity -= 0.3;
    console.log(`Running [runOneSim] - p1.passive.dexterity: ${p1.passive.dexterity}`);
    if (p2BipodActive) p2.passive.dexterity -= 0.3;
    console.log(`Running [runOneSim] - p2.passive.dexterity: ${p2.passive.dexterity}`);

    // ---- Light mods: reduce opponent weapon accuracy this turn ----
    // Applied to whichever weapon the opponent selected
    let p1LightPenalty = 0; // penalty applied to p1's selected wep acc
    let p2LightPenalty = 0; // penalty applied to p2's selected wep acc

    if (['p','s'].includes(wep1)) {
      const wi1 = p1[`wep_${wep1}`];
      console.log('[runOneSim] wi1 (light mod check):', wi1);
      const lightMap = { 'Small Light':3, 'Precision Light':4, 'Tactical Illuminator':5 };
      const penalty = (lightMap[wi1.mod1_name] || 0) + (lightMap[wi1.mod2_name] || 0);
      console.log(`Running [runOneSim] - penalty: ${penalty}`);
      if (penalty && ['p','s','m'].includes(wep2)) {
        p2[`wep_${wep2}`].acc -= penalty;
        console.log(`Running [runOneSim] - p2[wep_${wep2}].acc: ${p2[`wep_${wep2}`].acc}`);
        p2LightPenalty = penalty;
        console.log(`Running [runOneSim] - p2LightPenalty: ${p2LightPenalty}`);
      }
    }
    if (['p','s'].includes(wep2)) {
      const wi2 = p2[`wep_${wep2}`];
      console.log('[runOneSim] wi2 (light mod check):', wi2);
      const lightMap = { 'Small Light':3, 'Precision Light':4, 'Tactical Illuminator':5 };
      const penalty = (lightMap[wi2.mod1_name] || 0) + (lightMap[wi2.mod2_name] || 0);
      console.log(`Running [runOneSim] - penalty: ${penalty}`);
      if (penalty && ['p','s','m'].includes(wep1)) {
        p1[`wep_${wep1}`].acc -= penalty;
        console.log(`Running [runOneSim] - p1[wep_${wep1}].acc: ${p1[`wep_${wep1}`].acc}`);
        p1LightPenalty = penalty;
        console.log(`Running [runOneSim] - p1LightPenalty: ${p1LightPenalty}`);
      }
    }

    // ---- P1 attacks P2 ----
    const res1 = doAttack(p1, p2, wep1, wep2, turn, false);
    console.log('[runOneSim] res1:', res1);
    if (logDetail) log.push(...res1.msgs);
    console.log('[runOneSim] log so far:', log);

    // ---- P2 takes DOT before P2 attacks ----
    const dot_p2 = applyDOT(p2, turn);
    console.log('[runOneSim] dot_p2:', dot_p2);
    if (logDetail) log.push(...dot_p2);
    console.log('[runOneSim] log so far:', log);

    // ---- P1 heals (Gas Station) ----
    const heal1 = doHeal(p1);
    console.log('[runOneSim] heal1:', heal1);
    if (logDetail) log.push(...heal1);
    console.log('[runOneSim] log so far:', log);

    // ---- Check if P2 is defeated ----
    if (p2.health < 1) {
      p2.health   = 1;
      winner      = 1;
      turns_taken = turn;
      if (logDetail) log.push({ text:`${p2.name} is defeated! ${p1.name} wins!`, cls:'kill' });
      console.log('[runOneSim] log so far:', log);
      break;
    }

    // ---- P2 attacks P1 ----
    const res2 = doAttack(p2, p1, wep2, wep1, turn, false);
    console.log('[runOneSim] res2:', res2);
    if (logDetail) log.push(...res2.msgs);
    console.log('[runOneSim] log so far:', log);

    // ---- P1 takes DOT after P2 attacks ----
    const dot_p1 = applyDOT(p1, turn);
    console.log('[runOneSim] dot_p1:', dot_p1);
    if (logDetail) log.push(...dot_p1);
    console.log('[runOneSim] log so far:', log);

    // ---- P2 heals (Gas Station) ----
    const heal2 = doHeal(p2);
    console.log('[runOneSim] heal2:', heal2);
    if (logDetail) log.push(...heal2);
    console.log('[runOneSim] log so far:', log);

    // ---- Check if P1 is defeated ----
    if (p1.health < 1) {
      p1.health   = 1;
      winner      = 2;
      turns_taken = turn;
      if (logDetail) log.push({ text:`${p1.name} is defeated! ${p2.name} wins!`, cls:'kill' });
      console.log('[runOneSim] log so far:', log);
      break;
    }

    // ---- Restore Bipod dex penalty at end of turn ----
    if (p1BipodActive) p1.passive.dexterity += 0.3;
    console.log(`Running [runOneSim] - p1.passive.dexterity: ${p1.passive.dexterity}`);
    if (p2BipodActive) p2.passive.dexterity += 0.3;
    console.log(`Running [runOneSim] - p2.passive.dexterity: ${p2.passive.dexterity}`);

    // ---- Restore light mod acc penalties at end of turn ----
    if (p1LightPenalty && ['p','s','m'].includes(wep1)) p1[`wep_${wep1}`].acc += p1LightPenalty;
    console.log(`Running [runOneSim] - p1[wep_${wep1}].acc: ${p1[`wep_${wep1}`]?.acc || "NA"}`);
    if (p2LightPenalty && ['p','s','m'].includes(wep2)) p2[`wep_${wep2}`].acc += p2LightPenalty;
    console.log(`Running [runOneSim] - p2[wep_${wep2}].acc: ${p2[`wep_${wep2}`]?.acc || "NA"}`);
  }

  if (winner === 0 && logDetail) {
    log.push({ text:'Attack stalemated — maximum turns reached.', cls:'stale' });
    console.log('[runOneSim] final log:', log);
  }

  return {
    winner,
    turns: turns_taken,
    p1_hp:  p1.health,
    p1_max: p1.max_hp,
    p2_hp:  p2.health,
    p2_max: p2.max_hp,
    p1_wep_stats: {
      p: { turns: p1.wep_p.tot_turn, dmg: p1.wep_p.tot_dmg, miss: p1.wep_p.tot_miss },
      s: { turns: p1.wep_s.tot_turn, dmg: p1.wep_s.tot_dmg, miss: p1.wep_s.tot_miss },
      m: { turns: p1.wep_m.tot_turn, dmg: p1.wep_m.tot_dmg, miss: p1.wep_m.tot_miss },
    },
    p2_wep_stats: {
      p: { turns: p2.wep_p.tot_turn, dmg: p2.wep_p.tot_dmg, miss: p2.wep_p.tot_miss },
      s: { turns: p2.wep_s.tot_turn, dmg: p2.wep_s.tot_dmg, miss: p2.wep_s.tot_miss },
      m: { turns: p2.wep_m.tot_turn, dmg: p2.wep_m.tot_dmg, miss: p2.wep_m.tot_miss },
    },
    log,
  };
}
