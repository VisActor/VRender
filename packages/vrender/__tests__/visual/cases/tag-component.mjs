import { assertionError } from '../assertions.mjs';

/** 标签组件文字、背景与更新。 */
export function createSpec(v, stage) {
  const tag=new v.Tag({x:60,y:60,text:'Ready',padding:12,textStyle:{fontSize:20,fontFamily:'Arial',fill:'#222'},panel:{visible:true,fill:'#ddeeff',cornerRadius:6}});
  stage.defaultLayer.add(tag);return {tag};
}

/** 通过真实浏览器操作或公开 API 执行交互。 */
export async function exercise(page) { await page.evaluate(()=>{window.__visualObjects.tag.setAttribute('text','Updated');window.__visualStage.render();}); }

/** 显式核对业务结果，空白截图不能替代语义成功。 */
export async function verify(page) {
  const ok=await page.evaluate(()=>{ const {tag}=window.__visualObjects;return tag.getTextShape().attribute.text==='Updated' && tag.getBgRect().AABBBounds.width()>40 && tag.AABBBounds.height()>20; });
  if (!ok) throw assertionError('标签组件文字、背景与更新断言失败');
}
