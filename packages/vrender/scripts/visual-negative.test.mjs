import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRuntime, serve } from './visual/runtime.mjs';
import { executePhase } from './visual/runner.mjs';

// 仅消费已经通过的真实构建报告；受控污染发生在独立副本，不改源码或标准图。
const source=process.env.VRENDER_VISUAL_FIXTURE;
const dependencies=process.env.VRENDER_VISUAL_DEPENDENCIES ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
test('真实 PNG 差异和业务断言失败必须被检测', {skip: !source, timeout:120000}, async () => {
  const original=JSON.parse(await fs.readFile(path.join(source,'summary.json')));
  assert.equal(original.status,'passed');assert.equal(original.complete,true);
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'vrender-negative-'));
  const runtime=createRuntime();const detach=runtime.listenSignals();
  try {
    await fs.cp(path.join(source,'suite'),path.join(dir,'suite'),{recursive:true});
    for(const file of ['baseline.js','current.js']) await fs.copyFile(path.join(source,file),path.join(dir,file));
    await fs.symlink(path.join(dependencies,'packages/vrender/node_modules'),path.join(dir,'node_modules'));
    const {server,url}=await serve(dir);
    runtime.defer(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));});
    const ids=['primitives-text'];
    assert.equal((await executePhase(dependencies,dir,'baseline',url,ids,runtime)).status,'passed');
    // 保持图元和语义不变，仅在当前 bundle 中加入可见标记，证明原生像素比较确实工作。
    await fs.appendFile(path.join(dir,'current.js'), '\nwindow.addEventListener("load",()=>{const marker=document.createElement("div");marker.style="position:absolute;left:700px;top:500px;width:40px;height:40px;background:red";document.body.append(marker)});\n');
    const changed=await executePhase(dependencies,dir,'current',url,ids,runtime);
    assert.equal(changed.status,'diff');assert.equal(changed.tests[0].code,'VISUAL_DIFFERENCE');
    const images=changed.tests[0].attachments.filter(x=>x.name.endsWith('.png'));
    for(const kind of ['expected','actual','diff']) assert(images.some(x=>x.name.includes(kind)));
    await fs.copyFile(path.join(source,'current.js'),path.join(dir,'current.js'));
    const file=path.join(dir,'suite/cases/primitives-text.mjs');
    await fs.writeFile(file,(await fs.readFile(file,'utf8')).replace('if (!ok)', 'if (true)'));
    await assert.rejects(executePhase(dependencies,dir,'current',url,ids,runtime), /阶段执行失败/);
    const failed=JSON.parse(await fs.readFile(path.join(dir,'current-result.json')));
    assert.equal(failed.status,'error');assert.equal(failed.tests[0].code,'CASE_ASSERTION_FAILED');
    console.log(JSON.stringify({visibleDifference:changed.status,assertionFailure:failed.tests[0].code,externalWrites:0}));
  } finally {
    const errors=await runtime.cleanup();detach();await fs.rm(dir,{recursive:true,force:true});assert.deepEqual(errors,[]);
  }
});
