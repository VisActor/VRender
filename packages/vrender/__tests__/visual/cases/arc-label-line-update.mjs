import { assertionError } from '../assertions.mjs';

/** 创建无引线的内部扇区标签，后续通过公开 API 恢复外部引线。 */
export function createSpec(v, stage) {
  const previousTicker = stage.ticker;
  const ticker = new v.ManualTicker(stage);
  ticker.autoStop = false;
  stage.ticker = ticker;
  previousTicker.release();
  const arc = v.createArc({
    x: 160,
    y: 200,
    outerRadius: 60,
    innerRadius: 0,
    startAngle: -Math.PI / 6,
    endAngle: Math.PI / 6,
    fill: '#a6c8f2'
  });
  const label = new v.ArcLabel({
    type: 'arc',
    width: 400,
    height: 400,
    data: [{ id: 'arc', text: 'Arc' }],
    getBaseMarks: () => [arc],
    position: 'inside',
    line: { visible: true, style: { stroke: '#2d548c', lineWidth: 2 } },
    textStyle: { fontSize: 18, fontFamily: 'Arial', fill: '#222222' },
    smartInvert: false,
    overlap: false,
    animationEnter: false,
    animationExit: false,
    animationUpdate: { duration: 300, easing: 'linear', increaseEffect: false }
  });
  stage.defaultLayer.add(arc);
  stage.defaultLayer.add(label);
  return { arc, label, ticker };
}

/** 验证移动中间帧的两端几何，以及内外切换后的移除和恢复。 */
export async function exercise(page) {
  const result = await page.evaluate(() => {
    const objects = window.__visualObjects;
    const { arc, label, ticker } = objects;
    const findLine = () => label.getChildren().find(child => child.type === 'line');
    const text = label.getChildren().find(child => child.type === 'text');
    if (findLine()) return '内部扇区标签初始不应绘制引线';
    const finalAttrs = { ...arc.attribute, x: 200 };
    arc.context = { animationState: 'update', finalAttrs };
    // 覆盖实际调用中标签更新先于图元动画注册的顺序。
    label.setAttribute('position', 'outside');
    const line = findLine();
    if (!line) return '外部扇区标签未创建引线';
    const targetPoints = line.baseAttributes.points.map(point => ({ ...point }));
    const targetText = { x: text.baseAttributes.x, y: text.baseAttributes.y };
    arc.setAttributes(finalAttrs);
    arc.animate().from({ x: 160 }, 300, 'linear');
    ticker.tick(150);
    const [anchor, bend, end] = line.attribute.points;
    const dx = text.attribute.x - targetText.x;
    const dy = text.attribute.y - targetText.y;
    const near = (a, b) => Math.abs(a - b) < 0.01;
    if (!near(arc.attribute.x, 180) || near(dx, 0)) return '扇区与文字未到达移动中间帧';
    if (
      line.attribute.visible === false ||
      !anchor ||
      !bend ||
      !end ||
      !near(anchor.x, 240) ||
      !near(anchor.y, 200) ||
      !near(bend.x, targetPoints[1].x) ||
      !near(bend.y, targetPoints[1].y + dy) ||
      !near(end.x, targetPoints[2].x + dx) ||
      !near(end.y, targetPoints[2].y + dy)
    ) {
      return '移动扇区中间帧引线未连接当前扇区与文字';
    }
    ticker.tick(150);
    if (
      !near(line.attribute.points[0].x, 260) ||
      line.attribute.points.some((point, i) => !near(point.x, targetPoints[i].x) || !near(point.y, targetPoints[i].y))
    ) {
      return '移动扇区引线终态与布局目标不一致';
    }
    label.setAttribute('position', 'inside');
    if (line.parent || findLine()) return '标签移入扇区后引线未移除';
    ticker.tick(300);
    if (findLine()) return '已移除的扇区引线在后续帧恢复';
    label.setAttribute('position', 'outside');
    ticker.tick(300);
    objects.oldLine = line;
    label.setAttribute('position', 'inside');
    ticker.tick(300);
    label.setAttribute('position', 'outside');
    const hiddenLine = findLine();
    arc.setAttribute('visible', false);
    ticker.tick(150);
    if (hiddenLine.attribute.visible !== false) return '隐藏扇区的恢复中引线应隐藏';
    ticker.tick(150);
    ticker.tick(300);
    hiddenLine.setAttribute('stroke', '#2d548c');
    if (
      arc.attribute.visible !== false ||
      hiddenLine.attribute.visible !== false ||
      hiddenLine.baseAttributes.visible !== false
    ) {
      return '隐藏扇区的引线在动画结束后重新出现';
    }
    arc.setAttribute('visible', true);
    label.setAttribute('position', 'outside');
    ticker.tick(300);
    if (findLine().attribute.visible === false) return '扇区重新显示并更新标签后引线未恢复';
    return null;
  });
  if (result) throw assertionError(result);
}

/** 最终外部标签只保留一条三点引线，并连接静止扇区。 */
export async function verify(page) {
  const ok = await page.evaluate(() => {
    const { label, oldLine } = window.__visualObjects;
    const lines = label.getChildren().filter(child => child.type === 'line');
    window.__visualStage.render();
    return (
      lines.length === 1 &&
      lines[0] !== oldLine &&
      lines[0].attribute.visible !== false &&
      lines[0].attribute.points.length === 3 &&
      Math.abs(lines[0].attribute.points[0].x - 260) < 0.01 &&
      Math.abs(lines[0].attribute.points[0].y - 200) < 0.01
    );
  });
  if (!ok) throw assertionError('外部扇区标签引线的最终绘制不正确');
}
