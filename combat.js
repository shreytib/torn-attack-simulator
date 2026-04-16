// =====================================================================
// COMBAT FUNCTIONS — torn_sim combat.js
// Depends on: data.js, armor.js
// =====================================================================

// -----------------------------------------------------------------------
// getRounds — random ROF roll between rof_l and rof_h, min 1
// -----------------------------------------------------------------------
function getRounds(player, wep) {
  console.log('[getRounds] player:', player, '| wep:', wep);
  const inf = player[`wep_${wep}`].info;
  console.log('[getRounds] inf:', inf);
  const r   = inf.rof_l + Math.random() * (inf.rof_h - inf.rof_l);
  console.log(`Running [getRounds] - r: ${r}`);
  const frac = r - Math.floor(r);
  console.log(`Running [getRounds] - frac: ${frac}`);
  return Math.max(1, Math.random() < frac ? Math.floor(r) + 1 : Math.floor(r));
}

// -----------------------------------------------------------------------
// getBodyPart — crit roll then body part selection
// -----------------------------------------------------------------------
function getBodyPart(player, wep) {
  console.log('[getBodyPart] player:', player, '| wep:', wep);
  let crit = player.crit;
  console.log(`Running [getBodyPart] - crit: ${crit}`);

  if (['p','s','m'].includes(wep)) {
    const wi = player[`wep_${wep}`];
    console.log('[getBodyPart] wi:', wi);
    if (wi.bonus  === 'Expose') crit += wi.level;
    if (wi.bonus2 === 'Expose') crit += wi.level2;
  }
  console.log(`Running [getBodyPart] - crit: ${crit}`);

  if (wep === 'p' || wep === 's') {
    const wi = player[`wep_${wep}`];
    console.log('[getBodyPart] wi (laser check):', wi);
    const laserMap = { '1mw Laser':0.02, '5mw Laser':0.03, '30mw Laser':0.04, '100mw Laser':0.05 };
    console.log('[getBodyPart] laserMap:', laserMap);
    crit += (laserMap[wi.mod1_name] || 0) + (laserMap[wi.mod2_name] || 0);
  }
  console.log(`Running [getBodyPart] - crit: ${crit}`);

  const r1 = Math.random();
  console.log(`Running [getBodyPart] - r1: ${r1}`);
  if (r1 < crit) {
    const r2 = Math.random();
    console.log(`Running [getBodyPart] - r2: ${r2}`);
    if (r2 < 0.80) return 'head';
    if (r2 < 0.90) return 'throat';
    return 'heart';
  }

  const r3 = Math.random();
  console.log(`Running [getBodyPart] - r3: ${r3}`);
  if (r3 < 0.25) return 'chest';
  if (r3 < 0.45) return 'legs';
  if (r3 < 0.65) return 'stomach';
  if (r3 < 0.75) return 'arms';
  if (r3 < 0.85) return 'hands';
  if (r3 < 0.95) return 'feet';
  return 'groin';
}

// -----------------------------------------------------------------------
// calcHitChance — returns final hit chance (0-1)
// -----------------------------------------------------------------------
function calcHitChance(attacker, defender, wep, turn) {
  console.log('[calcHitChance] attacker:', attacker, '| defender:', defender, '| wep:', wep, '| turn:', turn);
  let spe_pass = attacker.passive.speed     - attacker.debuff.speed     * (1 - attacker.delta) + attacker.buff.speed;
  console.log(`Running [calcHitChance] - spe_pass: ${spe_pass}`);
  let dex_pass = defender.passive.dexterity - defender.debuff.dexterity * (1 - defender.delta) + defender.buff.dexterity;
  console.log(`Running [calcHitChance] - dex_pass: ${dex_pass}`);

  // Quicken weapon bonus adds to speed passive temporarily
  if (['p','s','m'].includes(wep)) {
    const wi = attacker[`wep_${wep}`];
    console.log('[calcHitChance] wi (quicken check):', wi);
    if (wi.bonus  === 'Quicken') spe_pass += wi.level;
    if (wi.bonus2 === 'Quicken') spe_pass += wi.level2;
    console.log(`Running [calcHitChance] - spe_pass: ${spe_pass}`);
  }

  // Temp debuffs on attacker (smoke/flash reduce speed)
  if (attacker.debuff.temp === 'Smoke Grenade') {
    const s = attacker.speed;
    console.log(`Running [calcHitChance] - s: ${s}`);
    spe_pass = ((1 - (1 - attacker.delta) * 2/3) * (s + spe_pass * s)) / s - 1;
    console.log(`Running [calcHitChance] - spe_pass: ${spe_pass}`);
  } else if (attacker.debuff.temp === 'Flash Grenade') {
    // Private Security Firm reduces flash grenade effectiveness
    const flashMult = (defender.comp.name === 'Private Security Firm' && defender.comp.star >= 3) ? 13/15 : 4/5;
    console.log(`Running [calcHitChance] - flashMult: ${flashMult}`);
    const s = attacker.speed;
    spe_pass = ((1 - (1 - attacker.delta) * flashMult) * (s + spe_pass * s)) / s - 1;
    console.log(`Running [calcHitChance] - spe_pass: ${spe_pass}`);
  }

  // Temp debuffs on defender (tear gas/pepper spray reduce dexterity)
  if (defender.debuff.temp === 'Tear Gas') {
    const s = defender.dexterity;
    console.log(`Running [calcHitChance] - s: ${s}`);
    dex_pass = ((1 - (1 - defender.delta) * 2/3) * (s + dex_pass * s)) / s - 1;
    console.log(`Running [calcHitChance] - dex_pass: ${dex_pass}`);
  } else if (defender.debuff.temp === 'Pepper Spray') {
    const s = defender.dexterity;
    console.log(`Running [calcHitChance] - s: ${s}`);
    dex_pass = ((1 - (1 - defender.delta) * 4/5) * (s + dex_pass * s)) / s - 1;
    console.log(`Running [calcHitChance] - dex_pass: ${dex_pass}`);
  }

  const speed     = attacker.speed     * (1 + spe_pass);
  console.log(`Running [calcHitChance] - speed: ${speed}`);
  const dexterity = defender.dexterity * (1 + dex_pass);
  console.log(`Running [calcHitChance] - dexterity: ${dexterity}`);

  const ratio = speed / dexterity;
  console.log(`Running [calcHitChance] - ratio: ${ratio}`);
  let bhc;
  if      (ratio <= 1/64) bhc = 0;
  else if (ratio <= 1)    bhc = 50/7 * (8 * Math.sqrt(ratio) - 1);
  else if (ratio < 64)    bhc = 100 - 50/7 * (8 * Math.sqrt(1/ratio) - 1);
  else                    bhc = 100;
  console.log(`Running [calcHitChance] - bhc: ${bhc}`);

  // Base accuracy
  let accuracy;
  if      (wep === 'fist') accuracy = 50;
  else if (wep === 'kick') accuracy = 40.71;
  else                     accuracy = attacker[`wep_${wep}`].acc;
  console.log(`Running [calcHitChance] - accuracy: ${accuracy}`);

  // Merit accuracy bonus by weapon type
  if (['p','s','m','t'].includes(wep)) {
    const wi      = attacker[`wep_${wep}`];
    console.log('[calcHitChance] wi (merit acc):', wi);
    const wtype   = wi.info ? wi.info.weapon_type : '';
    console.log(`Running [calcHitChance] - wtype: ${wtype}`);
    accuracy += (attacker.merit[wtype] || 0) * 0.2;
    console.log(`Running [calcHitChance] - accuracy: ${accuracy}`);

    // Education weapon type proficiency: +1 accuracy if trained
    if (wtype && attacker.edu[wtype]) accuracy += 1;
    console.log(`Running [calcHitChance] - accuracy: ${accuracy}`);
  }

  // Faction aggressive accuracy bonus
  accuracy += attacker.faction_agg.acc;
  console.log(`Running [calcHitChance] - accuracy: ${accuracy}`);

  // Gun mod accuracy bonuses
  if (wep === 'p' || wep === 's') {
    const wi = attacker[`wep_${wep}`];
    console.log('[calcHitChance] wi (mod acc):', wi);
    const sightMap = {
      'Reflex Sight':1, 'Holographic Sight':1.25, 'Acog Sight':1.5, 'Thermal Sight':1.75,
      'Custom Grip':0.75, 'Bipod':1.75, 'Tripod':2,
      'Standard Brake':1, 'Heavy Duty Brake':1.25, 'Tactical Brake':1.5,
    };
    console.log(`Running [calcHitChance] - sightMap[wi.mod1_name]: ${sightMap[wi.mod1_name]}, sightMap[wi.mod2_name]: ${sightMap[wi.mod2_name]}`);
    accuracy += (sightMap[wi.mod1_name] || 0) + (sightMap[wi.mod2_name] || 0);
    console.log(`Running [calcHitChance] - accuracy: ${accuracy}`);

    // Trigger mods only on turn 1
    if ((wi.mod1_name === 'Adjustable Trigger' || wi.mod2_name === 'Adjustable Trigger') && turn === 1) accuracy += 5;
    console.log(`Running [calcHitChance] - accuracy: ${accuracy}`);
    if ((wi.mod1_name === 'Hair Trigger'        || wi.mod2_name === 'Hair Trigger')        && turn === 1) accuracy += 7.5;
    console.log(`Running [calcHitChance] - accuracy: ${accuracy}`);

    // Tracer ammo accuracy bonus
    if (wi.s_ammo === 'TR') accuracy += 10;
    console.log(`Running [calcHitChance] - accuracy: ${accuracy}`);
  }

  // Weapon exp accuracy bonus (exp stored as level/100, so level*2 = exp*2*100)
  if (['p','s','m'].includes(wep)) {
    const wi = attacker[`wep_${wep}`];
    console.log('[calcHitChance] wi (exp acc):', wi);
    accuracy += wi.exp * 2;
    console.log(`Running [calcHitChance] - wi.exp: ${wi.exp}`);
    console.log(`Running [calcHitChance] - accuracy: ${accuracy}`);

    // Frenzy accuracy multiplier (melee only, consecutive hits)
    if (wep === 'm') {
      if (wi.bonus  === 'Frenzy' && attacker.last_wep === 'm' && attacker.last_wep_hit) accuracy += wi.level  * accuracy;
      console.log(`Running [calcHitChance] - accuracy: ${accuracy}`);
      if (wi.bonus2 === 'Frenzy' && attacker.last_wep === 'm' && attacker.last_wep_hit) accuracy += wi.level2 * accuracy;
      console.log(`Running [calcHitChance] - accuracy: ${accuracy}`);
    }
  }

  // Firework Stand: Flamethrower accuracy bonus
  console.log('[calcHitChance] attacker.comp:', attacker.comp);
  if (attacker.comp.name === 'Firework Stand' && attacker.comp.star >= 5) {
    if (wep === 's' && attacker.wep_s.name === 'Flamethrower') accuracy += 10;
    console.log(`Running [calcHitChance] - accuracy: ${accuracy}`);
  }

  // Final hit chance formula
  let fhc;
  console.log(`Running [calcHitChance] - bhc: ${bhc}, accuracy: ${accuracy}`);
  if (bhc >= 50) fhc = bhc + ((accuracy - 50) / 50) * (100 - bhc);
  else           fhc = bhc + ((accuracy - 50) / 50) * bhc;
  console.log(`Running [calcHitChance] - fhc: ${fhc}`);
  fhc /= 100;
  console.log(`Running [calcHitChance] - fhc: ${fhc}`);

  // Weapon bonus modifiers to hit chance
  if (['p','s','m'].includes(wep)) {
    const wi = attacker[`wep_${wep}`];
    console.log('[calcHitChance] wi (bonus fhc):', wi);
    if (wi.bonus  === 'Berserk') fhc -= wi.level  / 2;
    console.log(`Running [calcHitChance] - fhc: ${fhc}`);
    if (wi.bonus2 === 'Berserk') fhc -= wi.level2 / 2;
    console.log(`Running [calcHitChance] - fhc: ${fhc}`);
    if (wi.bonus  === 'Grace')   fhc += wi.level;
    console.log(`Running [calcHitChance] - fhc: ${fhc}`);
    if (wi.bonus2 === 'Grace')   fhc += wi.level2;
    console.log(`Running [calcHitChance] - fhc: ${fhc}`);
    if (wi.bonus  === 'Focus' && attacker.focus) fhc += wi.level  * attacker.focus;
    console.log(`Running [calcHitChance] - fhc: ${fhc}`);
    if (wi.bonus2 === 'Focus' && attacker.focus) fhc += wi.level2 * attacker.focus;
    console.log(`Running [calcHitChance] - fhc: ${fhc}`);
  }

  return Math.max(0, Math.min(1, fhc));
}

// -----------------------------------------------------------------------
// calcDamage — returns { damage, armor_used, punctured }
// -----------------------------------------------------------------------
function calcDamage(attacker, defender, bodyPart, wep) {
  console.log('[calcDamage] attacker:', attacker, '| defender:', defender, '| bodyPart:', bodyPart, '| wep:', wep);
  let str_pass = attacker.passive.strength - attacker.debuff.strength * (1 - attacker.delta) + attacker.buff.strength;
  console.log(`Running [calcDamage] - str_pass: ${str_pass}`);
  let def_pass = defender.passive.defense  - defender.debuff.defense  * (1 - defender.delta) + defender.buff.defense;
  console.log(`Running [calcDamage] - def_pass: ${def_pass}`);

  // Empower weapon bonus adds to strength passive
  if (wep === 'm') {
    const wi = attacker.wep_m;
    console.log('[calcDamage] wi (empower):', wi);
    if (wi.bonus  === 'Empower') str_pass += wi.level;
    console.log(`Running [calcDamage] - str_pass: ${str_pass}`);
    if (wi.bonus2 === 'Empower') str_pass += wi.level2;
    console.log(`Running [calcDamage] - str_pass: ${str_pass}`);
  }

  const strength = attacker.strength * (1 + str_pass);
  console.log(`Running [calcDamage] - strength: ${strength}`);
  const defense  = defender.defense  * (1 + def_pass);
  console.log(`Running [calcDamage] - defense: ${defense}`);

  // Defense/Strength mitigation (logarithmic)
  const ratio = defense / strength;
  console.log(`Running [calcDamage] - ratio: ${ratio}`);
  let mitigation;
  if      (ratio <= 1/32) mitigation = 0;
  else if (ratio <= 1)    mitigation = 50 / Math.log(32) * Math.log(ratio) + 50;
  else if (ratio < 14)    mitigation = 50 / Math.log(14) * Math.log(ratio) + 50;
  else                    mitigation = 100;
  console.log(`Running [calcDamage] - mitigation: ${mitigation}`);

  // Weapon damage value
  let wep_dmg;
  if      (wep === 'fist') wep_dmg = 10;
  else if (wep === 'kick') wep_dmg = 30;
  else                     wep_dmg = attacker[`wep_${wep}`].dmg;
  console.log(`Running [calcDamage] - wep_dmg: ${wep_dmg}`);

  // Base damage formula (uses effective strength)
  let damage = 7 * (Math.log10(strength / 10) ** 2) + 27 * Math.log10(strength / 10) + 30;
  console.log(`Running [calcDamage] - damage: ${damage}`);
  damage *= wep_dmg / 10;
  console.log(`Running [calcDamage] - damage: ${damage}`);
  damage *= (1 - mitigation / 100);
  console.log(`Running [calcDamage] - damage: ${damage}`);
  damage /= 3.5;
  console.log(`Running [calcDamage] - damage: ${damage}`);

  // Body part multiplier
  const partMult = {
    head:3.5, throat:3.5, heart:3.5,
    chest:2.0, stomach:2.0, groin:2.0,
    legs:1.0, arms:1.0,
    hands:0.7, feet:0.7,
  };
  console.log(`Running [calcDamage] - partMult[bodyPart]: ${partMult[bodyPart]}`);
  damage *= (partMult[bodyPart] || 1.0);
  console.log(`Running [calcDamage] - damage: ${damage}`);

  // ---- dmg_passive multiplier (starts at 1.0) ----
  let dmg_passive = 1;
  console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);

  // Fist bonus from education
  if (wep === 'fist' && attacker.edu.fist_dmg) dmg_passive += 1;
  console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);
  console.log('[calcDamage] attacker.comp:', attacker.comp);

  // Furniture Store star 10: fist/kick +1 dmg_passive
  if ((wep === 'fist' || wep === 'kick') && attacker.comp.name === 'Furniture Store' && attacker.comp.star === 10) {
    dmg_passive += 1;
    console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);
  }

  // Ranged: suppressor, choke, and ammo type modifiers
  if (wep === 'p' || wep === 's') {
    const wi          = attacker[`wep_${wep}`];
    console.log('[calcDamage] wi (ranged mods):', wi);
    const suppressors = ['Small Suppressor', 'Standard Suppressor', 'Large Suppressor'];
    if (suppressors.includes(wi.mod1_name) || suppressors.includes(wi.mod2_name)) dmg_passive -= 0.05;
    console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);

    const chokeMap = { 'Skeet Choke':0.06, 'Improved Choke':0.08, 'Full Choke':0.10 };
    dmg_passive += (chokeMap[wi.mod1_name] || 0) + (chokeMap[wi.mod2_name] || 0);
    console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);

    if (wi.s_ammo === 'HP') dmg_passive += 0.50;
    console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);
    if (wi.s_ammo === 'IN') dmg_passive += 0.40;
    console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);
  }

  // Melee: education bonuses + company bonuses
  if (wep === 'm') {
    console.log(`Running [calcDamage] - attacker.edu.melee_dmg: ${attacker.edu.melee_dmg}`);
    dmg_passive += attacker.edu.melee_dmg;
    console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);
    if (attacker.wep_m.info.jap) dmg_passive += attacker.edu.jap;
    console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);

    // Hair Salon star 10: slashing melee +20%
    if (attacker.wep_m.info.weapon_type === 'Slashing' &&
        attacker.comp.name === 'Hair Salon' && attacker.comp.star === 10) {
      dmg_passive += 0.20;
    }
    console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);

    // Pub / Restaurant star>=3: melee dmg +10%
    if ((attacker.comp.name === 'Pub' || attacker.comp.name === 'Restaurant') && attacker.comp.star >= 3) {
      dmg_passive += 0.10;
    }
    console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);

    // Ladies Strip Club defender star 10: reduces incoming melee -30%
    if (defender.comp.name === 'Ladies Strip Club' && defender.comp.star === 10) {
      dmg_passive -= 0.30;
    }
    console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);
  }

  // Gun Shop star 10: ranged dmg +10%
  if ((wep === 'p' || wep === 's') && attacker.comp.name === 'Gun Shop' && attacker.comp.star === 10) {
    dmg_passive += 0.10;
  }
  console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);

  // Throat education bonus
  if (bodyPart === 'throat') dmg_passive += attacker.edu.throat_dmg;
  console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);

  // Temp weapon education bonus
  if (wep === 't') dmg_passive += attacker.edu.temp_dmg;
  console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);

  // Molotov and Burn weapon bonus: base burn dmg_passive of +1, modified by company
  const hasBurn = wep === 't'
    ? attacker.wep_t.name === 'Molotov Cocktail'
    : ['p','s','m'].includes(wep) && (attacker[`wep_${wep}`].bonus === 'Burn' || attacker[`wep_${wep}`].bonus2 === 'Burn');
  console.log(`Running [calcDamage] - hasBurn: ${hasBurn}`);

  if (hasBurn) {
    let burn_passive = 1;
    console.log(`Running [calcDamage] - burn_passive: ${burn_passive}`);
    if (attacker.comp.name === 'Gas Station' && attacker.comp.star === 10) burn_passive += 0.50;
    console.log(`Running [calcDamage] - burn_passive: ${burn_passive}`);
    if (defender.comp.name === 'Gas Station' && defender.comp.star >= 7)   burn_passive -= 0.50;
    console.log(`Running [calcDamage] - burn_passive: ${burn_passive}`);
    dmg_passive += burn_passive;
    console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);
  }

  // Faction damage bonus
  dmg_passive += attacker.faction_agg.dmg;
  console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);

  // Education weapons expert +1%
  dmg_passive += attacker.edu.dmg;
  console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);

  // Property boost
  dmg_passive += attacker.property;
  console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);

  // Merit damage bonus by weapon type (1% per level)
  if (['p','s','m','t'].includes(wep)) {
    const wtype = attacker[`wep_${wep}`].info ? attacker[`wep_${wep}`].info.weapon_type : '';
    console.log(`Running [calcDamage] - wtype: ${wtype}`);
    dmg_passive += (attacker.merit[wtype] || 0) * 0.01;
    console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);
  }

  // Firework Stand: Flamethrower dmg +25%
  if (attacker.comp.name === 'Firework Stand' && attacker.comp.star >= 5) {
    if (wep === 's' && attacker.wep_s.name === 'Flamethrower') dmg_passive += 0.25;
    console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);
  }

  // Weapon exp damage bonus (exp stored as level/100, mult = level*0.1)
  if (['p','s','m','t'].includes(wep)) {
    dmg_passive += attacker[`wep_${wep}`].exp * 0.1;
    console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);
  }

  // Wind-up: damage bonus on the turn after winding up
  if (attacker.winded_up === wep) {
    console.log(`Running [calcDamage] - attacker.winded_up: ${attacker.winded_up}`);
    const wi = attacker[`wep_${wep}`];
    console.log('[calcDamage] wi (wind-up):', wi);
    dmg_passive += wi.bonus === 'Wind-up' ? wi.level : wi.level2;
    console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);
    attacker.winded_up = ''; // FIX: reset after use
    console.log(`Running [calcDamage] - attacker.winded_up: ${attacker.winded_up}`);
  }

  // Weapon bonuses affecting dmg_passive
  if (['p','s','m'].includes(wep)) {
    const wi = attacker[`wep_${wep}`];
    console.log('[calcDamage] wi (bonus dmg):', wi);

    const applyBonusDmg = (bonus, level) => {
      console.log(`Running [calcDamage] - Starting [applyBonusDmg] (bonus: ${bonus}, level: ${level})`);
      if      (bonus === 'Assassinate' && attacker._turn === 1)                           dmg_passive += level;
      else if (bonus === 'Achilles'    && bodyPart === 'feet')                            dmg_passive += level;
      else if (bonus === 'Roshambo'    && bodyPart === 'groin')                           dmg_passive += level;
      else if (bonus === 'Throttle'    && bodyPart === 'throat')                          dmg_passive += level;
      else if (bonus === 'Crusher'     && bodyPart === 'head')                            dmg_passive += level;
      else if (bonus === 'Cupid'       && bodyPart === 'heart')                           dmg_passive += level;
      else if (bonus === 'Deadeye'     && ['head','throat','heart'].includes(bodyPart))   dmg_passive += level;
      else if (bonus === 'Blindside'   && defender.health === defender.max_hp)            dmg_passive += level;
      else if (bonus === 'Comeback'    && attacker.health < 0.25 * attacker.max_hp)       dmg_passive += level;
      else if (bonus === 'Deadly'      && Math.random() < level)                          dmg_passive += 5;
      else if (bonus === 'Powerful')                                                       dmg_passive += level;
      else if (bonus === 'Specialist')                                                     dmg_passive += level;
      else if (bonus === 'Berserk')                                                        dmg_passive += level;
      else if (bonus === 'Grace')                                                          dmg_passive -= level / 2;
      else if (bonus === 'Smurf') {
        const sl = Math.min(0, defender.level - attacker.level);
        dmg_passive += sl * level;
      }
      else if (bonus === 'Finale')  dmg_passive += level * attacker.finale;
      else if (bonus === 'Frenzy') {
        if (attacker.last_wep === wep && attacker.last_wep_hit) {
          attacker.frenzy++;
          dmg_passive += level * attacker.frenzy;
        } else {
          attacker.frenzy = 0;
        }
      }
      else if (bonus === 'Double-edged' && Math.random() < level) {
        dmg_passive += 1;
        attacker.double_edge = true;
      }
    };

    applyBonusDmg(wi.bonus,  wi.level);
    console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);
    applyBonusDmg(wi.bonus2, wi.level2);
    console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);
  }

  console.log(`Running [calcDamage] - defender.eviscerated: ${defender.eviscerated}`);
  console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);
  // Eviscerate: defender takes extra damage proportional to eviscerate level
  if (defender.eviscerated) dmg_passive += defender.eviscerated;
  console.log(`Running [calcDamage] - dmg_passive: ${dmg_passive}`);

  // Apply armor mitigation
  const { mitigation_s, mitigation_b, armor_used, punctured } = getArmorMitigation(attacker, defender, bodyPart, wep);
  console.log(`Running [calcDamage] - mitigation_s: ${mitigation_s}, mitigation_b: ${mitigation_b}, armor_used: ${armor_used}, punctured: ${punctured}`);

  damage = damage * dmg_passive;
  console.log(`Running [calcDamage] - damage: ${damage}`);
  damage *= (1 - mitigation_b);
  console.log(`Running [calcDamage] - damage: ${damage}`);
  damage *= (1 - mitigation_s);
  console.log(`Running [calcDamage] - damage: ${damage}`);

    // ±5% RNG variance
  const variance = damage * 0.05 * Math.random();
  console.log(`Running [calcDamage] - variance: ${variance}`);
  damage += Math.random() < 0.5 ? -variance : variance;
  console.log(`Running [calcDamage] - damage: ${damage}`);

  damage  = Math.floor(damage);
  console.log(`Running [calcDamage] - damage: ${damage}`);

  return { damage: Math.max(0, damage), armor_used, punctured };
}

// -----------------------------------------------------------------------
// applyBonusOnHit — apply on-hit weapon bonus effects (DOT, debuffs, status)
// isBonus1: true = check wi.bonus, false = check wi.bonus2
// -----------------------------------------------------------------------
function applyBonusOnHit(attacker, defender, wep, bodyPart, damage, turn, isBonus1) {
  console.log('[applyBonusOnHit] attacker:', attacker, '| defender:', defender, '| wep:', wep, '| bodyPart:', bodyPart, '| damage:', damage, '| turn:', turn, '| isBonus1:', isBonus1);
  const wi    = attacker[`wep_${wep}`];
  console.log('[applyBonusOnHit] wi:', wi);
  const bonus = isBonus1 ? wi.bonus  : wi.bonus2;
  console.log(`Running [applyBonusOnHit] - bonus: ${bonus}`);
  const level = isBonus1 ? wi.level  : wi.level2;
  console.log(`Running [applyBonusOnHit] - level: ${level}`);
  const msgs  = [];
  if (!bonus) return msgs;

  if (bonus === 'Demoralize' && defender.demoralized < 5 && Math.random() < level) {
    ['strength','defense','speed','dexterity'].forEach(s => defender.debuff[s] -= 0.1);
    console.log('[applyBonusOnHit] defender.debuff:', defender.debuff);
    defender.demoralized++;
    console.log('[applyBonusOnHit] defender.demoralized:', defender.demoralized);
    msgs.push({ text:`${defender.name} is demoralized.`, cls:'debuff' });
    console.log('[applyBonusOnHit] msgs:', msgs);
  }
  else if (bonus === 'Motivation' && attacker.motivated < 5 && Math.random() < level) {
    ['strength','defense','speed','dexterity'].forEach(s => attacker.buff[s] += 0.1);
    console.log('[applyBonusOnHit] attacker.buff:', attacker.buff);
    attacker.motivated++;
    console.log('[applyBonusOnHit] attacker.motivated:', attacker.motivated);
    msgs.push({ text:`${attacker.name} is motivated.`, cls:'buff' });
    console.log('[applyBonusOnHit] msgs:', msgs);
  }
  else if (bonus === 'Freeze' && defender.frozen < 1 && Math.random() < level) {
    defender.debuff.speed -= 0.5;
    console.log(`Running [applyBonusOnHit] - defender.debuff.speed: ${defender.debuff.speed}`);
    defender.debuff.dexterity -= 0.5;
    console.log(`Running [applyBonusOnHit] - defender.debuff.dexterity: ${defender.debuff.dexterity}`);
    defender.frozen++;
    console.log(`Running [applyBonusOnHit] - defender.frozen: ${defender.frozen}`);
    msgs.push({ text:`${defender.name} is frozen.`, cls:'debuff' });
    console.log('[applyBonusOnHit] msgs:', msgs);
  }
  else if (bonus === 'Wither' && defender.withered < 3 && Math.random() < level) {
    defender.debuff.strength -= 0.25;
    console.log(`Running [applyBonusOnHit] - defender.debuff.strength: ${defender.debuff.strength}`);
    defender.withered++;
    console.log(`Running [applyBonusOnHit] - defender.withered: ${defender.withered}`);
    msgs.push({ text:`${defender.name} is withered.`, cls:'debuff' });
    console.log('[applyBonusOnHit] msgs:', msgs);
  }
  else if (bonus === 'Weaken' && defender.weakened < 3 && Math.random() < level) {
    defender.debuff.defense -= 0.25;
    console.log(`Running [applyBonusOnHit] - defender.debuff.defense: ${defender.debuff.defense}`);
    defender.weakened++;
    console.log(`Running [applyBonusOnHit] - defender.weakened: ${defender.weakened}`);
    msgs.push({ text:`${defender.name} is weakened.`, cls:'debuff' });
    console.log('[applyBonusOnHit] msgs:', msgs);
  }
  else if (bonus === 'Slow' && defender.slowed < 3 && Math.random() < level) {
    defender.debuff.speed -= 0.25;
    console.log(`Running [applyBonusOnHit] - defender.debuff.speed: ${defender.debuff.speed}`);
    defender.slowed++;
    console.log(`Running [applyBonusOnHit] - defender.slowed: ${defender.slowed}`);
    msgs.push({ text:`${defender.name} is slowed.`, cls:'debuff' });
    console.log('[applyBonusOnHit] msgs:', msgs);
  }
  else if (bonus === 'Cripple' && defender.crippled < 3 && Math.random() < level) {
    defender.debuff.dexterity -= 0.25;
    console.log(`Running [applyBonusOnHit] - defender.debuff.dexterity: ${defender.debuff.dexterity}`);
    defender.crippled++;
    console.log(`Running [applyBonusOnHit] - defender.crippled: ${defender.crippled}`);
    msgs.push({ text:`${defender.name} is crippled.`, cls:'debuff' });
    console.log('[applyBonusOnHit] msgs:', msgs);
  }
  else if (bonus === 'Eviscerate') {
    console.log(`Running [applyBonusOnHit] - defender.eviscerated: ${defender.eviscerated}, level: ${level}`);
    if (level > defender.eviscerated) {
      defender.eviscerated = level;
      console.log(`Running [applyBonusOnHit] - defender.eviscerated: ${defender.eviscerated}`);
      msgs.push({ text:`${defender.name} is eviscerated.`, cls:'debuff' });
      console.log('[applyBonusOnHit] msgs:', msgs);
    }
  }
  else if (bonus === 'Paralyze' && Math.random() < level) {
    defender.paralyzed = true;
    console.log(`Running [applyBonusOnHit] - defender.paralyzed: ${defender.paralyzed}`);
    msgs.push({ text:`${defender.name} is paralyzed.`, cls:'debuff' });
    console.log('[applyBonusOnHit] msgs:', msgs);
  }
  else if (bonus === 'Stun' && Math.random() < level) {
    defender.stunned = true;
    console.log(`Running [applyBonusOnHit] - defender.stunned: ${defender.stunned}`);
    msgs.push({ text:`${defender.name} is stunned.`, cls:'debuff' });
    console.log('[applyBonusOnHit] msgs:', msgs);
  }
  else if (bonus === 'Suppress' && Math.random() < level) {
    defender.suppressed = true;
    console.log(`Running [applyBonusOnHit] - defender.suppressed: ${defender.suppressed}`);
    msgs.push({ text:`${defender.name} is suppressed.`, cls:'debuff' });
    console.log('[applyBonusOnHit] msgs:', msgs);
  }
  else if (bonus === 'Bleed' && Math.random() < level) {
    defender.bleed_turn  = 9;
    console.log(`Running [applyBonusOnHit] - defender.bleed_turn: ${defender.bleed_turn}`);
    defender.bleed_dmg   = damage;
    console.log(`Running [applyBonusOnHit] - defender.bleed_dmg: ${defender.bleed_dmg}`);
    defender.bleed_apply = turn;
    console.log(`Running [applyBonusOnHit] - defender.bleed_apply: ${defender.bleed_apply}`);
    msgs.push({ text:`${defender.name} started bleeding.`, cls:'bleed' });
    console.log('[applyBonusOnHit] msgs:', msgs);
  }
  else if (bonus === 'Poison' && Math.random() < level) {
    defender.poison_turn  = 19;
    console.log(`Running [applyBonusOnHit] - defender.poison_turn: ${defender.poison_turn}`);
    defender.poison_dmg   = damage;
    console.log(`Running [applyBonusOnHit] - defender.poison_dmg: ${defender.poison_dmg}`);
    defender.poison_apply = turn;
    console.log(`Running [applyBonusOnHit] - defender.poison_apply: ${defender.poison_apply}`);
    msgs.push({ text:`${defender.name} is poisoned.`, cls:'poison' });
    console.log('[applyBonusOnHit] msgs:', msgs);
  }
  else if (bonus === 'Burn' && Math.random() < level) {
    defender.burn_turn  = 3;
    console.log(`Running [applyBonusOnHit] - defender.burn_turn: ${defender.burn_turn}`);
    defender.burn_dmg   = damage;
    console.log(`Running [applyBonusOnHit] - defender.burn_dmg: ${defender.burn_dmg}`);
    defender.burn_apply = turn;
    console.log(`Running [applyBonusOnHit] - defender.burn_apply: ${defender.burn_apply}`);
    msgs.push({ text:`${defender.name} is burning.`, cls:'burn' });
    console.log('[applyBonusOnHit] msgs:', msgs);
  }
  else if (bonus === 'Lacerate' && Math.random() < level) {
    defender.lacerate_turn  = 9;
    console.log(`Running [applyBonusOnHit] - defender.lacerate_turn: ${defender.lacerate_turn}`);
    defender.lacerate_dmg   = damage;
    console.log(`Running [applyBonusOnHit] - defender.lacerate_dmg: ${defender.lacerate_dmg}`);
    defender.lacerate_apply = turn;
    console.log(`Running [applyBonusOnHit] - defender.lacerate_apply: ${defender.lacerate_apply}`);
    msgs.push({ text:`${defender.name} is lacerated.`, cls:'bleed' });
    console.log('[applyBonusOnHit] msgs:', msgs);
  }
  else if (bonus === 'Toxin' && Math.random() < level) {
    const r = Math.random();
    console.log(`Running [applyBonusOnHit] - r: ${r}`);
    if (r < 0.25 && defender.withered < 3) {
      defender.debuff.strength -= 0.25; defender.withered++;
      console.log(`Running [applyBonusOnHit] - defender.debuff.strength: ${defender.debuff.strength}, defender.withered: ${defender.withered}`);
      msgs.push({ text:`${defender.name} is withered.`, cls:'debuff' });
    } else if (r < 0.50 && defender.weakened < 3) {
      defender.debuff.defense -= 0.25; defender.weakened++;
      console.log(`Running [applyBonusOnHit] - defender.debuff.defense: ${defender.debuff.defense}, defender.weakened: ${defender.weakened}`);
      msgs.push({ text:`${defender.name} is weakened.`, cls:'debuff' });
    } else if (r < 0.75 && defender.slowed < 3) {
      defender.debuff.speed -= 0.25; defender.slowed++;
      console.log(`Running [applyBonusOnHit] - defender.debuff.speed: ${defender.debuff.speed}, defender.slowed: ${defender.slowed}`);
      msgs.push({ text:`${defender.name} is slowed.`, cls:'debuff' });
    } else if (defender.crippled < 3) {
      defender.debuff.dexterity -= 0.25; defender.crippled++;
      console.log(`Running [applyBonusOnHit] - defender.debuff.dexterity: ${defender.debuff.dexterity}, defender.crippled: ${defender.crippled}`);
      msgs.push({ text:`${defender.name} is crippled.`, cls:'debuff' });
    }
    console.log('[applyBonusOnHit] msgs:', msgs);
  }

  return msgs;
}

// -----------------------------------------------------------------------
// doAttack — main attack dispatcher
// Returns { msgs: [{text, cls}] }
// bonus_hit = true means this is a secondary hit (Double Tap / Fury / Rage / Blindfire)
// -----------------------------------------------------------------------
function doAttack(attacker, defender, wep, wep2, turn, bonus_hit) {
  console.log('[doAttack] attacker:', attacker, '| defender:', defender, '| wep:', wep, '| wep2:', wep2, '| turn:', turn, '| bonus_hit:', bonus_hit);
  const msgs = [];
  attacker.double_edge = false;

  // Decrement disarm timers
  for (const w of ['p','s','m']) {
    if (attacker[`wep_${w}`].disarmed > 0) attacker[`wep_${w}`].disarmed--;
    console.log(`Running [doAttack] - attacker[wep_${w}].disarmed: ${attacker[`wep_${w}`].disarmed}`);
  }

  // Finale / Focus tracking (not on bonus hits, only primary turn attack)
  if (!bonus_hit) {
    if (turn !== 1 && attacker.last_wep && ['p','s','m'].includes(attacker.last_wep)) {
      const lwi = attacker[`wep_${attacker.last_wep}`];
      console.log('[doAttack] lwi:', lwi);
      if (lwi.bonus === 'Finale') attacker.finale = 0;
      else attacker.finale++;
      console.log(`Running [doAttack] - attacker.finale: ${attacker.finale}`);
      if (lwi.bonus === 'Focus' && !attacker.last_wep_hit) attacker.focus++;
      else attacker.focus = 0;
      console.log(`Running [doAttack] - attacker.focus: ${attacker.focus}`);
    } else if (turn === 1) {
      attacker.finale = 0;
      console.log(`Running [doAttack] - attacker.finale: ${attacker.finale}`);
      attacker.focus  = 0;
      console.log(`Running [doAttack] - attacker.focus: ${attacker.focus}`);
    }
  }

  attacker.last_wep     = wep;
  console.log(`Running [doAttack] - attacker.last_wep: ${attacker.last_wep}`);
  attacker.last_wep_hit = false;
  attacker._turn        = turn; // used by calcDamage for Assassinate check
  console.log(`Running [doAttack] - attacker._turn: ${attacker._turn}`);

  // Status effects that skip the turn
  if (attacker.paralyzed && Math.random() < 0.5) {
    return { msgs: [{ text:`${attacker.name} is paralyzed and loses their turn.`, cls:'miss' }] };
  }
  if (attacker.suppressed && Math.random() < 0.25) {
    return { msgs: [{ text:`${attacker.name} is suppressed and loses their turn.`, cls:'miss' }] };
  }
  if (attacker.stunned) {
    attacker.stunned = false;
    return { msgs: [{ text:`${attacker.name} is stunned and loses their turn.`, cls:'miss' }] };
  }

  // ----------------------------------------------------------------
  // TEMP ITEMS
  // ----------------------------------------------------------------
  if (wep === 't') {
    const tn = attacker.wep_t.name;
    console.log(`Running [doAttack] - tn: ${tn}`);
    if (!tn || tn === 'None') {
      return { msgs: [{ text:`${attacker.name} has no temp item.`, cls:'miss' }] };
    }
    attacker.wep_t.used = true;
    console.log(`Running [doAttack] - attacker.wep_t.used: ${attacker.wep_t.used}`);

    // Utility debuffs (applied to defender)
    if (['Smoke Grenade','Flash Grenade'].includes(tn)) {
      defender.debuff.temp = tn;
      console.log(`Running [doAttack] - defender.debuff.temp: ${defender.debuff.temp}`);
      msgs.push({ text:`${attacker.name} used ${tn} on ${defender.name}.`, cls:'debuff' });
      console.log('[doAttack] msgs:', msgs);
    }
    else if (['Tear Gas','Pepper Spray'].includes(tn)) {
      if(['Irrepressible', 'Invulnerable'].includes(defender.armor['helmet'].bonus.name)){ //Vanguard/ Delta Helmet
        console.log(`Running [doAttack] - defender.debuff.temp: ${defender.debuff.temp}`);
        msgs.push({ text:`${attacker.name} used ${tn} on ${defender.name} but it was ineffective.`, cls:'debuff' });
        console.log('[doAttack] msgs:', msgs);
      }
      else{
        defender.debuff.temp = tn;
        console.log(`Running [doAttack] - defender.debuff.temp: ${defender.debuff.temp}`);
        msgs.push({ text:`${attacker.name} used ${tn} on ${defender.name}.`, cls:'debuff' });
        console.log('[doAttack] msgs:', msgs);
      }
    }
    else if (tn === 'Melatonin') { // Steroids (buff attacker)
      let eff = 5;
      if (attacker.edu.steroid) eff *= 1.1;
      console.log(`Running [doAttack] - eff: ${eff}`);
      attacker.passive.speed += eff;
      console.log(`Running [doAttack] - attacker.passive.speed: ${attacker.passive.speed}`);
      msgs.push({ text:`${attacker.name} used Melatonin (+${eff.toFixed(1)} speed).`, cls:'buff' });
      console.log('[doAttack] msgs:', msgs);

    } else if (tn === 'Serotonin') {
      let eff = 3;
      if (attacker.comp.name === 'Ladies Strip Club' && attacker.comp.star >= 5) eff *= 1.5;
      if (attacker.edu.steroid) eff *= 1.1;
      console.log(`Running [doAttack] - eff: ${eff}`);
      attacker.passive.defense += eff;
      console.log(`Running [doAttack] - attacker.passive.defense: ${attacker.passive.defense}`);
      const hg = Math.min(0.25 * attacker.max_hp, attacker.max_hp - attacker.health);
      console.log(`Running [doAttack] - hg: ${hg}`);
      attacker.health += hg;
      console.log(`Running [doAttack] - attacker.health: ${attacker.health}`);
      msgs.push({ text:`${attacker.name} used Serotonin, healed ${Math.floor(hg)} HP (+${eff.toFixed(1)} def).`, cls:'buff' });
      console.log('[doAttack] msgs:', msgs);

    } else if (tn === 'Epinephrine') {
      let eff = 5;
      if (attacker.comp.name === 'Amusement Park' && attacker.comp.star >= 7) eff *= 1.25;
      if (attacker.edu.steroid) eff *= 1.1;
      console.log(`Running [doAttack] - eff: ${eff}`);
      attacker.passive.strength += eff;
      console.log(`Running [doAttack] - attacker.passive.strength: ${attacker.passive.strength}`);
      msgs.push({ text:`${attacker.name} used Epinephrine (+${eff.toFixed(1)} str).`, cls:'buff' });
      console.log('[doAttack] msgs:', msgs);

    } else if (tn === 'Tyrosine') {
      let eff = 5;
      if (attacker.comp.name === 'Gents Strip Club' && attacker.comp.star >= 5) eff *= 1.5;
      if (attacker.edu.steroid) eff *= 1.1;
      console.log(`Running [doAttack] - eff: ${eff}`);
      attacker.passive.dexterity += eff;
      console.log(`Running [doAttack] - attacker.passive.dexterity: ${attacker.passive.dexterity}`);
      msgs.push({ text:`${attacker.name} used Tyrosine (+${eff.toFixed(1)} dex).`, cls:'buff' });
      console.log('[doAttack] msgs:', msgs);

    // Damaging throwables
    } else if (['Molotov Cocktail','Grenade','HEG'].includes(tn)) {
      const hc = calcHitChance(attacker, defender, 't', turn);
      console.log(`Running [doAttack] - hc: ${hc}`);
      if (Math.random() < hc) {
        const { damage } = calcDamage(attacker, defender, 'chest', 't');
        console.log(`Running [doAttack] - damage: ${damage}`);
        defender.health -= damage;
        console.log(`Running [doAttack] - defender.health: ${defender.health}`);
        attacker.wep_t.tot_dmg = (attacker.wep_t.tot_dmg || 0) + damage;
        console.log(`Running [doAttack] - attacker.wep_t.tot_dmg: ${attacker.wep_t.tot_dmg}`);
        if (tn === 'Molotov Cocktail') {
          defender.severe_burn_turn  = 3;
          console.log(`Running [doAttack] - defender.severe_burn_turn: ${defender.severe_burn_turn}`);
          defender.severe_burn_dmg   = damage;
          console.log(`Running [doAttack] - defender.severe_burn_dmg: ${defender.severe_burn_dmg}`);
          defender.severe_burn_apply = turn;
          console.log(`Running [doAttack] - defender.severe_burn_apply: ${defender.severe_burn_apply}`);
          msgs.push({ text:`${attacker.name} threw ${tn} on ${defender.name} for ${damage} dmg (burning).`, cls:'hit' });
          console.log('[doAttack] msgs:', msgs);
        } else {
          msgs.push({ text:`${attacker.name} threw ${tn} on ${defender.name} for ${damage} dmg.`, cls:'hit' });
          console.log('[doAttack] msgs:', msgs);
        }
      } else {
        msgs.push({ text:`${attacker.name} threw ${tn} but missed.`, cls:'miss' });
        console.log('[doAttack] msgs:', msgs);
      }
    }
    return { msgs };
  }

  // ----------------------------------------------------------------
  // FIST / KICK
  // ----------------------------------------------------------------
  if (wep === 'fist' || wep === 'kick') {
    const hc = calcHitChance(attacker, defender, wep, turn);
    console.log(`Running [doAttack] - hc: ${hc}`);
    if (Math.random() < hc) {
      const bp = getBodyPart(attacker, wep);
      console.log(`Running [doAttack] - bp: ${bp}`);
      const { damage } = calcDamage(attacker, defender, bp, wep);
      console.log(`Running [doAttack] - damage: ${damage}`);
      attacker.last_wep_hit = true;
      console.log(`Running [doAttack] - attacker.last_wep_hit: ${attacker.last_wep_hit}`);
      defender.health -= damage;
      console.log(`Running [doAttack] - defender.health: ${defender.health}`);
      msgs.push({ text:`${attacker.name} ${wep}s ${defender.name} on the ${bp} for ${damage} dmg.`, cls: damage > 0 ? 'hit' : 'miss' });
      console.log('[doAttack] msgs:', msgs);
    } else {
      msgs.push({ text:`${attacker.name} ${wep}s but misses ${defender.name}.`, cls:'miss' });
      console.log('[doAttack] msgs:', msgs);
    }
    return { msgs };
  }

  // ----------------------------------------------------------------
  // RANGED (primary 'p' or secondary 's')
  // ----------------------------------------------------------------
  if (wep === 'p' || wep === 's') {
    const wi = attacker[`wep_${wep}`];
    console.log('[doAttack] wi (ranged):', wi);

    // Wind-up check (ranged weapons shouldn't have Wind-up but guard anyway)
    if ((wi.bonus === 'Wind-up' || wi.bonus2 === 'Wind-up') && attacker.winded_up === '') {
      attacker.winded_up = wep;
      console.log(`Running [doAttack] - attacker.winded_up: ${attacker.winded_up}`);
      wi.tot_turn++; wi.tot_miss++;
      console.log(`Running [doAttack] - wi.tot_turn: ${wi.tot_turn}`);
      console.log(`Running [doAttack] - wi.tot_miss: ${wi.tot_miss}`);
      msgs.push({ text:`${attacker.name} winds up ${wi.name}.`, cls:'miss' });
      console.log('[doAttack] msgs:', msgs);
      return { msgs };
    }

    // Ammo check
    if (wi.info.ammo <= 0) {
      // FIX: reload=0 means no reload — weapon is done once clip is empty
      if (wi.reload !== 0 && wi.info.clips > 0) {
        wi.info.ammo = wi.info.clip_size;
        console.log(`Running [doAttack] - wi.info.ammo: ${wi.info.ammo}`);
        wi.info.clips--;
        console.log(`Running [doAttack] - wi.info.clips: ${wi.info.clips}`);
        msgs.push({ text:`${attacker.name} reloaded ${wi.name}.`, cls:'reload' });
        console.log('[doAttack] msgs:', msgs);
        wi.tot_turn++;
        console.log(`Running [doAttack] - wi.tot_turn: ${wi.tot_turn}`);
        return { msgs };
      }
      // Out of ammo (either reload=0 and empty, or no clips left)
      return { msgs: [{ text:`${attacker.name} is out of ammo for ${wi.name}.`, cls:'miss' }] };
    }

    const rounds = Math.min(getRounds(attacker, wep), wi.info.ammo);
      console.log(`Running [doAttack] - rounds: ${rounds}`);
    const hc     = calcHitChance(attacker, defender, wep, turn);
      console.log(`Running [doAttack] - hc: ${hc}`);

    // Sure Shot: chance to force a hit
    const sureShot = (wi.bonus === 'Sure Shot' && Math.random() < wi.level) ||
                     (wi.bonus2 === 'Sure Shot' && Math.random() < wi.level2);
    console.log(`Running [doAttack] - sureShot: ${sureShot}`);

    if (sureShot || Math.random() < hc) {
      wi.info.ammo -= rounds;
      console.log(`Running [doAttack] - wi.info.ammo: ${wi.info.ammo}`);
      attacker.last_wep_hit = true;
      console.log(`Running [doAttack] - attacker.last_wep_hit: ${attacker.last_wep_hit}`);

      const bp = getBodyPart(attacker, wep);
      console.log(`Running [doAttack] - bp: ${bp}`);
      const { damage, armor_used, punctured } = calcDamage(attacker, defender, bp, wep);
      console.log(`Running [doAttack] - damage: ${damage}, armor_used: ${armor_used}, punctured: ${punctured}`);

      // Disarm (not on bonus hit, not on turn 1)
      if (turn !== 1 && damage > 0 && !bonus_hit && ['arms','hands'].includes(bp)) {
        const disarmLv = wi.bonus === 'Disarm' ? wi.level : (wi.bonus2 === 'Disarm' ? wi.level2 : 0);
        console.log(`Running [doAttack] - disarmLv: ${disarmLv}`);
        if (disarmLv && ['p','s','m'].includes(defender.last_wep)) {
          defender[`wep_${defender.last_wep}`].disarmed = disarmLv;
          console.log(`Running [doAttack] - defender[wep_${defender.last_wep}].disarmed: ${defender[`wep_${defender.last_wep}`].disarmed}`);
          msgs.push({ text:`${defender.name}'s ${defender[`wep_${defender.last_wep}`].name} is disarmed.`, cls:'debuff' });
          console.log('[doAttack] msgs:', msgs);
        }
      }

      // Execute: kill exactly to 1 HP
      const execLv = wi.bonus === 'Execute' ? wi.level : (wi.bonus2 === 'Execute' ? wi.level2 : 0);
      console.log(`Running [doAttack] - execLv: ${execLv}`);
      let finalDamage = damage;
      console.log(`Running [doAttack] - finalDamage: ${finalDamage}`);
      if (execLv && defender.health <= execLv * defender.max_hp && !bonus_hit) {
        finalDamage = Math.max(0, defender.health - 1);
        console.log(`Running [doAttack] - finalDamage: ${finalDamage}`);
        msgs.push({ text:`${attacker.name} executes ${defender.name} with ${wi.name} for ${finalDamage} dmg!`, cls:'hit-crit' });
        console.log('[doAttack] msgs:', msgs);
      } else {
        const isCrit = ['head','heart','throat'].includes(bp);
        console.log(`Running [doAttack] - isCrit: ${isCrit}`);
        msgs.push({ text:`${attacker.name} fires ${rounds}rds of ${wi.name} — hits ${bp}${punctured?' (punctured)':''}${sureShot?' (sure shot)':''} for ${finalDamage} dmg.`, cls: isCrit ? 'hit-crit' : 'hit' });
        console.log('[doAttack] msgs:', msgs);
      }

      // On-hit bonuses (not on bonus hits)
      if (damage > 0 && !bonus_hit) {
        msgs.push(...applyBonusOnHit(attacker, defender, wep, bp, damage, turn, true));
        console.log('[doAttack] msgs:', msgs);
        msgs.push(...applyBonusOnHit(attacker, defender, wep, bp, damage, turn, false));
        console.log('[doAttack] msgs:', msgs);
      }

      // EOD check: chance to absorb the hit entirely (Puncture overrides EOD)
      if (!punctured && eodProc(defender, armor_used)) {
        finalDamage = 0;
        console.log(`Running [doAttack] - finalDamage: ${finalDamage}`);
        msgs.push({ text:`${defender.name}'s EOD BLOCKED!`, cls:'buff' });
        console.log('[doAttack] msgs:', msgs);
      }

      // Hazardous: chance to injure attacker
      if (!bonus_hit) {
        const hlv = wi.bonus === 'Hazardous' ? wi.level : (wi.bonus2 === 'Hazardous' ? wi.level2 : 0);
        console.log(`Running [doAttack] - hlv: ${hlv}`);
        if (hlv && Math.random() < hlv) {
          const injury = Math.min(finalDamage / 4, attacker.health - 1);
          console.log(`Running [doAttack] - injury: ${injury}`);
          attacker.health -= injury;
          console.log(`Running [doAttack] - attacker.health : ${attacker.health }`);
          msgs.push({ text:`Hazardous recoil hits ${attacker.name} for ${Math.floor(injury)}.`, cls:'debuff' });
          console.log('[doAttack] msgs:', msgs);
        }
      }

      defender.health -= finalDamage;
      console.log(`Running [doAttack] - defender.health: ${defender.health}`);
      wi.tot_turn++;
      console.log(`Running [doAttack] - wi.tot_turn: ${wi.tot_turn}`);
      wi.tot_dmg += finalDamage;
      console.log(`Running [doAttack] - wi.tot_dmg: ${wi.tot_dmg}`);

      // Double Tap: one extra attack on hit
      if (!bonus_hit) {
        const dtLv = wi.bonus === 'Double Tap' ? wi.level : (wi.bonus2 === 'Double Tap' ? wi.level2 : 0);
        console.log(`Running [doAttack] - dtLv: ${dtLv}`);
        if (dtLv && Math.random() < dtLv && defender.health >= 1) {
          const r2 = doAttack(attacker, defender, wep, wep2, turn, true);
          console.log('[doAttack] r2:', r2);
          msgs.push(...r2.msgs);
          console.log('[doAttack] msgs:', msgs);
        }
      }

      // FIX: Blindfire — fire until clip is empty, each shot checked individually
      if (!bonus_hit) {
        const bfLv = wi.bonus === 'Blindfire' ? wi.level : (wi.bonus2 === 'Blindfire' ? wi.level2 : 0);
        console.log(`Running [doAttack] - bfLv: ${bfLv}`);
        if (bfLv && Math.random() < bfLv) {
          while (wi.info.ammo > 0 && defender.health >= 1) {
            console.log(`Running [doAttack] - wi.info.ammo: ${wi.info.ammo}, defender.health: ${defender.health}`);
            const r2 = doAttack(attacker, defender, wep, wep2, turn, true);
            console.log('[doAttack] r2:', r2);
            msgs.push(...r2.msgs);
            console.log('[doAttack] msgs:', msgs);
          }
        }
      }

    } else {
      // Miss
      wi.info.ammo -= rounds;
      console.log(`Running [doAttack] - wi.info.ammo: ${wi.info.ammo}`);
      msgs.push({ text:`${attacker.name} fires ${rounds}rds of ${wi.name} but misses ${defender.name}.`, cls:'miss' });
      console.log('[doAttack] msgs:', msgs);
      wi.tot_turn++;
      console.log(`Running [doAttack] - wi.tot_turn: ${wi.tot_turn}`);
      wi.tot_miss++;
      console.log(`Running [doAttack] - wi.tot_miss: ${wi.tot_miss}`);
    }

    return { msgs };
  }

  // ----------------------------------------------------------------
  // MELEE ('m')
  // ----------------------------------------------------------------
  if (wep === 'm') {
    const wi = attacker.wep_m;
    console.log('[doAttack] wi (melee):', wi);

    // Wind-up: first use winds up, next use gets the bonus
    if ((wi.bonus === 'Wind-up' || wi.bonus2 === 'Wind-up') && attacker.winded_up === '') {
      attacker.winded_up = 'm';
      console.log(`Running [doAttack] - attacker.winded_up: ${attacker.winded_up}`);
      wi.tot_turn++; wi.tot_miss++;
      console.log(`Running [doAttack] - wi.tot_turn: ${wi.tot_turn}`);
      console.log(`Running [doAttack] - wi.tot_miss: ${wi.tot_miss}`);
      msgs.push({ text:`${attacker.name} winds up ${wi.name}.`, cls:'miss' });
      console.log('[doAttack] msgs:', msgs);
      return { msgs };
    }

    const hc = calcHitChance(attacker, defender, wep, turn);
    console.log(`Running [doAttack] - hc: ${hc}`);
    if (Math.random() < hc) {

      console.log('[doAttack] defender.comp:', defender.comp);
      // FIX: Gents Strip Club dodge checks DEFENDER (not attacker)
      if (defender.comp.name === 'Gents Strip Club' && defender.comp.star === 10) {
        if (Math.random() < 0.25) {
          wi.tot_turn++; wi.tot_miss++;
          console.log(`Running [doAttack] - wi.tot_turn: ${wi.tot_turn}`);
          console.log(`Running [doAttack] - wi.tot_miss: ${wi.tot_miss}`);
          msgs.push({ text:`${attacker.name} attacks with ${wi.name} but ${defender.name} dodges!`, cls:'miss' });
          console.log('[doAttack] msgs:', msgs);
          return { msgs };
        }
      }

      // Parry check: defender's melee weapon may parry this attack
      if (wep2 === 'm') {
        const dw = defender.wep_m;
        console.log('[doAttack] dw (parry):', dw);
        const pLv = dw.bonus === 'Parry' ? dw.level : (dw.bonus2 === 'Parry' ? dw.level2 : 0);
        console.log(`Running [doAttack] - pLv: ${pLv}`);
        if (pLv && Math.random() < pLv) {
          wi.tot_turn++; wi.tot_miss++;
          console.log(`Running [doAttack] - wi.tot_turn: ${wi.tot_turn}`);
          console.log(`Running [doAttack] - wi.tot_miss: ${wi.tot_miss}`);
          msgs.push({ text:`${defender.name} parries ${attacker.name}'s ${wi.name}!`, cls:'buff' });
          console.log('[doAttack] msgs:', msgs);
          return { msgs };
        }
      }

      attacker.last_wep_hit = true;
      console.log(`Running [doAttack] - attacker.last_wep_hit: ${attacker.last_wep_hit}`);
      const bp = getBodyPart(attacker, wep);
      console.log(`Running [doAttack] - bp: ${bp}`);
      const { damage, armor_used, punctured } = calcDamage(attacker, defender, bp, wep);
      console.log(`Running [doAttack] - damage: ${damage}, armor_used: ${armor_used}, punctured: ${punctured}`);

      // Disarm (not on bonus hit, not on turn 1)
      if (turn !== 1 && damage > 0 && !bonus_hit && ['arms','hands'].includes(bp)) {
        const disarmLv = wi.bonus === 'Disarm' ? wi.level : (wi.bonus2 === 'Disarm' ? wi.level2 : 0);
        console.log(`Running [doAttack] - disarmLv: ${disarmLv}`);
        if (disarmLv && ['p','s','m'].includes(defender.last_wep)) {
          defender[`wep_${defender.last_wep}`].disarmed = disarmLv;
          console.log(`Running [doAttack] - defender[wep_${defender.last_wep}].disarmed: ${defender[`wep_${defender.last_wep}`].disarmed}`);
          msgs.push({ text:`${defender.name}'s ${defender[`wep_${defender.last_wep}`].name} is disarmed.`, cls:'debuff' });
          console.log('[doAttack] msgs:', msgs);
        }
      }

      const isCrit = ['head','heart','throat'].includes(bp);
      console.log(`Running [doAttack] - isCrit: ${isCrit}`);
      msgs.push({ text:`${attacker.name} hits ${defender.name} with ${wi.name} on the ${bp}${punctured?' (punctured)':''} for ${damage} dmg.`, cls: isCrit ? 'hit-crit' : 'hit' });
      console.log('[doAttack] msgs:', msgs);

      // On-hit bonuses (not on bonus hits)
      if (damage > 0 && !bonus_hit) {
        msgs.push(...applyBonusOnHit(attacker, defender, wep, bp, damage, turn, true));
        console.log('[doAttack] msgs:', msgs);
        msgs.push(...applyBonusOnHit(attacker, defender, wep, bp, damage, turn, false));
        console.log('[doAttack] msgs:', msgs);
      }

      // EOD check (Puncture overrides EOD)
      if (!punctured && eodProc(defender, armor_used)) {
        msgs.push({ text:`${defender.name}'s EOD BLOCKED!`, cls:'buff' });
        console.log('[doAttack] msgs:', msgs);
        wi.tot_turn++;
        console.log(`Running [doAttack] - wi.tot_turn: ${wi.tot_turn}`);
        return { msgs };
      }

      // Bloodlust: melee lifesteal
      if (!bonus_hit) {
        const blLv = wi.bonus === 'Bloodlust' ? wi.level : (wi.bonus2 === 'Bloodlust' ? wi.level2 : 0);
        console.log(`Running [doAttack] - blLv: ${blLv}`);
        if (blLv) {
          const regen = Math.min(Math.floor(damage * blLv), Math.max(0, defender.health - 1));
          console.log(`Running [doAttack] - regen: ${regen}`);
          if (regen > 0) {
            attacker.health = Math.min(attacker.max_hp, attacker.health + regen);
            console.log(`Running [doAttack] - attacker.health: ${attacker.health}`);
            msgs.push({ text:`Bloodlust: ${attacker.name} regains ${regen} HP.`, cls:'buff' });
            console.log('[doAttack] msgs:', msgs);
          }
        }
      }

      // Double-edged: attacker takes self-damage
      if (attacker.double_edge && !bonus_hit) {
        const de = Math.min(damage / 4, attacker.health - 1);
        console.log(`Running [doAttack] - de: ${de}`);
        attacker.health -= de;
        console.log(`Running [doAttack] - attacker.health: ${attacker.health}`);
        msgs.push({ text:`Double-edged harms ${attacker.name} for ${Math.floor(de)}.`, cls:'debuff' });
        console.log('[doAttack] msgs:', msgs);
      }

      defender.health -= damage;
      console.log(`Running [doAttack] - defender.health: ${defender.health}`);
      wi.tot_turn++;
      console.log(`Running [doAttack] - wi.tot_turn: ${wi.tot_turn}`);
      wi.tot_dmg += damage;
      console.log(`Running [doAttack] - wi.tot_dmg: ${wi.tot_dmg}`);

      // Fury: one extra melee hit chance
      if (!bonus_hit) {
        const furyLv = wi.bonus === 'Fury' ? wi.level : (wi.bonus2 === 'Fury' ? wi.level2 : 0);
        console.log(`Running [doAttack] - furyLv: ${furyLv}`);
        if (furyLv && Math.random() < furyLv && defender.health >= 1) {
          const r2 = doAttack(attacker, defender, wep, wep2, turn, true);
          console.log('[doAttack] r2:', r2);
          msgs.push(...r2.msgs);
          console.log('[doAttack] msgs:', msgs);
        }
      }

      // Rage: 1-7 extra hits (uniform distribution)
      if (!bonus_hit) {
        const rageLv = wi.bonus === 'Rage' ? wi.level : (wi.bonus2 === 'Rage' ? wi.level2 : 0);
        console.log(`Running [doAttack] - rageLv: ${rageLv}`);
        if (rageLv && Math.random() < rageLv) {
          const extra = Math.ceil(Math.random() * 7);
          console.log(`Running [doAttack] - extra: ${extra}`);
          for (let i = 0; i < extra && defender.health >= 1; i++) {
            const r2 = doAttack(attacker, defender, wep, wep2, turn, true);
            console.log('[doAttack] r2:', r2);
            msgs.push(...r2.msgs);
            console.log('[doAttack] msgs:', msgs);
          }
        }
      }

    } else {
      msgs.push({ text:`${attacker.name} swings ${wi.name} but misses ${defender.name}.`, cls:'miss' });
      console.log('[doAttack] msgs:', msgs);
      wi.tot_turn++;
      console.log(`Running [doAttack] - wi.tot_turn: ${wi.tot_turn}`);
      wi.tot_miss++;
      console.log(`Running [doAttack] - wi.tot_miss: ${wi.tot_miss}`);
    }

    return { msgs };
  }

  return { msgs };
}

// -----------------------------------------------------------------------
// applyDOT — apply all active damage-over-time effects for a player
// Called at the start of each turn before that player attacks
// -----------------------------------------------------------------------
function applyDOT(player, turn) {
  console.log('[applyDOT] player:', player, '| turn:', turn);
  const msgs = [];

  const tick = (turnKey, dmgKey, applyKey, mult, label) => {
    console.log(`Running [applyDOT] - [tick] (turnKey: ${turnKey}, dmgKey: ${dmgKey}, applyKey: ${applyKey}, mult: ${mult}, label: ${label})`);
    if (player[turnKey] > 0 && player[applyKey] !== turn) {
      let dmg = Math.floor(player[dmgKey] * mult * player[turnKey]);
      console.log(`Running [applyDOT] - dmg: ${dmg}`);
      console.log(`Running [applyDOT] - player[turnKey]: ${player[turnKey]}`);
      player[turnKey]--;
      console.log(`Running [applyDOT] - player[turnKey]: ${player[turnKey]}`);
      console.log(`Running [applyDOT] - player.health: ${player.health}`);
      dmg = Math.min(dmg, player.health - 1);
      console.log(`Running [applyDOT] - dmg: ${dmg}`);
      if (dmg > 0) {
        player.health -= dmg;
        console.log(`Running [applyDOT] - player.health: ${player.health}`);
        msgs.push({ text:`${label} deals ${dmg} to ${player.name}.`, cls:'bleed' });
        console.log('[applyDOT] msgs:', msgs);
      }
    }
  };

  tick('bleed_turn',       'bleed_dmg',       'bleed_apply',       0.05, 'Bleed');
  tick('poison_turn',      'poison_dmg',       'poison_apply',      0.05, 'Poison');
  tick('burn_turn',        'burn_dmg',         'burn_apply',        0.15, 'Burn');
  tick('severe_burn_turn', 'severe_burn_dmg',  'severe_burn_apply', 0.15, 'Severe Burn');
  tick('lacerate_turn',    'lacerate_dmg',     'lacerate_apply',    0.10, 'Laceration');

  return msgs;
}

// -----------------------------------------------------------------------
// doHeal — Gas Station per-turn passive heal (10% chance, up to 20% max HP)
// -----------------------------------------------------------------------
function doHeal(player) {
  console.log('[doHeal] player:', player);
  const msgs = [];
  console.log('[doHeal] player.comp:', player.comp);
  if (player.comp.name === 'Gas Station' && player.comp.star >= 5) {
    if (Math.random() < 0.1) {
      const heal = Math.min(0.20 * player.max_hp, player.max_hp - player.health);
      console.log(`Running [doHeal] - heal: ${heal}`);
      if (heal > 0) {
        player.health += heal;
        console.log(`Running [doHeal] - player.health: ${player.health}`);
        msgs.push({ text:`${player.name} cauterizes their wound and recovers ${Math.floor(heal)} HP.`, cls:'buff' });
        console.log('[doHeal] msgs:', msgs);
      }
    }
  }
  return msgs;
}
