import { assertionError } from '../assertions.mjs';

/** 真实鼠标悬停及点击命中顶层图元。 */
export function createSpec(v, stage) {
  const bottom=v.createRect({x:40,y:40,width:240,height:160,fill:'#3366cc'});
  const top=v.createRect({x:80,y:80,width:120,height:80,fill:'#e8684a'});
  const counts={click:0,enter:0,bottom:0};
  top.addEventListener('pointerenter',()=>{counts.enter++;});
  top.addEventListener('click',()=>{counts.click++; top.setAttribute('fill','#339966');stage.render();});
  bottom.addEventListener('click',()=>{counts.bottom++;});
  stage.defaultLayer.add(bottom);stage.defaultLayer.add(top);return {top,counts};
}

/** 通过真实浏览器操作或公开 API 执行交互。 */
export async function exercise(page) { await page.mouse.move(10,10); await page.mouse.move(120,110); await page.mouse.click(120,110); }

/** 显式核对业务结果，空白截图不能替代语义成功。 */
export async function verify(page) {
  const ok=await page.evaluate(()=>{ const {top,counts}=window.__visualObjects;return counts.click===1 && counts.enter>=1 && counts.bottom===0 && window.__visualStage.pick(120,110).graphic===top && top.attribute.fill==='#339966'; });
  if (!ok) throw assertionError('真实鼠标悬停及点击命中顶层图元断言失败');
}
