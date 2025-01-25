export const generateCodename = (): string => {
    const names = ['Nightingale', 'Kraken', 'Phoenix', 'Shadow', 'Specter'];
    const adjectives = ['Silent', 'Phantom', 'Midnight', 'Stealth', 'Ghost'];
    return `The ${adjectives[Math.floor(Math.random() * adjectives.length)]} ${names[Math.floor(Math.random() * names.length)]}`;
  };
  
export const generateSelfDestructCode = (): string => 
    Math.random().toString(36).substring(2, 8).toUpperCase();