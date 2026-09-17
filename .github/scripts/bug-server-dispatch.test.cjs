const assert = require('node:assert/strict');
const { test } = require('node:test');
const { resolveBugServerTarget } = require('./bug-server-dispatch.cjs');

const sha = '40be3619d1608aa1d5827f0a465704eeb036a7d3';

function fixture(overrides = {}) {
  const calls = [];
  const context = {
    repo: { owner: 'VisActor', repo: 'VRender' },
    ref: 'refs/heads/develop',
    payload: { repository: { default_branch: 'develop' } }
  };
  const pull = {
    base: { repo: { full_name: 'VisActor/VRender' } },
    head: { sha, ref: 'feat/line-render-contribution', repo: { full_name: 'g1f9/VRender' } },
    html_url: 'https://github.com/VisActor/VRender/pull/2128'
  };
  const github = {
    rest: {
      pulls: {
        get: async params => {
          calls.push(params);
          return { data: pull };
        }
      }
    }
  };
  return { args: { github, context, prNumber: '2128', headSha: sha, ...overrides }, calls, pull };
}

test('resolves the reviewed fork head, including source metadata', async () => {
  const { args, calls } = fixture({ headSha: sha.toUpperCase() });
  assert.deepEqual(await resolveBugServerTarget(args), {
    prNumber: 2128,
    sha,
    headRef: 'feat/line-render-contribution',
    prUrl: 'https://github.com/VisActor/VRender/pull/2128'
  });
  assert.deepEqual(calls, [{ owner: 'VisActor', repo: 'VRender', pull_number: 2128 }]);
});

for (const prNumber of ['', '0', '-1', '1.5', '2128;echo injected', '9007199254740992']) {
  test(`rejects invalid PR number ${JSON.stringify(prNumber)} before API access`, async () => {
    const { args, calls } = fixture({ prNumber });
    await assert.rejects(resolveBugServerTarget(args), /PR number/);
    assert.equal(calls.length, 0);
  });
}

for (const headSha of ['', '40be3619', 'g'.repeat(40), `${sha}\n`]) {
  test(`rejects invalid SHA ${JSON.stringify(headSha)} before API access`, async () => {
    const { args, calls } = fixture({ headSha });
    await assert.rejects(resolveBugServerTarget(args), /40-character/);
    assert.equal(calls.length, 0);
  });
}

test('rejects stale approval when the PR has a different head', async () => {
  const { args, pull } = fixture();
  pull.head.sha = 'a'.repeat(40);
  await assert.rejects(resolveBugServerTarget(args), /head changed/);
});

test('rejects a workflow launched from a non-default branch', async () => {
  const { args, calls } = fixture();
  args.context.ref = 'refs/heads/feature';
  await assert.rejects(resolveBugServerTarget(args), /default branch/);
  assert.equal(calls.length, 0);
});

test('rejects a PR belonging to another base repository', async () => {
  const { args, pull } = fixture();
  pull.base.repo.full_name = 'someone/VRender';
  await assert.rejects(resolveBugServerTarget(args), /base repository/);
});

test('propagates API lookup failures without producing a build target', async () => {
  const { args } = fixture();
  args.github.rest.pulls.get = async () => {
    throw new Error('Not Found');
  };
  await assert.rejects(resolveBugServerTarget(args), /Not Found/);
});
