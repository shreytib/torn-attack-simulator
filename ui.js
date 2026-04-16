// =====================================================================
// UI — torn_sim ui.js
// Depends on: data.js, armor.js, combat.js, sim.js
// =====================================================================

// -----------------------------------------------------------------------
// populateSelects — fill all dropdowns on page load
// -----------------------------------------------------------------------
function populateSelects() {
  for (const prefix of ['p1','p2']) {
    // Weapon name dropdowns
    const pSel = document.getElementById(`${prefix}_wep_p_name`);
    const sSel = document.getElementById(`${prefix}_wep_s_name`);
    const mSel = document.getElementById(`${prefix}_wep_m_name`);
    const tSel = document.getElementById(`${prefix}_wep_t_name`);

    Object.keys(WEAPON_PRIMARY).forEach(n   => pSel.add(new Option(n, n)));
    Object.keys(WEAPON_SECONDARY).forEach(n => sSel.add(new Option(n, n)));
    Object.keys(WEAPON_MELEE).forEach(n     => mSel.add(new Option(n, n)));
    TEMP_ITEMS.forEach(n                     => tSel.add(new Option(n, n)));

    // Gun mod dropdowns (primary + secondary)
    for (const wep of ['p','s']) {
      for (const slot of ['mod1','mod2']) {
        const el = document.getElementById(`${prefix}_wep_${wep}_${slot}`);
        GUN_MODS.forEach(m => el.add(new Option(m, m)));
      }
    }

    // Weapon bonus dropdowns (primary, secondary, melee)
    for (const wep of ['p','s','m']) {
      for (const bn of ['bonus1','bonus2']) {
        const el = document.getElementById(`${prefix}_wep_${wep}_${bn}`);
        WEAPON_BONUSES.forEach(b => el.add(new Option(b, b)));
      }
    }

    // Armor type dropdowns
    for (const piece of ['helm','body','pants','gloves','boots']) {
      const el = document.getElementById(`${prefix}_${piece}`);
      ARMOR_TYPES.forEach(a => el.add(new Option(a, a)));
    }

    // Company dropdown
    const compEl = document.getElementById(`${prefix}_comp_name`);
    COMPANY_NAMES.forEach(c => compEl.add(new Option(c, c)));
  }

  // Set sensible defaults
  document.getElementById('p1_wep_p_name').value = 'M4A1 Colt Carbine';
  document.getElementById('p1_wep_s_name').value = 'Desert Eagle';
  document.getElementById('p1_wep_m_name').value = 'Katana';
  document.getElementById('p2_wep_p_name').value = 'AK-47';
  document.getElementById('p2_wep_s_name').value = 'Glock 17';
  document.getElementById('p2_wep_m_name').value = 'Baseball Bat';
}

// -----------------------------------------------------------------------
// readPlayer — read all input fields into a player config object
// -----------------------------------------------------------------------
function readPlayer(prefix) {
  const g  = id  => document.getElementById(id).value;
  const gn = id  => parseFloat(g(id)) || 0;
  const gb = id  => document.getElementById(id).checked;

  // Weapon bonus levels: Disarm is stored as raw turns, all others as fraction
  const bonusLevel = (bonusName, rawLevel) =>
    bonusName === 'Disarm' ? rawLevel : rawLevel / 100;

  const wpb1 = g(`${prefix}_wep_p_bonus1`);
  const wpb2 = g(`${prefix}_wep_p_bonus2`);
  const wsb1 = g(`${prefix}_wep_s_bonus1`);
  const wsb2 = g(`${prefix}_wep_s_bonus2`);
  const wmb1 = g(`${prefix}_wep_m_bonus1`);
  const wmb2 = g(`${prefix}_wep_m_bonus2`);

  return {
    name:      g(`${prefix}_name`),
    level:     parseInt(g(`${prefix}_level`)) || 1,
    strength:  gn(`${prefix}_str`),
    defense:   gn(`${prefix}_def`),
    speed:     gn(`${prefix}_spd`),
    dexterity: gn(`${prefix}_dex`),
    fist:      g(`${prefix}_fist`) === '1',
    property:  g(`${prefix}_property`) === '1' ? 0.02 : 0,

    wep_p: {
      name:      g(`${prefix}_wep_p_name`),
      dmg:       gn(`${prefix}_wep_p_dmg`),
      acc:       gn(`${prefix}_wep_p_acc`),
      exp:       gn(`${prefix}_wep_p_exp`) / 100,  // stored as level/100
      mod1_name: g(`${prefix}_wep_p_mod1`),
      mod2_name: g(`${prefix}_wep_p_mod2`),
      bonus:     wpb1 === 'None' ? '' : wpb1,
      level:     bonusLevel(wpb1, gn(`${prefix}_wep_p_blvl1`)),
      bonus2:    wpb2 === 'None' ? '' : wpb2,
      level2:    bonusLevel(wpb2, gn(`${prefix}_wep_p_blvl2`)),
      s_ammo:    g(`${prefix}_wep_p_ammo`),
      reload:    document.getElementById(`${prefix}_wep_p_reload`).checked ? 1 : 0,
      disarmed:0, tot_dmg:0, tot_turn:0, tot_miss:0,
    },

    wep_s: {
      name:      g(`${prefix}_wep_s_name`),
      dmg:       gn(`${prefix}_wep_s_dmg`),
      acc:       gn(`${prefix}_wep_s_acc`),
      exp:       gn(`${prefix}_wep_s_exp`) / 100,
      mod1_name: g(`${prefix}_wep_s_mod1`),
      mod2_name: g(`${prefix}_wep_s_mod2`),
      bonus:     wsb1 === 'None' ? '' : wsb1,
      level:     bonusLevel(wsb1, gn(`${prefix}_wep_s_blvl1`)),
      bonus2:    wsb2 === 'None' ? '' : wsb2,
      level2:    bonusLevel(wsb2, gn(`${prefix}_wep_s_blvl2`)),
      s_ammo:    g(`${prefix}_wep_s_ammo`),
      reload:    document.getElementById(`${prefix}_wep_s_reload`).checked ? 1 : 0,
      disarmed:0, tot_dmg:0, tot_turn:0, tot_miss:0,
    },

    wep_m: {
      name:   g(`${prefix}_wep_m_name`),
      dmg:    gn(`${prefix}_wep_m_dmg`),
      acc:    gn(`${prefix}_wep_m_acc`),
      exp:    gn(`${prefix}_wep_m_exp`) / 100,
      bonus:  wmb1 === 'None' ? '' : wmb1,
      level:  bonusLevel(wmb1, gn(`${prefix}_wep_m_blvl1`)),
      bonus2: wmb2 === 'None' ? '' : wmb2,
      level2: bonusLevel(wmb2, gn(`${prefix}_wep_m_blvl2`)),
      disarmed:0, tot_dmg:0, tot_turn:0, tot_miss:0,
    },

    wep_t: {
      name:   g(`${prefix}_wep_t_name`) || 'None',
      dmg:0, acc:0, exp:0, used:false,
      bonus:'', level:0, bonus2:'', level2:0,
    },

    att_set: {
      p: gn(`${prefix}_att_p`),
      s: gn(`${prefix}_att_s`),
      m: gn(`${prefix}_att_m`),
      t: gn(`${prefix}_att_t`),
    },

    armor: {
      helmet: { name:g(`${prefix}_helm`),   rating:gn(`${prefix}_helm_r`),   bonus:{ name:'', level:gn(`${prefix}_helm_bl`)  /100 } },
      body:   { name:g(`${prefix}_body`),   rating:gn(`${prefix}_body_r`),   bonus:{ name:'', level:gn(`${prefix}_body_bl`)  /100 } },
      pants:  { name:g(`${prefix}_pants`),  rating:gn(`${prefix}_pants_r`),  bonus:{ name:'', level:gn(`${prefix}_pants_bl`) /100 } },
      gloves: { name:g(`${prefix}_gloves`), rating:gn(`${prefix}_gloves_r`), bonus:{ name:'', level:gn(`${prefix}_gloves_bl`)/100 } },
      boots:  { name:g(`${prefix}_boots`),  rating:gn(`${prefix}_boots_r`),  bonus:{ name:'', level:gn(`${prefix}_boots_bl`) /100 } },
    },

    edu: {
      // General bonuses
      jap:        gb(`${prefix}_edu_jap`)     ? 0.10 : 0,
      fist_dmg:   gb(`${prefix}_edu_fist`)    ? 1    : 0,
      melee_dmg:  gb(`${prefix}_edu_melee`)   ? 0.02 : 0,
      dmg:        gb(`${prefix}_edu_dmg`)     ? 0.01 : 0,
      throat_dmg: gb(`${prefix}_edu_throat`)  ? 0.10 : 0,
      crit:       gb(`${prefix}_edu_crit`)    ? 0.03 : 0,
      steroid:    gb(`${prefix}_edu_steroid`),
      temp_dmg:   gb(`${prefix}_edu_temp`)    ? 0.05 : 0,
      ammo:       gb(`${prefix}_edu_ammo`)    ? 0.25 : 0,
      // Stat % bonuses
      strength:   gn(`${prefix}_edu_str_p`)  / 100,
      speed:      gn(`${prefix}_edu_spd_p`)  / 100,
      dexterity:  gn(`${prefix}_edu_dex_p`)  / 100,
      defense:    gn(`${prefix}_edu_def_p`)  / 100,
      // Weapon type proficiency (+1 accuracy when using that weapon type)
      'Machine gun':     gb(`${prefix}_edu_mg`)      ? 1 : 0,
      'SMG':             gb(`${prefix}_edu_smg`)     ? 1 : 0,
      'Pistol':          gb(`${prefix}_edu_pistol`)  ? 1 : 0,
      'Rifle':           gb(`${prefix}_edu_rifle`)   ? 1 : 0,
      'Heavy artillery': gb(`${prefix}_edu_ha`)      ? 1 : 0,
      'Shotgun':         gb(`${prefix}_edu_sg`)      ? 1 : 0,
      'Temporary':       gb(`${prefix}_edu_temp_type`) ? 1 : 0,
    },

    merit: {
      crit:     gn(`${prefix}_m_crit`),
      life:     gn(`${prefix}_m_life`),
      strength: gn(`${prefix}_m_str`),
      speed:    gn(`${prefix}_m_spd`),
      dexterity:gn(`${prefix}_m_dex`),
      defense:  gn(`${prefix}_m_def`),
      'Heavy artillery': gn(`${prefix}_m_ha`),
      'Machine gun':     gn(`${prefix}_m_mg`),
      'Rifle':           gn(`${prefix}_m_rifle`),
      'SMG':             gn(`${prefix}_m_smg`),
      'Shotgun':         gn(`${prefix}_m_sg`),
      'Pistol':          gn(`${prefix}_m_pistol`),
      'Clubbing':        gn(`${prefix}_m_club`),
      'Piercing':        gn(`${prefix}_m_pierce`),
      'Slashing':        gn(`${prefix}_m_slash`),
      'Temporary':       gn(`${prefix}_m_temp`),
    },

    faction_agg: {
      speed:    gn(`${prefix}_fac_agg_spd`) / 100,
      strength: gn(`${prefix}_fac_agg_str`) / 100,
      // Accuracy: each level = +0.2 accuracy, max 10 levels = +2 accuracy
      acc:      gn(`${prefix}_fac_agg_acc`) * 0.2,
      dmg:      gn(`${prefix}_fac_agg_dmg`) / 100,
    },

    faction_sup: {
      dexterity: gn(`${prefix}_fac_sup_dex`)  / 100,
      defense:   gn(`${prefix}_fac_sup_def`)  / 100,
      life:      gn(`${prefix}_fac_sup_life`) / 100,
    },

    drug:     g(`${prefix}_drug`) || 'None',
    addiction: gn(`${prefix}_addiction`) / 100,

    comp: {
      name: g(`${prefix}_comp_name`) === 'None' ? '' : g(`${prefix}_comp_name`),
      star: parseInt(g(`${prefix}_comp_star`)) || 0,
    },
  };
}


function toggleLog() {
  const c = document.getElementById('logCollapse');
  c.style.display = c.style.display === 'none' ? 'block' : 'none';
}

// -----------------------------------------------------------------------
// Simulation runner
// -----------------------------------------------------------------------
let simRunning = false;

function startSim() {
  if (simRunning) return;
  simRunning = true;

  const btn = document.getElementById('simBtn');
  btn.disabled = true;
  document.getElementById('resultsSection').style.display = 'none';
  document.getElementById('progressFill').style.width = '0%';
  document.getElementById('progressText').textContent  = 'Starting...';

  const heroInput    = readPlayer('p1');
  const villainInput = readPlayer('p2');
  const N = parseInt(document.getElementById('numSims').value);

  const sampleIdx = Math.floor(Math.random() * N);

  const results = {
    p1_win:0, p2_win:0, draw:0,
    total_turns:0,
    p1_total_hp:0, p2_total_hp:0,
    p1_max_hp:0,   p2_max_hp:0,
    p1_wep: { p:{turns:0,dmg:0,miss:0}, s:{turns:0,dmg:0,miss:0}, m:{turns:0,dmg:0,miss:0} },
    p2_wep: { p:{turns:0,dmg:0,miss:0}, s:{turns:0,dmg:0,miss:0}, m:{turns:0,dmg:0,miss:0} },
    sampleLog: [],
    sampleSimNum: sampleIdx + 1,
  };

  const BATCH = 200;
  let done = 0;

  function runBatch() {
    const end = Math.min(done + BATCH, N);
    for (let i = done; i < end; i++) {
      const r = runOneSim(heroInput, villainInput, i === sampleIdx);

      if      (r.winner === 1) results.p1_win++;
      else if (r.winner === 2) results.p2_win++;
      else                     results.draw++;

      results.total_turns  += r.turns;
      results.p1_total_hp  += r.p1_hp;
      results.p2_total_hp  += r.p2_hp;

      if (!results.p1_max_hp) {
        results.p1_max_hp = r.p1_max;
        results.p2_max_hp = r.p2_max;
      }

      for (const w of ['p','s','m']) {
        results.p1_wep[w].turns += r.p1_wep_stats[w].turns;
        results.p1_wep[w].dmg   += r.p1_wep_stats[w].dmg;
        results.p1_wep[w].miss  += r.p1_wep_stats[w].miss;
        results.p2_wep[w].turns += r.p2_wep_stats[w].turns;
        results.p2_wep[w].dmg   += r.p2_wep_stats[w].dmg;
        results.p2_wep[w].miss  += r.p2_wep_stats[w].miss;
      }

      if (i === sampleIdx) results.sampleLog = r.log;
    }

    done = end;
    const pct = (done / N * 100).toFixed(1);
    document.getElementById('progressFill').style.width  = pct + '%';
    document.getElementById('progressText').textContent  =
      `${done.toLocaleString()} / ${N.toLocaleString()} simulations`;

    if (done < N) {
      setTimeout(runBatch, 0);
    } else {
      showResults(results, N, heroInput.name, villainInput.name);
      simRunning    = false;
      btn.disabled  = false;
    }
  }

  setTimeout(runBatch, 0);
}

// -----------------------------------------------------------------------
// showResults — render all results to the page
// -----------------------------------------------------------------------
function showResults(results, N, p1name, p2name) {
  const p1wr    = (results.p1_win / N * 100).toFixed(1);
  const p2wr    = (results.p2_win / N * 100).toFixed(1);
  const dr      = (results.draw   / N * 100).toFixed(1);
  const avgTurns = (results.total_turns / N).toFixed(2);
  const p1avgHP  = Math.round(results.p1_total_hp / N);
  const p2avgHP  = Math.round(results.p2_total_hp / N);
  const p1hpPct  = results.p1_max_hp ? (p1avgHP / results.p1_max_hp * 100).toFixed(1) : '0.0';
  const p2hpPct  = results.p2_max_hp ? (p2avgHP / results.p2_max_hp * 100).toFixed(1) : '0.0';

  // Summary cards — use actual player names
  document.getElementById('res_p1_win_label').textContent  = `${p1name} Win Rate`;
  document.getElementById('res_p1_win').textContent         = p1wr + '%';
  document.getElementById('res_p1_win_n').textContent       = `${results.p1_win.toLocaleString()} wins`;
  document.getElementById('res_p2_win_label').textContent  = `${p2name} Win Rate`;
  document.getElementById('res_p2_win').textContent         = p2wr + '%';
  document.getElementById('res_p2_win_n').textContent       = `${results.p2_win.toLocaleString()} wins`;
  document.getElementById('res_draw').textContent           = dr + '%';
  document.getElementById('res_avg_turns').textContent      = avgTurns;
  document.getElementById('res_p1_hp_label').textContent   = `${p1name} Avg HP Left`;
  document.getElementById('res_p1_hp').textContent          = p1avgHP.toLocaleString();
  document.getElementById('res_p1_hp_pct').textContent      = p1hpPct + '% of max HP';
  document.getElementById('res_p2_hp_label').textContent   = `${p2name} Avg HP Left`;
  document.getElementById('res_p2_hp').textContent          = p2avgHP.toLocaleString();
  document.getElementById('res_p2_hp_pct').textContent      = p2hpPct + '% of max HP';

  // Win probability bar
  document.getElementById('winBarP1').style.width   = p1wr + '%';
  document.getElementById('winBarP2').style.width   = p2wr + '%';
  document.getElementById('winBarDraw').style.width = dr   + '%';
  document.getElementById('winPctP1').textContent   = p1wr + '%';
  document.getElementById('winPctP2').textContent   = p2wr + '%';
  document.getElementById('winPctDraw').textContent = dr   + '%';
  document.getElementById('winNameP1').textContent  = p1name;
  document.getElementById('winNameP2').textContent  = p2name;

  // HP remaining bars
  document.getElementById('hpBarP1').style.width      = p1hpPct + '%';
  document.getElementById('hpBarP2').style.width      = p2hpPct + '%';
  document.getElementById('hpLabelP1').textContent    = `${p1name}: ${p1avgHP.toLocaleString()}`;
  document.getElementById('hpLabelP2').textContent    = `${p2name}: ${p2avgHP.toLocaleString()}`;
  document.getElementById('hpLabelP1Pct').textContent = p1hpPct + '%';
  document.getElementById('hpLabelP2Pct').textContent = p2hpPct + '%';

  // Weapon stats tables
  const heroInput    = readPlayer('p1');
  const villainInput = readPlayer('p2');
  const p1names = [heroInput.wep_p.name,    heroInput.wep_s.name,    heroInput.wep_m.name];
  const p2names = [villainInput.wep_p.name, villainInput.wep_s.name, villainInput.wep_m.name];

  const buildWepTable = (tbodyId, wepStats, names) => {
    const tb = document.getElementById(tbodyId);
    tb.innerHTML = '';
    ['p','s','m'].forEach((k, i) => {
      const w      = wepStats[k];
      const avgT   = (w.turns / N).toFixed(2);
      const avgD   = Math.round(w.dmg   / N);
      const avgM   = (w.miss  / N).toFixed(2);
      const hitPct = w.turns > 0
        ? (((w.turns - w.miss) / w.turns) * 100).toFixed(1) + '%'
        : '—';
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${names[i]}</td>
        <td class="right">${avgT}</td>
        <td class="right">${avgD.toLocaleString()}</td>
        <td class="right">${avgM}</td>
        <td class="right">${hitPct}</td>`;
      tb.appendChild(tr);
    });
  };

  document.getElementById('p1_wep_stats_title').textContent = `${p1name} Weapon Stats (avg per fight)`;
  document.getElementById('p2_wep_stats_title').textContent = `${p2name} Weapon Stats (avg per fight)`;
  buildWepTable('p1_wep_stats', results.p1_wep, p1names);
  buildWepTable('p2_wep_stats', results.p2_wep, p2names);

  // Battle log (random simulation)
  document.getElementById('logTitle').textContent =
    `Sample Attack Log — Simulation #${results.sampleSimNum.toLocaleString()}`;
  const logBody = document.getElementById('logBody');
  logBody.innerHTML = '';
  results.sampleLog.forEach(entry => {
    const div = document.createElement('div');
    div.className   = `log-line ${entry.cls || ''}`;
    div.textContent = entry.text;
    logBody.appendChild(div);
  });

  // Show results section
  document.getElementById('resultsSection').style.display = 'block';
  document.getElementById('resultsSection').scrollIntoView({ behavior:'smooth', block:'start' });
}

// -----------------------------------------------------------------------
// copyPlayer — copy all input fields from one player panel to another
// -----------------------------------------------------------------------
function copyPlayer(fromPrefix, toPrefix) {
  const fromPanel = document.getElementById(`${fromPrefix}panel`);
  const toPanel   = document.getElementById(`${toPrefix}panel`);

  // Copy all text/number/select inputs (skip the API key input)
  fromPanel.querySelectorAll('input[type="text"], input[type="number"], select').forEach(el => {
    if (el.id === `${fromPrefix}_api_key`) return;
    const toId = el.id.replace(new RegExp(`^${fromPrefix}_`), `${toPrefix}_`);
    const toEl = document.getElementById(toId);
    if (toEl) toEl.value = el.value;
  });

  // Copy checkboxes
  fromPanel.querySelectorAll('input[type="checkbox"]').forEach(el => {
    const toId = el.id.replace(new RegExp(`^${fromPrefix}_`), `${toPrefix}_`);
    const toEl = document.getElementById(toId);
    if (toEl) toEl.checked = el.checked;
  });
}

// -----------------------------------------------------------------------
// Company type_id → sim display name map
// Names must exactly match entries in COMPANY_NAMES (data.js).
// Type IDs not in this map (or mapping to 'None') won't change the dropdown.
// -----------------------------------------------------------------------
const COMPANY_TYPE_ID_MAP = {
  1:  'Hair Salon',
  5:  'Clothing Store',
  6:  'Gun Shop',
  10: 'Adult Novelties',
  19: 'Firework Stand',
  21: 'Furniture Store',
  22: 'Gas Station',
  23: 'Music Store',
  25: 'Pub',
  26: 'Gents Strip Club',
  27: 'Restaurant',
  31: 'Amusement Park',
  32: 'Lingerie Store',
  36: 'Ladies Strip Club',
  37: 'Private Security Firm',
  38: 'Mining Corporation',
  // IDs not listed here are not combat-relevant and fall back to 'None'
};

// -----------------------------------------------------------------------
// resetPlayerPanel — clear all fields in a panel to blank/default values
// Called before applying API data so no stale values remain
// -----------------------------------------------------------------------
function resetPlayerPanel(prefix) {
  const panel = document.getElementById(`${prefix}panel`);
  if (!panel) return;

  panel.querySelectorAll('input[type="number"]').forEach(el => { el.value = 0; });
  panel.querySelectorAll('input[type="text"]').forEach(el => {
    if (el.id !== `${prefix}_api_key`) el.value = '';
  });
  panel.querySelectorAll('input[type="checkbox"]').forEach(el => { el.checked = false; });
  panel.querySelectorAll('select').forEach(el => { el.selectedIndex = 0; });
}

// -----------------------------------------------------------------------
// applyAPIData — map API JSON → sim UI fields for a given player prefix
// -----------------------------------------------------------------------
function applyAPIData(prefix, data) {
  // Clear all fields first so no previously-entered values linger
  resetPlayerPanel(prefix);
  const g = (id, val) => {
    const el = document.getElementById(`${prefix}_${id}`);
    if (el) el.value = val;
  };
  const gc = (id, val) => {
    const el = document.getElementById(`${prefix}_${id}`);
    if (el) el.checked = !!val;
  };

  // Set of valid bonus names from data.js (for validation)
  const validBonuses = new Set(WEAPON_BONUSES);

  // Helpers
  // bonusName: API bonus name → 'None' if not in our list
  const validBonus = (name) => (name && validBonuses.has(name)) ? name : 'None';
  // bonusLevel: API value is already in % (e.g. 16 = 16%), write directly
  const bonusLvl = (val) => (val ?? 0).toFixed(1);

  // Armor name prefix → armor type
  const ARMOR_PREFIX_MAP = {
    assault: 'assault', riot: 'riot', dune: 'dune', delta: 'delta',
    sentinel: 'sentinel', marauder: 'marauder', eod: 'eod', combat: 'combat',
    motorcycle: 'motorcycle', vanguard: 'vanguard',
  };
  const getArmorType = (name) => {
    if (!name) return 'none';
    const lc = name.toLowerCase();
    for (const [pfx, type] of Object.entries(ARMOR_PREFIX_MAP)) {
      if (lc.startsWith(pfx)) return type;
    }
    return 'none';
  };

  // ── Name & Level ──────────────────────────────────────────────────────
  if (data.profile?.name)        g('name',  data.profile.name);
  if (data.profile?.level != null) g('level', data.profile.level);

  // ── Battle stats (base values) ───────────────────────────────────────
  const bstats = data.battlestats;
  if (bstats) {
    if (bstats.strength?.value  != null) g('str', bstats.strength.value);
    if (bstats.defense?.value   != null) g('def', bstats.defense.value);
    if (bstats.speed?.value     != null) g('spd', bstats.speed.value);
    if (bstats.dexterity?.value != null) g('dex', bstats.dexterity.value);

    // Faction modifiers → fac_agg_str/spd, fac_sup_def/dex
    // strength → Aggression Strength, speed → Aggression Speed
    // defense  → Suppression Defense, dexterity → Suppression Dexterity
    const getFacMod = (stat) => {
      const m = (bstats[stat]?.modifiers || []).find(x => x.type === 'Faction');
      return m ? m.value : 0;  // API gives % directly
    };
    g('fac_agg_str', getFacMod('strength').toFixed(1));
    g('fac_agg_spd', getFacMod('speed').toFixed(1));
    g('fac_sup_def', getFacMod('defense').toFixed(1));
    g('fac_sup_dex', getFacMod('dexterity').toFixed(1));

    // Education stat % modifiers → edu_str_p / def / spd / dex
    const getEduMod = (stat) => {
      const m = (bstats[stat]?.modifiers || []).find(x => x.type === 'Education');
      return m ? m.value : 0;
    };
    g('edu_str_p', getEduMod('strength').toFixed(1));
    g('edu_def_p', getEduMod('defense').toFixed(1));
    g('edu_spd_p', getEduMod('speed').toFixed(1));
    g('edu_dex_p', getEduMod('dexterity').toFixed(1));

    // Drug modifier → identify active drug by matching stat signature
    const getDrugMod = (stat) => {
      const m = (bstats[stat]?.modifiers || []).find(x => x.type === 'Drug');
      return m ? m.value : 0;
    };
    const drugSig = {
      str: getDrugMod('strength'),
      def: getDrugMod('defense'),
      spd: getDrugMod('speed'),
      dex: getDrugMod('dexterity'),
    };
    const DRUG_SIGNATURES = [
      { name: 'Xanax',    str: -25, def: -25, spd: -25, dex: -25 },
      { name: 'Vicodin',  str:  25, def:  25, spd:  25, dex:  25 },
      { name: 'LSD',      str:  30, def:  50, spd: -50, dex: -50 },
      { name: 'Ketamine', str: -20, def:  50, spd: -20, dex:   0 },
      { name: 'Speed',    str:   0, def:   0, spd:  20, dex: -20 },
      { name: 'PCP',      str:  20, def:   0, spd:   0, dex:  20 },
      { name: 'Opium',    str:   0, def:  30, spd:   0, dex:   0 },
    ];
    const matchedDrug = DRUG_SIGNATURES.find(d =>
      d.str === drugSig.str && d.def === drugSig.def &&
      d.spd === drugSig.spd && d.dex === drugSig.dex
    );
    g('drug', matchedDrug ? matchedDrug.name : 'None');
  }

  // ── Job / Company ─────────────────────────────────────────────────────
  // API v2: data.job.type_id = company type integer, data.job.rating = star level
  if (data.job) {
    const compName = COMPANY_TYPE_ID_MAP[data.job.type_id] || 'None';
    g('comp_name', compName);
    g('comp_star', data.job.rating ?? 0);
  }

  // ── Property (Shooting Range boost) ──────────────────────────────────
  if (data.property) {
    const hasSR = (data.property.modifications || []).some(m =>
      typeof m === 'string' && m.toLowerCase().includes('shooting range')
    );
    g('property', hasSR ? '1' : '0');
  }

  // ── Education checkboxes ─────────────────────────────────────────────
  // Maps confirmed course IDs → checkbox field suffix.
  // Courses 31 AND 33 both contribute to ammo conservation (5%+20%=25%);
  // tick the checkbox if either is completed.
  const EDU_CHECKBOX_MAP = {
    16:  'edu_jap',       // History      — +10% Japanese blade dmg
    17:  'edu_melee',     // History      — +2% melee dmg
    31:  'edu_ammo',      // Mathematics  — +5% ammo conservation  (part 1)
    33:  'edu_ammo',      // Mathematics  — +20% ammo conservation (part 2)
    35:  'edu_dmg',       // Biology      — +1% all weapon dmg
    38:  'edu_throat',    // Biology      — +10% throat dmg
    41:  'edu_crit',      // Biology      — +3% crit chance
    48:  'edu_steroid',   // Sports Sci.  — +10% needle effectiveness
    77:  'edu_fist',      // Self Defense — fist dmg +100%
    82:  'edu_mg',        // Combat Tr.   — +1 Machine Gun acc
    83:  'edu_smg',       // Combat Tr.   — +1 SMG acc
    84:  'edu_pistol',    // Combat Tr.   — +1 Pistol acc
    85:  'edu_rifle',     // Combat Tr.   — +1 Rifle acc
    86:  'edu_ha',        // Combat Tr.   — +1 Heavy Artillery acc
    116: 'edu_temp_type', // General St.  — +1 Temp weapon acc
    119: 'edu_temp',      // General St.  — +5% temp weapon dmg
    125: 'edu_sg',        // Combat Tr.   — +1 Shotgun acc
  };
  if (data.education) {
    // API v2 returns { complete: [1, 2, 3, ...], current: null }
    const completedIds = new Set((data.education.complete || []).map(Number));
    for (const [id, field] of Object.entries(EDU_CHECKBOX_MAP)) {
      if (completedIds.has(Number(id))) gc(field, true);
    }
  }

  // ── Merits from perks.merit_perks ────────────────────────────────────
  if (data.merit_perks) {
    // Weapon type keyword → merit field. 'submachine' must come before 'machine'.
    const WEAPON_MERIT_MAP = [
      { match: 'submachine', field: 'm_smg'    },
      { match: 'machine gun',field: 'm_mg'     },
      { match: 'rifle',      field: 'm_rifle'  },
      { match: 'pistol',     field: 'm_pistol' },
      { match: 'shotgun',    field: 'm_sg'     },
      { match: 'heavy artillery', field: 'm_ha' },
      { match: 'clubbing',   field: 'm_club'   },
      { match: 'piercing',   field: 'm_pierce' },
      { match: 'slashing',   field: 'm_slash'  },
      { match: 'temporary',  field: 'm_temp'   },
    ];

    for (const perk of data.merit_perks) {
      const s = perk.toLowerCase();

      // Critical hit rate: "+ X% critical hit rate"
      const critM = s.match(/\+\s*([\d.]+)%\s*critical hit rate/);
      if (critM) { g('m_crit', Math.round(parseFloat(critM[1]) / 0.5)); continue; }

      // Life: "+ X% life"
      const lifeM = s.match(/\+\s*([\d.]+)%\s*life/);
      if (lifeM) { g('m_life', Math.round(parseFloat(lifeM[1]) / 5)); continue; }

      // Passive stats: "+ X% passive <stat>"
      const passM = s.match(/\+\s*([\d.]+)%\s*passive\s+(strength|speed|dexterity|defense)/);
      if (passM) {
        const fieldMap = { strength: 'm_str', speed: 'm_spd', dexterity: 'm_dex', defense: 'm_def' };
        g(fieldMap[passM[2]], Math.round(parseFloat(passM[1]) / 3));
        continue;
      }

      // Weapon merits: "+ X% damage and + Y accuracy to <type>"
      const wepM = s.match(/\+\s*([\d.]+)%\s*damage/);
      if (wepM) {
        const level = Math.round(parseFloat(wepM[1]) / 1);
        for (const { match, field } of WEAPON_MERIT_MAP) {
          if (s.includes(match)) { g(field, level); break; }
        }
        continue;
      }
    }
  }

  // ── Faction perks → Aggression Damage, Aggression Accuracy, Suppression Life
  // passive strength/speed/defense/dexterity are already read from battlestats modifiers
  if (data.faction_perks) {
    for (const perk of data.faction_perks) {
      const s = perk.toLowerCase();

      // "+ X% damage" → Aggression Damage (stored as %)
      const dmgM = s.match(/\+\s*([\d.]+)%\s*damage$/);
      if (dmgM) { g('fac_agg_dmg', parseFloat(dmgM[1]).toFixed(1)); continue; }

      // "+ X.Y accuracy" → Aggression Accuracy (stored as level count, each level = 0.2)
      const accM = s.match(/\+\s*([\d.]+)\s*accuracy$/);
      if (accM) { g('fac_agg_acc', Math.round(parseFloat(accM[1]) / 0.2)); continue; }

      // "+ X% life" → Suppression Life (stored as %)
      const lifeM = s.match(/\+\s*([\d.]+)%\s*life$/);
      if (lifeM) { g('fac_sup_life', parseFloat(lifeM[1]).toFixed(1)); continue; }
    }
  }

  // ── Weapon exp lookup map ─────────────────────────────────────────────
  // API v2 returns weaponexp as an array: [{ id, name, exp }, ...]
  // item.id on equipment items matches the id in this array.
  const weaponExpMap = {};
  for (const entry of (data.weaponexp || [])) {
    if (entry.id != null) weaponExpMap[entry.id] = entry.exp;
  }

  // ── Equipment → weapons + armor ──────────────────────────────────────
  // Slot IDs per Torn API v2:
  //  1=Primary, 2=Secondary, 3=Melee, 4=Body armor, 5=Temp,
  //  6=Helmet, 7=Pants, 8=Boots, 9=Gloves
  const equipment = data.equipment || [];

  for (const item of equipment) {
    const slot    = item.slot;
    const name    = item.name || '';
    // Stats (damage / accuracy / armor) are under item.stats in API v2
    const stats   = item.stats   || {};
    const bonuses = item.bonuses || [];

    // Apply weapon bonus pair (slots 1-3)
    const applyWepBonuses = (wepKey) => {
      const b0name = validBonus(bonuses[0]?.bonus ?? bonuses[0]?.name ?? bonuses[0]?.title);
      const b1name = validBonus(bonuses[1]?.bonus ?? bonuses[1]?.name ?? bonuses[1]?.title);
      g(`wep_${wepKey}_bonus1`, b0name);
      g(`wep_${wepKey}_blvl1`,  b0name !== 'None' ? bonusLvl(bonuses[0]?.value) : '0');
      g(`wep_${wepKey}_bonus2`, b1name);
      g(`wep_${wepKey}_blvl2`,  b1name !== 'None' ? bonusLvl(bonuses[1]?.value) : '0');
    };

    // Apply armor slot
    // Always load the armor rating (stats.armor) even if the type isn't in our list
    const applyArmor = (slot_key) => {
      const armorType = getArmorType(name);
      if (armorType !== 'none') g(slot_key, armorType);
      // stats.armor is the armor rating value in API v2
      if (stats.armor != null) g(`${slot_key}_r`, stats.armor.toFixed(2));
      // Armor bonus level is already in % (e.g. 12 = 12%)
      if (bonuses[0]?.value != null) g(`${slot_key}_bl`, bonusLvl(bonuses[0].value));
    };

    if (slot === 1) {
      const match = Object.keys(WEAPON_PRIMARY).find(n => n.toLowerCase() === name.toLowerCase());
      if (match) g('wep_p_name', match);
      if (stats.damage   != null) g('wep_p_dmg', stats.damage);
      if (stats.accuracy != null) g('wep_p_acc', stats.accuracy);
      // Weapon exp: look up item.id in the weaponexp array
      const pExp = weaponExpMap[item.id];
      if (pExp != null) g('wep_p_exp', pExp);
      if (item.ammo_type) g('wep_p_ammo', item.ammo_type.toUpperCase().slice(0, 2));
      applyWepBonuses('p');

    } else if (slot === 2) {
      const match = Object.keys(WEAPON_SECONDARY).find(n => n.toLowerCase() === name.toLowerCase());
      if (match) g('wep_s_name', match);
      if (stats.damage   != null) g('wep_s_dmg', stats.damage);
      if (stats.accuracy != null) g('wep_s_acc', stats.accuracy);
      const sExp = weaponExpMap[item.id];
      if (sExp != null) g('wep_s_exp', sExp);
      if (item.ammo_type) g('wep_s_ammo', item.ammo_type.toUpperCase().slice(0, 2));
      applyWepBonuses('s');

    } else if (slot === 3) {
      const match = Object.keys(WEAPON_MELEE).find(n => n.toLowerCase() === name.toLowerCase());
      if (match) g('wep_m_name', match);
      if (stats.damage   != null) g('wep_m_dmg', stats.damage);
      if (stats.accuracy != null) g('wep_m_acc', stats.accuracy);
      const mExp = weaponExpMap[item.id];
      if (mExp != null) g('wep_m_exp', mExp);
      applyWepBonuses('m');

    } else if (slot === 5) {
      const match = TEMP_ITEMS.find(n => n.toLowerCase() === name.toLowerCase());
      if (match) g('wep_t_name', match);

    } else if (slot === 4) { applyArmor('body');
    } else if (slot === 6) { applyArmor('helm');
    } else if (slot === 7) { applyArmor('pants');
    } else if (slot === 8) { applyArmor('boots');
    } else if (slot === 9) { applyArmor('gloves');
    }
  }
}

// -----------------------------------------------------------------------
// loadFromAPI — fetch player data from Torn API v2 and apply to panel
// -----------------------------------------------------------------------
async function loadFromAPI(prefix) {
  const keyEl    = document.getElementById(`${prefix}_api_key`);
  const statusEl = document.getElementById(`${prefix}_api_status`);
  const key      = keyEl.value.trim();

  if (!key) {
    statusEl.className = 'api-status err';
    statusEl.textContent = 'Enter an API key first.';
    return;
  }

  statusEl.className = 'api-status';
  statusEl.textContent = 'Loading…';

  const url = `https://api.torn.com/v2/user/?selections=profile,battlestats,education,equipment,job,merits,perks,property,weaponexp&key=${key}`;

  try {
    const res  = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.error) {
      statusEl.className = 'api-status err';
      statusEl.textContent = `API error ${data.error.code}: ${data.error.error}`;
      return;
    }

    applyAPIData(prefix, data);
    statusEl.className = 'api-status ok';
    statusEl.textContent = `Loaded: ${data.profile?.name ?? 'unknown'}`;

    // Show manual-entry warning and highlight relevant sections
    showManualWarn(prefix);

  } catch (err) {
    statusEl.className = 'api-status err';
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('CORS')) {
      statusEl.textContent = 'CORS error — open via a web server, not file://';
    } else {
      statusEl.textContent = `Error: ${err.message}`;
    }
  }
}

// -----------------------------------------------------------------------
// showManualWarn — show the post-API warning banner and highlight fields
// -----------------------------------------------------------------------
const MANUAL_WARN_FIELD_IDS = [
  'wep_p_reload',   // Allow Reload — Primary
  'wep_s_reload',   // Allow Reload — Secondary
  'wep_p_mod1',     // Primary weapon mod 1 — not in API
  'wep_p_mod2',     // Primary weapon mod 2 — not in API
  'wep_s_mod1',     // Secondary weapon mod 1 — not in API
  'wep_s_mod2',     // Secondary weapon mod 2 — not in API
  'wep_p_ammo',     // Primary ammo type — not in API
  'wep_s_ammo',     // Secondary ammo type — not in API
  'att_p',          // Attack weight — Primary %
  'att_s',          // Attack weight — Secondary %
  'att_m',          // Attack weight — Melee %
  'att_t',          // Attack weight — Temp %
  'fist',           // Unarmed Type
  'addiction',      // Drug addiction % — not in API
];

function showManualWarn(prefix) {
  const warn = document.getElementById(`${prefix}_manual_warn`);
  if (warn) warn.style.display = 'flex';

  // Whole-section highlight for sections where all data is missing from API

  // Individual field highlights for everything else
  for (const fieldId of MANUAL_WARN_FIELD_IDS) {
    document.getElementById(`${prefix}_${fieldId}`)
      ?.closest('.field')
      ?.classList.add('field-review');
  }
}

// -----------------------------------------------------------------------
// dismissManualWarn — hide banner and remove all highlights
// -----------------------------------------------------------------------
function dismissManualWarn(prefix) {
  const warn = document.getElementById(`${prefix}_manual_warn`);
  if (warn) warn.style.display = 'none';


  for (const fieldId of MANUAL_WARN_FIELD_IDS) {
    document.getElementById(`${prefix}_${fieldId}`)
      ?.closest('.field')
      ?.classList.remove('field-review');
  }
}

// -----------------------------------------------------------------------
// savePlayerConfig — serialize all panel inputs to a JSON file download
// -----------------------------------------------------------------------
function savePlayerConfig(prefix) {
  const panel = document.getElementById(`${prefix}panel`);
  const config = { _prefix: prefix, _version: 1 };

  panel.querySelectorAll('input[type="text"], input[type="number"], select').forEach(el => {
    if (!el.id || el.id === `${prefix}_api_key`) return;
    config[el.id] = el.value;
  });
  panel.querySelectorAll('input[type="checkbox"]').forEach(el => {
    if (!el.id) return;
    config[el.id] = el.checked;
  });

  const playerName = document.getElementById(`${prefix}_name`)?.value || prefix;
  const filename   = `torn_sim_${playerName.replace(/[^a-z0-9_-]/gi, '_')}.json`;
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// -----------------------------------------------------------------------
// loadPlayerConfig — load a JSON config file and apply it to a panel
// -----------------------------------------------------------------------
function loadPlayerConfig(prefix) {
  const input    = document.createElement('input');
  input.type     = 'file';
  input.accept   = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const config = JSON.parse(ev.target.result);

        // Allow loading a config saved under a different prefix (e.g. p1 → p2)
        const srcPrefix = config._prefix || prefix;

        for (const [id, val] of Object.entries(config)) {
          if (id.startsWith('_')) continue;  // skip meta keys
          // Remap prefix if needed (e.g. loading a p1 save into p2 slot)
          const targetId = srcPrefix !== prefix
            ? id.replace(new RegExp(`^${srcPrefix}_`), `${prefix}_`)
            : id;
          const el = document.getElementById(targetId);
          if (!el) continue;
          if (el.type === 'checkbox') {
            el.checked = !!val;
          } else {
            el.value = val;
          }
        }

        // Update API status span to indicate a file was loaded
        const statusEl = document.getElementById(`${prefix}_api_status`);
        if (statusEl) {
          statusEl.className   = 'api-status ok';
          statusEl.textContent = `Config loaded: ${file.name}`;
        }
      } catch (err) {
        const statusEl = document.getElementById(`${prefix}_api_status`);
        if (statusEl) {
          statusEl.className   = 'api-status err';
          statusEl.textContent = `Load error: ${err.message}`;
        }
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// -----------------------------------------------------------------------
// Init
// -----------------------------------------------------------------------
populateSelects();
