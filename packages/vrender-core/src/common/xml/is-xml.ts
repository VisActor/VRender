export function isSvg(str: string) {
  return str.startsWith('<svg') || str.startsWith('<?xml');
}

export function isXML(str: string) {
  return str.startsWith('<');
}
