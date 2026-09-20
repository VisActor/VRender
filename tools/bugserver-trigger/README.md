# Bug Server CI

`scripts/trigger-test.ts` uploads `dist/index.js`, waits for an SCM build, starts the Bug Server photo tests, and waits for their results. It requires `BUG_SERVER_TOKEN`.

## Automatic runs

PRs targeting `main`, `develop` or `dev/**` are routed by their source repository, so each PR event builds only once:

| Event              | Bug Server CI                      | Bug Server PR Bundle                              |
| ------------------ | ---------------------------------- | ------------------------------------------------- |
| Same-repository PR | Build and submit tests             | Skip the build                                    |
| Fork PR            | Skip the automatic build and tests | Build and save the artifact for manual submission |
| Push to `main`     | Build and submit tests             | Not triggered                                     |

The job conditions compare `github.event.pull_request.head.repo.full_name` with `github.repository`. GitHub cannot filter `pull_request` triggers by source repository, so both workflows may appear in Actions, but the other build job is skipped without starting a runner.

To retest a same-repository PR, re-run **Bug Server CI**. The manual entry below uses fork PR artifacts; same-repository PRs no longer produce a **Bug Server PR Bundle** artifact.

## Manually test a fork PR

After the workflows are merged into the repository's default branch (`develop`), wait for **Bug Server PR Bundle** to succeed for the reviewed PR head. Fork runs may need a maintainer's approval. Then maintainers with repository write access can open **Actions → Bug Server CI → Run workflow**. Select **develop**, then enter:

- `pr_number`: the number of a PR submitted to this repository from an external fork.
- `head_sha`: the full 40-character SHA of the PR head that you reviewed.

The equivalent CLI command is:

```sh
gh workflow run bug-server.yml \
  --repo VisActor/VRender \
  --ref develop \
  -f pr_number=2128 \
  -f head_sha=40be3619d1608aa1d5827f0a465704eeb036a7d3
```

Use the currently reviewed PR head; the example SHA becomes invalid if that PR changes. The workflow rejects non-default workflow branches, malformed inputs and a SHA that differs from the PR's current head. It builds the exact requested **head commit**, not GitHub's generated merge commit. Updates after validation cannot change the commit being built.

The run appears under Actions; this manual run does not automatically attach a check or comment to the external PR. Its summary records the PR URL, tested head and source build run. The **Trigger Bug Server for reviewed PR** step prints `scmVersion`, `bundleId`, and the result counts, which identify the run in Bug Server. A missing token, failed SCM build or failed photo test makes the job fail.

The manual entry consumes an existing PR bundle; it does not build PR code. Artifacts are retained for 7 days. If the build or artifact is missing, failed or expired, approve/wait for/re-run **Bug Server PR Bundle** before dispatching again. For a PR opened before this workflow was introduced, update or reopen the PR to trigger a new PR event; re-running an old workflow definition does not create the new bundle workflow.

## Execution boundaries

1. **Bug Server PR Bundle** builds only for fork `pull_request` events, using the exact head with read-only repository permissions, disabled persisted checkout credentials and no Bug Server token. Any cache writes are confined to the PR scope. It uploads `bug-server-pr-<number>-<sha>`.
2. The manual **resolve-manual-target** job validates the current PR head and source workflow ID/path, PR event, successful run, repository IDs, source branch and run SHA. It requires one non-expired artifact with matching GitHub API provenance. Fork runs can omit PR associations; the repository/branch/SHA checks still bind the source.
3. **submit-manual-bundle** uses scripts from the immutable default-branch workflow commit. It downloads the selected artifact ID and accepts only a single regular `index.js` entry, up to 64 MiB. The trusted extractor writes bytes to a fixed path without extracting archive paths. The client only uploads those bytes; it never executes the bundle or PR package scripts.

Both workflows default to `contents: read`. Manual lookup and download jobs also need `actions: read`, and target validation needs `pull-requests: read`. The Bug Server token is injected only into the final API client step. Pushes to `main` and same-repository PRs retain their automatic build and test behavior with read-only repository permissions. Fork PRs automatically build only the artifact; use the manual entry for Bug Server validation.

The default-branch manual workflow does not check out or build PR code. This replaces the earlier `cache-mode` approach and does not require scanner exceptions.

## Local validation

From the repository root:

```sh
node --test .github/scripts/bug-server-dispatch.test.cjs
python3 -m unittest discover -s .github/scripts -p 'test_extract_bug_server_bundle.py'
actionlint .github/workflows/bug-server.yml .github/workflows/bug-server-pr-bundle.yml
```
