export const ps2gg = {
  altsUrl: 'http://alts:3003',
}

export const census = {
  wsUrl: 'wss://push.nanite-systems.net/streaming?environment=ps2&service-id=s:ps2gg',
  wsFallbackUrl: 'wss://push.planetside2.com/streaming?environment=ps2&service-id=s:ps2gg',
}

export const servers = {
  '1': 'Connery',
  '10': 'Miller',
  '13': 'Cobalt',
  '17': 'Emerald',
  '40': 'SolTech',
}

export const continents = {
  '2': 'Indar',
  '4': 'Hossin',
  '6': 'Amerish',
  '8': 'Esamir',
  '344': 'Oshur',
}

export const vehicles = {
  '1': 'Flash',
  '2': 'Sunderer',
  '3': 'Lightning',
  '4': 'Magrider',
  '5': 'Vanguard',
  '6': 'Prowler',
  '7': 'Scythe',
  '8': 'Reaver',
  '9': 'Mosquito',
  '10': 'Liberator',
  '11': 'Galaxy',
  '12': 'Harasser',
  '14': 'Valkyrie',
  '15': 'Ant',
  '2019': 'Bastion',
}

export const infantry = {
  '1': 'Infiltrator',
  '3': 'Light Assault',
  '4': 'Medic',
  '5': 'Engineer',
  '6': 'Heavy Assault',
  '7': 'MAX',
  '8': 'Infiltrator',
  '10': 'Light Assault',
  '11': 'Medic',
  '12': 'Engineer',
  '13': 'Heavy Assault',
  '14': 'MAX',
  '15': 'Infiltrator',
  '17': 'Light Assault',
  '18': 'Medic',
  '19': 'Engineer',
  '20': 'Heavy Assault',
  '21': 'MAX',
  '28': 'Infiltrator',
  '29': 'Light Assault',
  '30': 'Medic',
  '31': 'Engineer',
  '32': 'Heavy Assault',
  '45': 'MAX',
}

export const esf = {
  '7': 'Scythe',
  '8': 'Reaver',
  '9': 'Mosquito',
}

export const mbt = {
  '4': 'Magrider',
  '5': 'Vanguard',
  '6': 'Prowler',
}

export const a2aWeapons = {
  '4900': 'M18 Needler',
  '4302': 'Saron Laser Cannon',
  '4600': 'M20 Mustang',

  '4905': 'Tomcat A2AM Pods',
  '4300': 'Photon A2A Missile Pods',
  '4602': 'Tomcat A2AM Pods',

  '4911': 'M18 Rotary',
  '4304': 'Maelstrom Turbo Laser',
  '4604': 'Vortek Rotary',

  '5050': 'M18 Locust',
  '4445': 'Antares LC',
  '4745': 'M20 Kestrel',

  '5052': 'Coyote Missiles',
  '4447': 'Coyote Missiles',
  '4747': 'Coyote Missiles',
}

export const a2gWeapons = {
  '4903': 'Hellfire Rocket Pods',
  '4301': 'Dual Photon Pods',
  '4601': 'Breaker Rocket Pods',

  '4906': 'M14 Banshee',
  '4305': 'Light PPA',
  '4605': 'M30 Mustang AH',

  '5051': 'Hornet Missiles',
  '4446': 'Hornet Missiles',
  '4746': 'Hornet Missiles',
}

export const factions = {
  '1': 'VS',
  '2': 'NC',
  '3': 'TR',
}

export const emojis = {
  isis: '<a:isis:502203894487842826>',
  online: '<:online:717334812083355658>',
  offline: '<:offline:717334809621430352>',
  yellow_bread: '<:yellow_bread:756283540731068486>',
  cn: '🇨🇳',
  eu: '🇪🇺',
  na: '🇺🇸',
  tr: '<:tr:760726804339228694>',
  nc: '<:nc:760726575108325397>',
  vs: '<:vs:760726805073362944>',
  'heavy assault': '<:Heavy:760748146027397120>',
  'light assault': '<:LightAssault:760748145989648385>',
  infiltrator: '<:Infiltrator:760748146023858237>',
  medic: '<:Medic:760748146027921468>',
  engineer: '<:Engineer:760748145801297990>',
  max: '<:MAX:760748146073927710>',
  a2a: '<:Mosquito:730289338491076702>',
  a2g: '<:Mosquito:730289338491076702>',
  esf: '<:Mosquito:730289338491076702>',
  mbt: '<:MBT:760748147109527552>',
  flash: '<:Flash:760748146023596042>',
  sunderer: '<:Sunderer:760748145981390849>',
  lightning: '<:Lightning:760748146036572200>',
  harasser: '<:Harasser:760748145864474645>',
  ant: '<:Ant:760748145688051712>',
  bastion: '<:Air:760750628665950238>',
  mosquito: '<:Mosquito:730289338491076702>',
  scythe: '<:Scythe:730289338838941786>',
  reaver: '<:Reaver:730289338893729872>',
  liberator: '<:Liberator:730289338780352554>',
  galaxy: '<:Galaxy:730289338755055616>',
  valkyrie: '<:Valkyrie:730289338923089980>',
}

export const roleThresholds = {
  pilot: {
    esf: {
      playTimePercent: 0.2,
      kills: 3000,
    },
  },
}
