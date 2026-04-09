export enum UpdateCategory {
  NONE = 0,
  PAINT = 1 << 0,
  SHAPE = 1 << 1,
  BOUNDS = 1 << 2,
  TRANSFORM = 1 << 3,
  LAYOUT = 1 << 4,
  PICK = 1 << 5
}

type AttributeDeltaClassifier = (prev: unknown, next: unknown) => UpdateCategory;

export const ATTRIBUTE_CATEGORY: Record<string, UpdateCategory> = {
  fill: UpdateCategory.PAINT,
  opacity: UpdateCategory.PAINT,
  fillOpacity: UpdateCategory.PAINT,
  strokeOpacity: UpdateCategory.PAINT,
  lineDash: UpdateCategory.PAINT,
  lineDashOffset: UpdateCategory.PAINT,
  lineCap: UpdateCategory.PAINT,
  lineJoin: UpdateCategory.PAINT,
  miterLimit: UpdateCategory.PAINT,
  shadowColor: UpdateCategory.PAINT,
  x: UpdateCategory.TRANSFORM | UpdateCategory.BOUNDS,
  y: UpdateCategory.TRANSFORM | UpdateCategory.BOUNDS,
  scaleX: UpdateCategory.TRANSFORM | UpdateCategory.BOUNDS,
  scaleY: UpdateCategory.TRANSFORM | UpdateCategory.BOUNDS,
  angle: UpdateCategory.TRANSFORM | UpdateCategory.BOUNDS,
  anchor: UpdateCategory.TRANSFORM | UpdateCategory.BOUNDS,
  anchor3d: UpdateCategory.TRANSFORM | UpdateCategory.BOUNDS,
  postMatrix: UpdateCategory.TRANSFORM | UpdateCategory.BOUNDS,
  layout: UpdateCategory.LAYOUT,
  zIndex: UpdateCategory.PAINT,
  visible: UpdateCategory.PAINT | UpdateCategory.PICK,
  lineWidth: UpdateCategory.SHAPE | UpdateCategory.BOUNDS | UpdateCategory.PICK,
  width: UpdateCategory.SHAPE | UpdateCategory.BOUNDS,
  height: UpdateCategory.SHAPE | UpdateCategory.BOUNDS
};

const ATTRIBUTE_DELTA_CLASSIFIER: Record<string, AttributeDeltaClassifier> = {
  stroke: (prev, next) => {
    const prevEnabled = prev != null && prev !== false;
    const nextEnabled = next != null && next !== false;
    if (prevEnabled !== nextEnabled) {
      return UpdateCategory.PAINT | UpdateCategory.BOUNDS | UpdateCategory.PICK;
    }
    return UpdateCategory.PAINT;
  },
  shadowBlur: (prev, next) => {
    const prevBlur = Number(prev ?? 0);
    const nextBlur = Number(next ?? 0);
    if (prevBlur !== nextBlur && (prevBlur > 0 || nextBlur > 0)) {
      return UpdateCategory.PAINT | UpdateCategory.BOUNDS;
    }
    return UpdateCategory.PAINT;
  }
};

export function classifyAttributeDelta(key: string, prev: unknown, next: unknown): UpdateCategory {
  const dynamicClassifier = ATTRIBUTE_DELTA_CLASSIFIER[key];
  if (dynamicClassifier) {
    return dynamicClassifier(prev, next);
  }

  return ATTRIBUTE_CATEGORY[key] ?? UpdateCategory.PAINT;
}

export function classifyAffectedKeyConservatively(key: string): UpdateCategory {
  if (key === 'stroke') {
    return UpdateCategory.PAINT | UpdateCategory.BOUNDS | UpdateCategory.PICK;
  }

  if (key === 'shadowBlur') {
    return UpdateCategory.PAINT | UpdateCategory.BOUNDS;
  }

  return ATTRIBUTE_CATEGORY[key] ?? UpdateCategory.PAINT;
}

export function classifyAffectedKeys(keys: Iterable<string>): UpdateCategory {
  let category = UpdateCategory.NONE;
  for (const key of keys) {
    category |= classifyAffectedKeyConservatively(key);
  }
  return category;
}
