
const CODENAME_PREFIXES = ['The', 'Operation'];
const CODENAME_NAMES = [
  'Nightingale', 'Kraken', 'Phoenix', 'Shadow', 
  'Phantom', 'Raven', 'Dragon', 'Titan'
];

export function generateCodename(): string {
  const prefix = CODENAME_PREFIXES[
    Math.floor(Math.random() * CODENAME_PREFIXES.length)
  ];
  const name = CODENAME_NAMES[
    Math.floor(Math.random() * CODENAME_NAMES.length)
  ];
  return `${prefix} ${name}`;
}

export function generateMissionProbability(): number {
  return Math.round(Math.random() * 100);
}


