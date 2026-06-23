export function isBindingContextLoaded(loadedContexts: WeakSet<object>, context: unknown): boolean {
  const key =
    (typeof context === 'object' && context !== null) || typeof context === 'function'
      ? (context as object)
      : loadedContexts;

  if (loadedContexts.has(key)) {
    return true;
  }

  loadedContexts.add(key);
  return false;
}
