import { assertionError } from '../assertions.mjs';

/** 销毁独立 Stage 后画布移除且主 Stage 可继续绘制。 */
export function createSpec(v, stage) {
  const container=document.createElement('div');document.body.append(container);
  const temporary=v.createStage({container,width:100,height:100,dpr:1,autoRender:false});
  temporary.defaultLayer.add(v.createRect({width:60,height:60,fill:'#f00'}));temporary.render();
  const hadCanvas=container.querySelectorAll('canvas').length>0;
  temporary.release();const removed=container.querySelectorAll('canvas').length===0;container.remove();
  stage.defaultLayer.add(v.createRect({x:40,y:40,width:200,height:100,fill:'#339966'}));return {hadCanvas,removed,temporary};
}

/** 显式核对业务结果，空白截图不能替代语义成功。 */
export async function verify(page) {
  const ok=await page.evaluate(()=>{ const x=window.__visualObjects;return x.hadCanvas && x.removed && x.temporary.releaseStatus==='released' && document.querySelectorAll('#chart canvas').length>0; });
  if (!ok) throw assertionError('销毁独立 Stage 后画布移除且主 Stage 可继续绘制断言失败');
}
