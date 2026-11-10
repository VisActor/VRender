import { assertionError } from '../assertions.mjs';

/** 分组平移缩放与裁剪边界。 */
export function createSpec(v, stage) {
  const group = v.createGroup({x: 80, y: 70, width: 120, height: 80, scaleX: 1.5, scaleY: 1.5, clip: true});
  const rect = v.createRect({x: 0, y: 0, width: 200, height: 150, fill: '#3366cc'});
  group.add(rect); stage.defaultLayer.add(group); return {group,rect};
}

/** 显式核对业务结果，空白截图不能替代语义成功。 */
export async function verify(page) {
  const ok=await page.evaluate(()=>{ const canvas=document.querySelector('#chart canvas'),ctx=canvas.getContext('2d'); const inside=ctx.getImageData(100,90,1,1).data,outside=ctx.getImageData(280,210,1,1).data; return inside[2]>inside[0] && outside[0]===255 && outside[1]===255 && outside[2]===255; });
  if (!ok) throw assertionError('分组平移缩放与裁剪边界断言失败');
}
