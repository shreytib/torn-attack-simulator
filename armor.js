// =====================================================================
// ARMOR FUNCTIONS — torn_sim armor.js
// Depends on: data.js
// =====================================================================

// Map armor type name → bonus name
function getArmorBonusName(name) {
  console.log(`Starting [getArmorBonusName] (name: ${name})`);
  const map = {
    assault:    'Impenetrable',
    riot:       'Impregnable',
    dune:       'Insurmountable',
    delta:      'Invulnerable',
    sentinel:   'Immutable',
    vanguard:   'Irrepressible',
    marauder:   'Imperviable',
    eod:        'Impassable',
  };
  return map[name.toLowerCase()] || 'NA';
}

// Returns the set bonus name if all 5 pieces are the same armor type, else 'NA'
function setBonus(player) {
  console.log('[setBonus] player:', player);
  const { helmet, body, pants, gloves, boots } = player.armor;
  console.log('[setBonus] helmet:', helmet, '| body:', body, '| pants:', pants, '| gloves:', gloves, '| boots:', boots);
  if (
    helmet.name === body.name &&
    body.name   === pants.name &&
    pants.name  === gloves.name &&
    gloves.name === boots.name
  ) {
    return getArmorBonusName(helmet.name);
  }
  return 'NA';
}

// Returns total Invulnerable (delta) level across all worn pieces + set bonus
function getDelta(player) {
  console.log('[getDelta] player:', player);
  let delta = 0;
  console.log(`Running [getDelta] - delta: ${delta}`);
  for (const slot of ['helmet', 'body', 'pants', 'gloves', 'boots']) {
    if (player.armor[slot].bonus.name === 'Invulnerable') {
      delta += player.armor[slot].bonus.level;
    }
  }
  console.log(`Running [getDelta] - delta: ${delta}`);
  if (setBonus(player) === 'Invulnerable') delta += 0.15;
  console.log(`Running [getDelta] - delta: ${delta}`);
  return delta;
}

// Returns coverage fraction (0-1) for a given body part, armor type, and slot.
// slot: 'body' | 'helmet' | 'pants' | 'gloves' | 'boots'
function getArmorCoverageFor(bodyPart, armorType, slot) {
  console.log(`Starting [getArmorCoverageFor] (bodyPart: ${bodyPart}, armorType: ${armorType}, slot: ${slot})`);
  const cov = ARMOR_COVERAGE[bodyPart];
  console.log('[getArmorCoverageFor] cov:', cov);
  if (!cov) return 0;
  if (slot === 'body') {
    return (cov[armorType] || 0) / 100;
  }
  const key = `${slot}_${armorType}`;
  console.log(`Running [getDelta] - key: ${key}`);
  return (cov[key] !== undefined ? cov[key] : 0) / 100;
}

// Returns { mitigation_s, mitigation_b, armor_used, punctured }
// mitigation_s: standard armor damage reduction fraction (0-1)
// mitigation_b: bonus armor damage reduction fraction (0-1)
// armor_used:   which slot blocked ('none' | 'helmet' | 'body' | 'pants' | 'gloves' | 'boots')
// punctured:    true if Puncture bonus negated armor
function getArmorMitigation(attacker, defender, bodyPart, wep) {
  console.log('[getArmorMitigation] attacker:', attacker, '| defender:', defender, '| bodyPart:', bodyPart, '| wep:', wep);
  let mitigation_s = 0;
  let mitigation_b = 0;
  let armor_used   = 'none';
  let punctured    = false;

  // Check each armor slot for coverage roll
  const checkPiece = (slot, armorName) => {
    const coverage = getArmorCoverageFor(bodyPart, armorName, slot === 'body' ? 'body' : slot);
    if (Math.random() < coverage) {
      const pieceSlot = slot === 'body' ? 'body' : slot;
      const rating = defender.armor[pieceSlot].rating;
      if (rating > mitigation_s) {
        mitigation_s = rating;
        armor_used   = pieceSlot;
      }
    }
  };

  checkPiece('helmet', defender.armor.helmet.name);
  console.log(`Running [getArmorMitigation] - mitigation_s: ${mitigation_s}, armor_used: ${armor_used}`);
  checkPiece('body',   defender.armor.body.name);
  console.log(`Running [getArmorMitigation] - mitigation_s: ${mitigation_s}, armor_used: ${armor_used}`);
  checkPiece('pants',  defender.armor.pants.name);
  console.log(`Running [getArmorMitigation] - mitigation_s: ${mitigation_s}, armor_used: ${armor_used}`);
  checkPiece('gloves', defender.armor.gloves.name);
  console.log(`Running [getArmorMitigation] - mitigation_s: ${mitigation_s}, armor_used: ${armor_used}`);
  checkPiece('boots',  defender.armor.boots.name);
  console.log(`Running [getArmorMitigation] - mitigation_s: ${mitigation_s}, armor_used: ${armor_used}`);

  mitigation_s /= 100; // convert % → fraction
  console.log(`Running [getArmorMitigation] - mitigation_s: ${mitigation_s}, armor_used: ${armor_used}`);

  // Armor set bonus mitigation
  if (armor_used !== 'none') {
    const piece  = defender.armor[armor_used];
    const bname  = piece.bonus.name;
    const blevel = piece.bonus.level;

    // Insurmountable: bonus mitigation when defender HP <= 25%
    if (bname === 'Insurmountable' && defender.health <= 0.25 * defender.max_hp) {
      mitigation_b = blevel;
      if (setBonus(defender) === 'Insurmountable') mitigation_b += 0.15;
    }

    // Impregnable: bonus mitigation vs melee
    if (bname === 'Impregnable' && wep === 'm') {
      mitigation_b = blevel;
      if (setBonus(defender) === 'Impregnable') mitigation_b += 0.10;
    }

    // Impenetrable: bonus mitigation vs ranged (not heavy artillery / machine gun)
    if (bname === 'Impenetrable' && (wep === 'p' || wep === 's')) {
      const wt = attacker[`wep_${wep}`].info.weapon_type;
      if (wt !== 'Heavy artillery' && wt !== 'Machine gun') {
        mitigation_b = blevel;
        if (setBonus(defender) === 'Impenetrable') mitigation_b += 0.10;
      }
    }
  }
  console.log(`Running [getArmorMitigation] - mitigation_b: ${mitigation_b}`);

  // mitigation_s multiplier (company / ammo / weapon bonuses)
  let mitigation_s_passive = 1;

  // Private Security Firm: +25% armor effectiveness if wearing a full set
  if (defender.comp.name === 'Private Security Firm' && defender.comp.star >= 7) {
    if (setBonus(defender) !== 'NA') mitigation_s_passive += 0.25;
  }
  console.log(`Running [getArmorMitigation] - mitigation_s_passive: ${mitigation_s_passive}`);

  // Clothing Store: +20% armor effectiveness at star 10
  if (defender.comp.name === 'Clothing Store' && defender.comp.star === 10) {
    mitigation_s_passive += 0.20;
  }
  console.log(`Running [getArmorMitigation] - mitigation_s_passive: ${mitigation_s_passive}`);

  // Penetrate weapon bonus (primary & melee only)
  if (wep === 'p' || wep === 'm') {
    const wi = attacker[`wep_${wep}`];
    if (wi.bonus  === 'Penetrate') mitigation_s_passive -= wi.level;
    if (wi.bonus2 === 'Penetrate') mitigation_s_passive -= wi.level2;
    console.log(`Running [getArmorMitigation] - mitigation_s_passive: ${mitigation_s_passive}`);

    // Puncture: chance to fully negate armor (including bonus mitigation — overrides EOD, Impenetrable, Impregnable)
    if (wi.bonus  === 'Puncture' && Math.random() < wi.level)  { mitigation_s = 0; mitigation_b = 0; punctured = true; }
    if (wi.bonus2 === 'Puncture' && Math.random() < wi.level2) { mitigation_s = 0; mitigation_b = 0; punctured = true; }
    console.log(`Running [getArmorMitigation] - mitigation_s: ${mitigation_s}, mitigation_b: ${mitigation_b}, punctured: ${punctured}`);
  }

  // Ammo type modifiers on armor effectiveness
  if (wep === 'p' || wep === 's') {
    const ammo = attacker[`wep_${wep}`].s_ammo;
    console.log(`Running [getArmorMitigation] - ammo: ${ammo}`);
    if (ammo === 'HP') mitigation_s_passive += 0.50;  // hollow point: more armor effect
    if (ammo === 'PI') mitigation_s_passive -= 0.50;  // piercing: less armor effect
  }
  console.log(`Running [getArmorMitigation] - mitigation_s: ${mitigation_s}, mitigation_s_passive: ${mitigation_s_passive}`);

  mitigation_s = mitigation_s_passive * mitigation_s;
  console.log(`Running [getArmorMitigation] - mitigation_s: ${mitigation_s}`);

  return { mitigation_s, mitigation_b, armor_used, punctured };
}

// Returns true if EOD (Impassable) armor procs and absorbs the hit entirely
function eodProc(defender, armor_used) {
  console.log('[eodProc] defender:', defender, '| armor_used:', armor_used);
  if (armor_used === 'none') return false;
  const b = defender.armor[armor_used].bonus;
  console.log('[eodProc] b:', b);
  if (b.name === 'Impassable') {
    let chance = b.level;
    console.log(`Running [eodProc] - chance: ${chance}`);
    if (setBonus(defender) === 'Impassable') chance += 0.10;
    console.log(`Running [eodProc] - chance: ${chance}`);
    return Math.random() < chance;
  }
  return false;
}
