export function interpolateNumber(from: number, to: number, ratio: number): number {
  return from + (to - from) * ratio;
}
