import { assertionError } from '../assertions.mjs';

/** 滚动组内的嵌套图元在 hover 后必须完整重绘。 */
export function createSpec(v, stage) {
  const viewport = v.createGroup({
    x: 40,
    y: 60,
    width: 120,
    height: 100,
    clip: true
  });
  const content = v.createGroup({ x: 10, y: 5 });
  const background = v.createRect({ x: 0, y: 0, width: 330, height: 150, fill: '#dde5f0' });
  const target = v.createRect({ x: 160, y: 40, width: 80, height: 60, fill: '#3366cc' });
  target.addEventListener('pointerenter', () => target.setAttribute('fill', '#e8684a'));
  content.add(background);
  content.add(target);
  viewport.add(content);
  stage.defaultLayer.add(viewport);

  return { viewport, target };
}

/** 通过公开属性滚动，再让真实鼠标进入裁剪区域内已经移动的矩形。 */
export async function exercise(page) {
  await page.evaluate(() => {
    const stage = window.__visualStage;
    window.__visualObjects.viewport.setAttributes({ scrollX: -150, scrollY: -30 });
    stage.render();
    stage.enableDirtyBounds();
    window.__scrollPixelBeforeHover = Array.from(
      document.querySelector('#chart canvas').getContext('2d').getImageData(110, 110, 1, 1).data
    );
  });

  await page.mouse.move(10, 10);
  await page.mouse.move(110, 110);
  await page.evaluate(() => {
    const stage = window.__visualStage;
    // 只重绘已滚入视口的目标区域，确保测试经过局部裁剪路径。
    stage.dirtyBounds.setValue(65, 85, 135, 130);
    stage.render();
  });
}

/** 核对被命中图元及局部重绘后的实际像素。 */
export async function verify(page) {
  const result = await page.evaluate(() => {
    const ctx = document.querySelector('#chart canvas').getContext('2d');
    const target = window.__visualObjects.target;
    return {
      before: window.__scrollPixelBeforeHover,
      after: Array.from(ctx.getImageData(110, 110, 1, 1).data),
      outside: Array.from(ctx.getImageData(30, 110, 1, 1).data),
      hovered: window.__visualStage.pick(110, 110).graphic === target && target.attribute.fill === '#e8684a'
    };
  });

  if (
    !result.hovered ||
    String(result.before) !== '51,102,204,255' ||
    String(result.after) !== '232,104,74,255' ||
    String(result.outside) !== '255,255,255,255'
  ) {
    throw assertionError(`滚动组的 hover 应更新裁剪视口内实际像素，收到 ${JSON.stringify(result)}`);
  }
}
