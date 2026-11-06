import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseOptions } from './visual-test.mjs';
import { loadCases, selectCases, validateResults, acquireLock } from './visual/runner.mjs';
import { saveReport } from '../__tests__/visual/report.mjs';
import Reporter from '../__tests__/visual/reporter.mjs';

const suite = fileURLToPath(new URL('../__tests__/visual', import.meta.url));
test('首批清单恰好六项，非法参数和结果漏项/重复项拒绝', async () => {
  const cases = await loadCases(suite);
  assert.equal(cases.length, 6);
  assert.equal(selectCases(cases, {case:'picking-events'})[0].id, 'picking-events');
  for (const args of [['--offline'], ['--baseline','abc'], ['--case','../x'], ['--update-snapshots'], ['--case','x','--dir','y']]) assert.throws(()=>parseOptions(args));
  assert.throws(()=>selectCases(cases,{case:'unknown'}));
  for(const tests of [[],[{id:'a'},{id:'a'}],[{id:'b'}]]) assert.throws(()=>validateResults({tests},['a']));
  validateResults({tests:[{id:'a'}]},['a']);
});

test('运行锁互斥，缺少截图和未完成阶段不能判绿', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(),'vrender-report-'));
  try {
    const release=await acquireLock(dir,{runId:'test'});
    await assert.rejects(acquireLock(dir,{runId:'other'}));await release();
    const summary={runId:'test',finalized:true,status:'passed',cases:[{id:'a',purpose:'测试'}],issues:[],request:{},timings:{},environment:{},selection:{mode:'all',value:null,totalCount:1,selectedCount:1,selectedIds:['a']}};
    await saveReport(dir,summary);
    const result=JSON.parse(await fs.readFile(path.join(dir,'summary.json')));
    assert.notEqual(result.status,'passed');
    assert.equal(result.complete,false);
  } finally {await fs.rm(dir,{recursive:true,force:true});}
});

test('普通执行异常与显式业务断言分开，阶段超时保留错误', async () => {
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'vrender-reporter-'));
  const previous=[process.env.VISUAL_RUN_DIR,process.env.VISUAL_PHASE];
  process.env.VISUAL_RUN_DIR=dir;process.env.VISUAL_PHASE='current';
  try {
    for (const [name,business] of [['Error',false],['VisualAssertionError',true]]) {
      const reporter=new Reporter();
      reporter.onTestEnd({title:'a',annotations:[{type:'stage',description:'verify'}]}, {status:'failed',attachments:[],errors:[{name,message:'broken'}],duration:1});
      reporter.onEnd({status:'timedout'});
      const result=JSON.parse(await fs.readFile(path.join(dir,'current-result.json')));
      assert.equal(result.status,'error'); assert.equal(result.tests[0].businessAssertion,business);
      assert.equal(result.tests[0].code,business?'CASE_ASSERTION_FAILED':'EXECUTION_FAILED');
    }
  } finally {
    for(const [i,key] of ['VISUAL_RUN_DIR','VISUAL_PHASE'].entries()) if(previous[i]===undefined) delete process.env[key];else process.env[key]=previous[i];
    await fs.rm(dir,{recursive:true,force:true});
  }
});
