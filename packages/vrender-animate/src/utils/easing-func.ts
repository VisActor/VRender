import { CurveContext, CustomPath2D } from '@visactor/vrender-core';

export function generatorPathEasingFunc(path: string) {
  const customPath = new CustomPath2D();
  customPath.setCtx(new CurveContext(customPath));
  customPath.fromString(path, 0, 0, 1, 1);

  return (x: number) => {
    return customPath.getYAt(x);
  };
}
