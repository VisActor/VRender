import { assertionError } from '../assertions.mjs';

const duration = 300;

/** 创建带引线的柱条标签。标签位置变化时，引线随实际布局生成。 */
export function createSpec(v, stage) {
  const previousTicker = stage.ticker;
  const ticker = new v.ManualTicker(stage);
  ticker.autoStop = false;
  stage.ticker = ticker;
  previousTicker.release();

  const bar = v.createRect({ x: 60, y: 60, width: 160, height: 56, fill: '#a6c8f2' });
  const label = new v.RectLabel({
    type: 'rect',
    data: [{ id: 'total', text: 'Total' }],
    getBaseMarks: () => [bar],
    position: 'inside-middle',
    offset: 64,
    line: { visible: true, style: { stroke: '#2d548c', lineWidth: 2 } },
    textStyle: { fontSize: 18, fontFamily: 'Arial', fill: '#222222' },
    smartInvert: false,
    overlap: false,
    animationEnter: false,
    animationExit: false,
    animationUpdate: { duration, easing: 'linear', increaseEffect: false }
  });
  stage.defaultLayer.add(bar);
  stage.defaultLayer.add(label);
  return { bar, label, ticker, duration };
}

/** 通过公开更新接口将标签移到柱外，再移入并移出，检查恢复时的实际动画帧。 */
export async function exercise(page) {
  const result = await page.evaluate(() => {
    const objects = window.__visualObjects;
    const { bar, label, ticker, duration } = objects;
    const findLine = () => label.getChildren().find(child => child.type === 'line');
    const text = label.getChildren().find(child => child.type === 'text');
    const insideX = text.attribute.x;
    const barRight = bar.AABBBounds.x2;

    const moveOutside = () => {
      label.setAttribute('position', 'right');
      ticker.tick(duration / 4);
      const overlappingLine = findLine();
      if (text.attribute.x <= insideX || text.AABBBounds.x1 >= barRight) {
        return '未到达文字仍与柱条重叠的中间帧';
      }
      if (overlappingLine && overlappingLine.attribute.visible !== false) {
        return '恢复引线动画中，文字与柱条重叠时应隐藏引线';
      }

      ticker.tick(duration / 2);
      const line = findLine();
      const [textPoint, barPoint] = line?.attribute.points ?? [];
      const midX = text.attribute.x;
      if (text.AABBBounds.x1 <= barRight) return '未到达文字与柱条分离的中间帧';
      if (
        !textPoint ||
        !barPoint ||
        line.attribute.visible === false ||
        Math.abs(textPoint.x - text.AABBBounds.x1) > 0.01 ||
        Math.abs(barPoint.x - barRight) > 0.01
      ) {
        return '中间帧引线端点未连接当前文字和柱条的边界';
      }
      ticker.tick(duration / 4);
      return text.attribute.x > midX ? null : '分离后的文字位置应继续变化直至终态';
    };

    if (findLine()) return '柱内标签初始不应绘制引线';
    const firstUpdate = moveOutside();
    if (firstUpdate) return firstUpdate;
    const oldLine = findLine();
    objects.oldLine = oldLine;
    objects.outsideX = text.attribute.x;

    label.setAttribute('position', 'inside-middle');
    if (oldLine.parent || findLine()) return '标签移入柱条后引线未移除';
    ticker.tick(duration);
    if (Math.abs(text.attribute.x - insideX) > 0.01) return '移入动画结束后文字应回到柱内';
    const restored = moveOutside();
    if (restored) return restored;

    label.setAttributes({ position: 'inside-middle', offset: 128 });
    ticker.tick(duration);
    const finalAttrs = { ...bar.attribute, x: 100 };
    bar.context = { animationState: 'update', finalAttrs };
    // Component updates can precede mark animation registration in VChart.
    label.setAttribute('position', 'right');
    bar.setAttributes(finalAttrs);
    bar.animate().from({ x: 60 }, duration, 'linear');
    ticker.tick(duration / 2);
    const movingLine = findLine();
    const [textPoint, barPoint] = movingLine?.attribute.points ?? [];
    const textBounds = text.AABBBounds;
    const markBounds = bar.AABBBounds;
    if (Math.abs(bar.attribute.x - 80) > 0.01 || textBounds.x1 <= markBounds.x2) {
      return '柱条和文字未到达分离的移动中间帧';
    }
    if (
      !textPoint ||
      !barPoint ||
      movingLine.attribute.visible === false ||
      Math.abs(textPoint.x - textBounds.x1) > 0.01 ||
      Math.abs(textPoint.y - (textBounds.y1 + textBounds.y2) / 2) > 0.01 ||
      Math.abs(barPoint.x - markBounds.x2) > 0.01 ||
      Math.abs(barPoint.y - (markBounds.y1 + markBounds.y2) / 2) > 0.01
    ) {
      return '移动中间帧的引线未连接柱条和文字的当前边界';
    }
    ticker.tick(duration / 2);
    objects.outsideX = text.attribute.x;
    if (Math.abs(findLine().attribute.points[1].x - bar.AABBBounds.x2) >= 0.01) return '移动结束后的引线终点不正确';

    label.setAttribute('position', 'inside-middle');
    ticker.tick(duration);
    label.setAttribute('position', 'right');
    const hiddenLine = findLine();
    bar.setAttribute('visible', false);
    ticker.tick(duration / 2);
    if (hiddenLine.attribute.visible !== false) return '隐藏柱条的恢复中引线应隐藏';
    ticker.tick(duration / 2);
    ticker.tick(duration);
    hiddenLine.setAttribute('stroke', '#2d548c');
    if (
      bar.attribute.visible !== false ||
      hiddenLine.attribute.visible !== false ||
      hiddenLine.baseAttributes.visible !== false
    ) {
      return '隐藏柱条的引线在动画结束后重新出现';
    }
    bar.setAttribute('visible', true);
    label.setAttribute('position', 'right');
    ticker.tick(duration);
    if (findLine().attribute.visible === false) return '柱条重新显示并更新标签后引线未恢复';
    objects.outsideX = text.attribute.x;
    return null;
  });
  if (result) throw assertionError(result);
}

/** 更新动画结束后，确认同一标签外侧只绘制一条引线。 */
export async function verify(page) {
  const ok = await page.evaluate(() => {
    const { label, oldLine, outsideX } = window.__visualObjects;
    const children = label.getChildren();
    const text = children.find(child => child.type === 'text');
    const lines = children.filter(child => child.type === 'line');
    window.__visualStage.render();
    return (
      children.length === 2 &&
      lines.length === 1 &&
      lines[0] !== oldLine &&
      lines[0].attribute.visible !== false &&
      lines[0].attribute.points.length === 2 &&
      Math.abs(text.attribute.x - outsideX) < 0.01
    );
  });
  if (!ok) throw assertionError('外侧标签和引线的最终绘制不正确');
}
