import { assertionError } from '../assertions.mjs';

/** 创建带引线的柱条标签。标签位置变化时，引线随实际布局生成。 */
export function createSpec(v, stage) {
  const bar = v.createRect({ x: 60, y: 60, width: 160, height: 56, fill: '#a6c8f2' });
  const label = new v.RectLabel({
    type: 'rect',
    data: [{ id: 'total', text: 'Total' }],
    getBaseMarks: () => [bar],
    position: 'right',
    offset: 24,
    line: { visible: true, style: { stroke: '#2d548c', lineWidth: 2 } },
    textStyle: { fontSize: 18, fontFamily: 'Arial', fill: '#222222' },
    smartInvert: false,
    overlap: false,
    animationEnter: false,
    animationExit: false,
    animationUpdate: { duration: 100, easing: 'linear', increaseEffect: false }
  });
  stage.defaultLayer.add(bar);
  stage.defaultLayer.add(label);
  return { bar, label };
}

/** 通过公开更新接口将同一标签移入柱条，再移回外侧。 */
export async function exercise(page) {
  const removed = await page.evaluate(() => {
    const objects = window.__visualObjects;
    const { label } = objects;
    const oldLine = label.getChildren().find(child => child.type === 'line');
    if (!oldLine) return false;

    objects.oldLine = oldLine;
    objects.outsideX = label.getChildren().find(child => child.type === 'text').attribute.x;
    label.setAttribute('position', 'inside-middle');
    return !oldLine.parent && label.getChildren().every(child => child.type !== 'line');
  });
  if (!removed) throw assertionError('标签移入柱条后引线未移除');
  await page.waitForFunction(() => {
    const { bar, label } = window.__visualObjects;
    return label.getChildren().find(child => child.type === 'text').attribute.x < bar.AABBBounds.x2;
  });
  await page.evaluate(() => window.__visualObjects.label.setAttribute('position', 'right'));
}

/** 更新动画结束后，确认同一标签外侧只绘制一条引线。 */
export async function verify(page) {
  await page.waitForFunction(() => {
    const { label, outsideX } = window.__visualObjects;
    const text = label.getChildren().find(child => child.type === 'text');
    return Math.abs(text.attribute.x - outsideX) < 0.01;
  });
  const ok = await page.evaluate(() => {
    const { label, oldLine } = window.__visualObjects;
    const children = label.getChildren();
    const lines = children.filter(child => child.type === 'line');
    window.__visualStage.render();
    return children.length === 2 && lines.length === 1 && lines[0] !== oldLine && lines[0].attribute.points.length === 2;
  });
  if (!ok) throw assertionError('外侧标签和引线的最终绘制不正确');
}
