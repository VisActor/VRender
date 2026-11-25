import { assertionError } from '../assertions.mjs';

const scenarios = [
  { id: 'scroll-x', scroll: { scrollX: -150 }, target: [160, 40], point: [110, 120] },
  { id: 'scroll-y', scroll: { scrollY: -150 }, target: [40, 160], point: [110, 110] },
  { id: 'explicit-zero', scroll: { scrollX: -150, scrollY: 0 }, target: [160, 40], point: [110, 120] },
  { id: 'scroll-xy', scroll: { scrollX: -150, scrollY: -30 }, target: [160, 40], point: [110, 110] }
];

/** 验证缺省轴、显式零值与双轴滚动时，嵌套图元都能完整局部重绘。 */
export function createSpec(v, stage) {
  const scenes = scenarios.map(({ id, scroll, target: [targetX, targetY], point: [pointX, pointY] }, index) => {
    const offsetX = (index % 2) * 180;
    const offsetY = Math.floor(index / 2) * 160;
    const viewport = v.createGroup({
      x: 40 + offsetX,
      y: 60 + offsetY,
      width: 120,
      height: 100,
      clip: true
    });
    const content = v.createGroup({ x: 10, y: 5 });
    content.add(v.createRect({ x: 0, y: 0, width: 330, height: 260, fill: '#dde5f0' }));
    const target = v.createRect({ x: targetX, y: targetY, width: 80, height: 60, fill: '#3366cc' });
    target.addEventListener('pointerenter', () => target.setAttribute('fill', '#e8684a'));
    content.add(target);
    viewport.add(content);
    stage.defaultLayer.add(viewport);

    return { id, scroll, viewport, target, x: pointX + offsetX, y: pointY + offsetY };
  });

  const ctx = document.querySelector('#chart canvas').getContext('2d');
  const pixelAt = (x, y) => Array.from(ctx.getImageData(x, y, 1, 1).data);
  return { scenes, pixelAt };
}

/** 先通过公开属性滚动，再用真实鼠标悬停并分别重绘各组的局部区域。 */
export async function exercise(page) {
  const points = await page.evaluate(() => {
    const stage = window.__visualStage;
    const { scenes, pixelAt } = window.__visualObjects;
    for (const scene of scenes) scene.viewport.setAttributes(scene.scroll);
    stage.render();
    stage.enableDirtyBounds();

    return scenes.map(scene => {
      scene.before = pixelAt(scene.x, scene.y);
      return { x: scene.x, y: scene.y };
    });
  });

  await page.mouse.move(10, 10);
  for (const [index, { x, y }] of points.entries()) {
    await page.mouse.move(x, y);
    await page.evaluate(index => {
      const stage = window.__visualStage;
      const { scenes, pixelAt } = window.__visualObjects;
      const { x, y, target, viewport } = scenes[index];
      stage.dirtyBounds.setValue(x - 25, y - 20, x + 25, y + 20);
      stage.render();
      scenes[index].after = pixelAt(x, y);
      scenes[index].outside = pixelAt(viewport.attribute.x - 10, y);
      scenes[index].hovered = stage.pick(x, y).graphic === target && target.attribute.fill === '#e8684a';
    }, index);
  }
}

/** 同时核对鼠标命中、局部重绘像素和裁剪边界。 */
export async function verify(page) {
  const results = await page.evaluate(() => {
    return window.__visualObjects.scenes.map(({ id, before, after, hovered, outside }) => ({
      id,
      before,
      after,
      hovered,
      outside
    }));
  });
  const mismatches = results.filter(
    ({ before, after, hovered, outside }) =>
      !hovered ||
      String(before) !== '51,102,204,255' ||
      String(after) !== '232,104,74,255' ||
      String(outside) !== '255,255,255,255'
  );

  if (mismatches.length) {
    throw assertionError(`滚动组的 hover 应更新裁剪视口内实际像素，收到 ${JSON.stringify(mismatches)}`);
  }
}
