# Bug Server CI

`scripts/trigger-test.ts` uploads `dist/index.js`, waits for an SCM build, starts the Bug Server photo tests, and waits for their results. It requires `BUG_SERVER_TOKEN`.

## Manually test a PR

After the manual workflow is merged into the repository's default branch (`develop`), maintainers with repository write access can open **Actions → Bug Server CI → Run workflow**. Select **develop**, then enter:

- `pr_number`: the PR number, including PRs from external forks.
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

The run appears under Actions; this manual run does not automatically attach a check or comment to the external PR. Its summary records the PR URL and tested head. The **Trigger Bug Server for reviewed PR** step prints `scmVersion`, `bundleId`, and the result counts, which identify the run in Bug Server. A missing token, failed SCM build or failed photo test makes the job fail.

## Execution boundaries

The manual workflow uses three separate jobs:

1. Validate the PR and reviewed SHA using the GitHub API.
2. Build the PR on a runner with read-only repository access, no retained checkout credentials, no shared cache and no Bug Server token. Upload only the generated bundle.
3. On a fresh runner, use the trigger script from the default-branch workflow commit. Install its dependencies separately with npm lifecycle scripts disabled, download the bundle as data, and pass the token only to the API client step. This job never executes the PR bundle or its package scripts.

Existing push and pull-request automatic runs are unchanged. A fork PR's automatic run still cannot obtain repository secrets; use the manual entry for Bug Server validation.

## Local validation

From the repository root:

```sh
node --test .github/scripts/bug-server-dispatch.test.cjs
actionlint .github/workflows/bug-server.yml
```
