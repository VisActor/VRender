import { assertionError } from '../assertions.mjs';

/** 图元和文本产生实际绘制与有效边界。 */
export function createSpec(v, stage) {
  const rect = v.createRect({x: 40, y: 40, width: 180, height: 90, fill: '#3366cc'});
  const circle = v.createCircle({x: 320, y: 90, radius: 45, fill: '#e8684a'});
  const text = v.createText({x: 40, y: 200, text: 'VRender 123 中文', fontSize: 24, fontFamily: 'Arial', fill: '#222'});
  for (const graphic of [rect, circle, text]) stage.defaultLayer.add(graphic);
  return {rect, circle, text};
}

/** 显式核对业务结果，空白截图不能替代语义成功。 */
export async function verify(page) {
  const ok=await page.evaluate(()=>{ const {rect,circle,text}=window.__visualObjects; return [rect,circle,text].every(g=>g.AABBBounds.width()>0 && g.AABBBounds.height()>0) && text.attribute.text==='VRender 123 中文'; });
  if (!ok) throw assertionError('图元和文本产生实际绘制与有效边界断言失败');
}
