export function getFirstArrayDuplicate<T>(array: T[]): T | undefined {
  const seenValues = new Set<T>();

  for (const entry of array) {
    if (seenValues.has(entry)) {
      return entry;
    }
    seenValues.add(entry);
  }
  return undefined;
}
