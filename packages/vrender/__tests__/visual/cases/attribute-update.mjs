import { assertionError } from '../assertions.mjs';

/** 属性更新同步改变几何与拾取位置。 */
export function createSpec(v, stage) {
  const rect=v.createRect({x:40,y:50,width:100,height:60,fill:'#3366cc'});stage.defaultLayer.add(rect);return {rect};
}

/** 通过真实浏览器操作或公开 API 执行交互。 */
export async function exercise(page) { await page.evaluate(()=>{window.__visualObjects.rect.setAttributes({x:220,width:160,fill:'#e8684a'});window.__visualStage.render();}); }

/** 显式核对业务结果，空白截图不能替代语义成功。 */
export async function verify(page) {
  const ok=await page.evaluate(()=>{ const {rect}=window.__visualObjects;const stage=window.__visualStage;return rect.attribute.x===220 && stage.pick(250,80).graphic===rect && !stage.pick(60,80); });
  if (!ok) throw assertionError('属性更新同步改变几何与拾取位置断言失败');
}
