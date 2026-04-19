// =====================================================================
// DATA TABLES — torn_sim data.js
// =====================================================================

const WEAPON_PRIMARY = {
  '9mm Uzi':              { clip_size:30,  clips:3, rof_h:25, rof_l:15, weapon_type:'SMG' },
  'AK-47':                { clip_size:30,  clips:3, rof_h:8,  rof_l:4,  weapon_type:'Rifle' },
  'AK74U':                { clip_size:30,  clips:3, rof_h:6,  rof_l:4,  weapon_type:'SMG' },
  'ArmaLite M-15A4':      { clip_size:15,  clips:3, rof_h:5,  rof_l:3,  weapon_type:'Rifle' },
  'Benelli M1 Tactical':  { clip_size:7,   clips:3, rof_h:3,  rof_l:2,  weapon_type:'Shotgun' },
  'Benelli M4 Super':     { clip_size:7,   clips:3, rof_h:3,  rof_l:2,  weapon_type:'Shotgun' },
  'Bushmaster Carbon 15': { clip_size:30,  clips:3, rof_h:28, rof_l:2,  weapon_type:'SMG' },
  'Enfield SA-80':        { clip_size:30,  clips:3, rof_h:5,  rof_l:2,  weapon_type:'Rifle' },
  'Gold Plated AK-47':    { clip_size:45,  clips:3, rof_h:6,  rof_l:4,  weapon_type:'Rifle' },
  'Heckler & Koch SL8':   { clip_size:10,  clips:3, rof_h:9,  rof_l:2,  weapon_type:'Rifle' },
  'Ithaca 37':            { clip_size:4,   clips:3, rof_h:4,  rof_l:1,  weapon_type:'Shotgun' },
  'Jackhammer':           { clip_size:10,  clips:3, rof_h:10, rof_l:5,  weapon_type:'Shotgun' },
  'M16 A2 Rifle':         { clip_size:30,  clips:3, rof_h:9,  rof_l:5,  weapon_type:'Rifle' },
  'M249 SAW':             { clip_size:100, clips:3, rof_h:25, rof_l:15, weapon_type:'Machine gun' },
  'M4A1 Colt Carbine':    { clip_size:30,  clips:3, rof_h:9,  rof_l:4,  weapon_type:'Rifle' },
  'MP 40':                { clip_size:32,  clips:3, rof_h:5,  rof_l:3,  weapon_type:'SMG' },
  'MP5 Navy':             { clip_size:30,  clips:3, rof_h:8,  rof_l:5,  weapon_type:'SMG' },
  'Mag 7':                { clip_size:5,   clips:3, rof_h:4,  rof_l:2,  weapon_type:'Shotgun' },
  'Minigun':              { clip_size:200, clips:3, rof_h:30, rof_l:20, weapon_type:'Machine gun' },
  'Negev NG-5':           { clip_size:200, clips:3, rof_h:21, rof_l:13, weapon_type:'Machine gun' },
  'Nock Gun':             { clip_size:7,   clips:3, rof_h:7,  rof_l:7,  weapon_type:'Shotgun' },
  'P90':                  { clip_size:50,  clips:3, rof_h:30, rof_l:10, weapon_type:'SMG' },
  'PKM':                  { clip_size:50,  clips:3, rof_h:17, rof_l:9,  weapon_type:'Machine gun' },
  'Rheinmetall MG 3':     { clip_size:100, clips:3, rof_h:30, rof_l:20, weapon_type:'Machine gun' },
  'SIG 552':              { clip_size:30,  clips:3, rof_h:7,  rof_l:4,  weapon_type:'Rifle' },
  'SKS Carbine':          { clip_size:10,  clips:3, rof_h:8,  rof_l:1,  weapon_type:'Rifle' },
  'Sawed-Off Shotgun':    { clip_size:2,   clips:3, rof_h:2,  rof_l:1,  weapon_type:'Shotgun' },
  'Snow Cannon':          { clip_size:950, clips:3, rof_h:10, rof_l:3,  weapon_type:'Heavy artillery' },
  'Steyr AUG':            { clip_size:30,  clips:3, rof_h:8,  rof_l:5,  weapon_type:'Rifle' },
  'Stoner 96':            { clip_size:100, clips:3, rof_h:11, rof_l:6,  weapon_type:'Machine gun' },
  'Tavor TAR-21':         { clip_size:30,  clips:3, rof_h:8,  rof_l:4,  weapon_type:'Rifle' },
  'Thompson':             { clip_size:20,  clips:3, rof_h:5,  rof_l:3,  weapon_type:'SMG' },
  'Vektor CR-21':         { clip_size:20,  clips:3, rof_h:8,  rof_l:7,  weapon_type:'Rifle' },
  'XM8 Rifle':            { clip_size:30,  clips:3, rof_h:20, rof_l:5,  weapon_type:'Rifle' },
};

const WEAPON_SECONDARY = {
  'BT MP9':             { clip_size:30, clips:3, rof_h:25, rof_l:2,  weapon_type:'SMG' },
  'Beretta 92FS':       { clip_size:20, clips:3, rof_h:6,  rof_l:3,  weapon_type:'Pistol' },
  'Beretta M9':         { clip_size:17, clips:3, rof_h:5,  rof_l:4,  weapon_type:'Pistol' },
  'Blowgun':            { clip_size:1,  clips:3, rof_h:1,  rof_l:1,  weapon_type:'Piercing' },
  'Blunderbuss':        { clip_size:1,  clips:3, rof_h:1,  rof_l:1,  weapon_type:'Shotgun' },
  'China Lake':         { clip_size:3,  clips:3, rof_h:1,  rof_l:1,  weapon_type:'Heavy artillery' },
  'Cobra Derringer':    { clip_size:2,  clips:3, rof_h:2,  rof_l:1,  weapon_type:'Pistol' },
  'Desert Eagle':       { clip_size:8,  clips:3, rof_h:3,  rof_l:2,  weapon_type:'Pistol' },
  'Fiveseven':          { clip_size:20, clips:3, rof_h:7,  rof_l:6,  weapon_type:'Pistol' },
  'Flamethrower':       { clip_size:1,  clips:3, rof_h:1,  rof_l:1,  weapon_type:'Heavy artillery' },
  'Glock 17':           { clip_size:20, clips:3, rof_h:6,  rof_l:3,  weapon_type:'Pistol' },
  'Lorcin 380':         { clip_size:6,  clips:3, rof_h:5,  rof_l:1,  weapon_type:'Pistol' },
  'Luger':              { clip_size:8,  clips:3, rof_h:3,  rof_l:1,  weapon_type:'Pistol' },
  'Magnum':             { clip_size:6,  clips:3, rof_h:2,  rof_l:1,  weapon_type:'Pistol' },
  'Milkor MGL':         { clip_size:6,  clips:3, rof_h:1,  rof_l:1,  weapon_type:'Heavy artillery' },
  'MP5k':               { clip_size:15, clips:3, rof_h:7,  rof_l:5,  weapon_type:'SMG' },
  'Qsz-92':             { clip_size:15, clips:3, rof_h:12, rof_l:2,  weapon_type:'Pistol' },
  'RPG Launcher':       { clip_size:1,  clips:3, rof_h:1,  rof_l:1,  weapon_type:'Heavy artillery' },
  'Raven MP25':         { clip_size:6,  clips:3, rof_h:5,  rof_l:3,  weapon_type:'Pistol' },
  'Ruger 57':           { clip_size:20, clips:3, rof_h:4,  rof_l:3,  weapon_type:'Pistol' },
  'S&W Revolver':       { clip_size:6,  clips:3, rof_h:2,  rof_l:1,  weapon_type:'Pistol' },
  'Skorpion':           { clip_size:20, clips:3, rof_h:5,  rof_l:3,  weapon_type:'SMG' },
  'SMAW Launcher':      { clip_size:1,  clips:3, rof_h:1,  rof_l:1,  weapon_type:'Heavy artillery' },
  'Springfield 1911':   { clip_size:8,  clips:3, rof_h:3,  rof_l:2,  weapon_type:'Pistol' },
  'Taurus':             { clip_size:13, clips:3, rof_h:12, rof_l:1,  weapon_type:'Pistol' },
  'TMP':                { clip_size:15, clips:3, rof_h:6,  rof_l:3,  weapon_type:'SMG' },
  'Type 98 Anti Tank':  { clip_size:1,  clips:3, rof_h:1,  rof_l:1,  weapon_type:'Heavy artillery' },
  'USP':                { clip_size:16, clips:3, rof_h:5,  rof_l:4,  weapon_type:'Pistol' },
};

const WEAPON_MELEE = {
  'Axe':                    { jap:false, weapon_type:'Clubbing' },
  'Baseball Bat':           { jap:false, weapon_type:'Clubbing' },
  'Bo Staff':               { jap:false, weapon_type:'Clubbing' },
  'Bread Knife':            { jap:false, weapon_type:'Slashing' },
  'Butterfly Knife':        { jap:false, weapon_type:'Piercing' },
  'Chain Whip':             { jap:false, weapon_type:'Slashing' },
  'Claymore Sword':         { jap:false, weapon_type:'Slashing' },
  'Cricket Bat':            { jap:false, weapon_type:'Clubbing' },
  'Crowbar':                { jap:false, weapon_type:'Clubbing' },
  'Dagger':                 { jap:false, weapon_type:'Piercing' },
  'Diamond Bladed Knife':   { jap:false, weapon_type:'Piercing' },
  'Flail':                  { jap:false, weapon_type:'Clubbing' },
  'Frying Pan':             { jap:false, weapon_type:'Clubbing' },
  'Guandao':                { jap:false, weapon_type:'Slashing' },
  'Hammer':                 { jap:false, weapon_type:'Clubbing' },
  'Handbag':                { jap:false, weapon_type:'Clubbing' },
  'Kama':                   { jap:true,  weapon_type:'Slashing' },
  'Katana':                 { jap:true,  weapon_type:'Slashing' },
  'Kitchen Knife':          { jap:false, weapon_type:'Piercing' },
  'Knuckle Dusters':        { jap:false, weapon_type:'Clubbing' },
  'Kodachi':                { jap:true,  weapon_type:'Slashing' },
  'Leather Bullwhip':       { jap:false, weapon_type:'Slashing' },
  'Macana':                 { jap:false, weapon_type:'Piercing' },
  'Metal Nunchaku':         { jap:false, weapon_type:'Clubbing' },
  'Naval Cutlass':          { jap:false, weapon_type:'Slashing' },
  'Ninja Claws':            { jap:false, weapon_type:'Piercing' },
  'Pen Knife':              { jap:false, weapon_type:'Piercing' },
  'Poison Umbrella':        { jap:false, weapon_type:'Piercing' },
  'Sai':                    { jap:true,  weapon_type:'Piercing' },
  'Samurai Sword':          { jap:true,  weapon_type:'Slashing' },
  'Scimitar':               { jap:false, weapon_type:'Slashing' },
  'Sledgehammer':           { jap:false, weapon_type:'Clubbing' },
  'Spear':                  { jap:false, weapon_type:'Piercing' },
  'Swiss Army Knife':       { jap:false, weapon_type:'Piercing' },
  'Wooden Nunchaku':        { jap:false, weapon_type:'Clubbing' },
  'Yasukuni Sword':         { jap:true,  weapon_type:'Slashing' },
};

// Temp items — damaging ones get dmg/acc set in prepPlayer
const TEMP_ITEMS = [
  'None',
  'Smoke Grenade',
  'Tear Gas',
  'Pepper Spray',
  'Flash Grenade',
  'Melatonin',
  'Serotonin',
  'Epinephrine',
  'Tyrosine',
  'Molotov Cocktail',
  'Grenade',
  'HEG',
];

const ARMOR_TYPES = [
  'none',
  'assault',
  'combat',
  'delta',
  'dune',
  'eod',
  'marauder',
  'riot',
  'sentinel',
  'vanguard',
  'motorcycle',
];

const WEAPON_BONUSES = [
  'None','Achilles','Assassinate','Berserk','Blindfire','Blindside','Bleed','Bloodlust',
  'Burn','Comeback','Conserve','Cripple','Crusher','Cupid','Deadeye','Deadly','Demoralize',
  'Disarm','Double Tap','Double-edged','Empower','Eviscerate','Execute','Expose','Finale',
  'Focus','Freeze','Frenzy','Fury','Grace','Hazardous','Home Run','Lacerate','Motivation',
  'Paralyze','Parry','Penetrate','Poison','Powerful','Puncture','Quicken','Rage','Roshambo',
  'Slow','Smurf','Specialist','Stun','Suppress','Sure Shot','Throttle','Toxin','Weaken',
  'Wind-up','Wither',
];

const GUN_MODS = [
  'None',
  'Reflex Sight','Holographic Sight','Acog Sight','Thermal Sight',
  'Custom Grip','Bipod','Tripod',
  'Standard Brake','Heavy Duty Brake','Tactical Brake',
  'Adjustable Trigger','Hair Trigger',
  '1mw Laser','5mw Laser','30mw Laser','100mw Laser',
  'Small Light','Precision Light','Tactical Illuminator',
  'Small Suppressor','Standard Suppressor','Large Suppressor',
  'Skeet Choke','Improved Choke','Full Choke',
  'Recoil Pad',
  'Extended Mags','High Capacity Mags',
  'Extra Clips x1','Extra Clips x2',
];

// Companies — name must match exactly what is checked in sim logic
const COMPANY_NAMES = [
  'None',
  'Adult Novelties',     // star>=7: opponent passive.speed -25%
  'Amusement Park',      // star>=7: Epinephrine +25% effectiveness
  'Clothing Store',      // star>=5: self dex +25%; star==10: armor mitigation +20%
  'Firework Stand',      // star>=5: Flamethrower acc+10, dmg+25%
  'Furniture Store',     // star>=5: self str +25%; star==10: fist/kick dmg +1
  'Gas Station',         // star>=3: self spd +25%; star>=5: per-turn 10% heal; star==10: burn dmg+50%
  'Gents Strip Club',    // star>=3: self dex +25%; star>=5: Tyrosine +50%; star==10: melee dodge 25%
  'Gun Shop',            // star==10: ranged dmg +10%
  'Hair Salon',          // star==10: slashing melee dmg +20%
  'Ladies Strip Club',   // star>=3: self def +25%; star>=5: Serotonin +50%; star==10: reduce incoming melee -30%
  'Lingerie Store',      // star>=5 + no armor set: spd+50% dex+50%
  'Mining Corporation',  // star>=7: HP +10%
  'Music Store',         // star==10: all stats +15%
  'Private Security Firm', // star>=3: Flash Grenade resist; star>=7: armor mitigation +25% (if set bonus)
  'Pub',                 // star>=3: melee dmg +10%
  'Restaurant',          // star>=3: melee dmg +10%
];

// =====================================================================
// ARMOR COVERAGE TABLE
// Keys: body part → slot_armortype → coverage percentage (0-100)
// For the body slot the key is just the armor type (no prefix).
// For other slots the key is "slotname_armortype".
// =====================================================================
const ARMOR_COVERAGE = {
  arms: {
    assault:100, combat:23.18, delta:100, dune:100, eod:100,
    marauder:100, none:0, riot:100, sentinel:100, vanguard:100,
    gloves_assault:0.5,  gloves_combat:0.32, gloves_delta:0.5,
    gloves_dune:0.42,    gloves_eod:0.5,     gloves_marauder:0.5,
    gloves_none:0,       gloves_riot:0.78,   gloves_sentinel:0.5,
    gloves_vanguard:0.73,
  },
  chest: {
    assault:100, combat:100, delta:100, dune:100, eod:100,
    marauder:100, none:0, riot:100, sentinel:100, vanguard:100,
  },
  feet: {
    assault:0, combat:0, delta:0, dune:0, eod:0,
    marauder:0, none:0, riot:0, sentinel:0, vanguard:0,
    boots_assault:100,  boots_combat:100,  boots_delta:100,
    boots_dune:100,     boots_eod:100,     boots_marauder:100,
    boots_none:0,       boots_riot:100,    boots_sentinel:100,
    boots_vanguard:100,
    pants_assault:33.25, pants_combat:16.28, pants_delta:29.06,
    pants_dune:12.1,     pants_eod:0,        pants_marauder:0,
    pants_none:0,        pants_riot:39.96,   pants_sentinel:0,
    pants_vanguard:25.2,
  },
  groin: {
    assault:14.15, combat:36.04, delta:30.7, dune:9.05, eod:100,
    marauder:0, none:0, riot:99.9, sentinel:0, vanguard:35.39,
    pants_assault:100, pants_combat:100, pants_delta:100,
    pants_dune:100,    pants_eod:100,    pants_marauder:100,
    pants_none:0,      pants_riot:100,   pants_sentinel:100,
    pants_vanguard:99.07,
  },
  hands: {
    assault:20.73, combat:0, delta:13.4, dune:21.6, eod:16.88,
    marauder:5.05, none:0, riot:21.6, sentinel:0, vanguard:0.13,
    gloves_assault:100,  gloves_combat:100,  gloves_delta:100,
    gloves_dune:100,     gloves_eod:100,     gloves_marauder:100,
    gloves_none:0,       gloves_riot:100,    gloves_sentinel:100,
    gloves_vanguard:100,
  },
  head: {
    eod:4.68, none:0, assault:0, combat:0, delta:0,
    dune:0, marauder:0, riot:0, sentinel:0, vanguard:0,
    helmet_assault:66.53,  helmet_combat:67.49,    helmet_delta:27.13,
    helmet_dune:64.83,     helmet_eod:100,         helmet_marauder:100,
    helmet_motorcycle:85.35, helmet_none:0,         helmet_riot:99.61,
    helmet_sentinel:74.24, helmet_vanguard:39.3,
  },
  heart: {
    assault:100, combat:100, delta:100, dune:100, eod:100,
    marauder:100, none:0, riot:100, sentinel:100, vanguard:100,
  },
  legs: {
    assault:0.56, combat:0.98, delta:0.64, dune:0.46, eod:17.58,
    marauder:0, none:0, riot:3.01, sentinel:2.24, vanguard:0.28,
    boots_assault:9.07,  boots_combat:7.92,  boots_delta:10.25,
    boots_dune:10.47,    boots_eod:6.19,     boots_marauder:9.53,
    boots_none:0,        boots_riot:11.62,   boots_sentinel:5.63,
    boots_vanguard:5.83,
    pants_assault:100,   pants_combat:100,   pants_delta:100,
    pants_dune:100,      pants_eod:100,      pants_marauder:96.69,
    pants_none:0,        pants_riot:100,     pants_sentinel:100,
    pants_vanguard:100,
  },
  stomach: {
    assault:100, combat:100, delta:100, dune:100, eod:100,
    marauder:100, none:0, riot:100, sentinel:100, vanguard:100,
    pants_assault:3.84,  pants_combat:7.62,  pants_delta:8.59,
    pants_dune:12.28,    pants_eod:23.94,    pants_marauder:0.52,
    pants_none:0,        pants_riot:2.12,    pants_sentinel:4.71,
    pants_vanguard:0,
  },
  throat: {
    assault:81.16, combat:0, delta:88.81, dune:83.93, eod:100,
    marauder:84.72, none:0, riot:79.06, sentinel:95.91, vanguard:83.53,
    helmet_assault:3.99,     helmet_combat:0,      helmet_delta:0,
    helmet_dune:0,           helmet_eod:42.9,      helmet_marauder:60.57,
    helmet_motorcycle:23.19, helmet_none:0,         helmet_riot:0,
    helmet_sentinel:0, helmet_vanguard:0,
  },
};
