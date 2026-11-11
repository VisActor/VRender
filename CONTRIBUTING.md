# Contributing

[简体中文](./CONTRIBUTING.zh-CN.md)

## Code of Conduct

We have adopted [the Contributor Covenant](CODE_OF_CONDUCT.md) as our Code of Conduct, and we expect project participants to adhere to it. Please read the full text so that you can understand what actions will and will not be tolerated.

## Open Development

All work on VRender happens directly on GitHub. Both core team members and external contributors send pull requests which go through the same review process.

## Semantic Versioning

VRender follows [semantic versioning](https://semver.org/). We release patch versions for critical bugfixes, minor versions for new features or non-essential changes, and major versions for any breaking changes. When we make breaking changes, we also introduce deprecation warnings in a minor version so that our users learn about the upcoming changes and migrate their code in advance.

Every significant change is documented in the changelog file.

## Branch organization

Create a branch from `develop` and target `develop` for normal fixes and features. Coordinate release or other target branches with maintainers; do not push directly to the base branch. Preserve public API compatibility and record user-visible changes. Maintainers decide release timing.

## Bugs

We are using [GitHub Issues](https://github.com/VisActor/VRender/issues) for our public bugs. We keep a close eye on this and try to make it clear when we have an internal fix in progress. Before filing a new task, try to make sure your problem doesn’t already exist.

We have already prepared issue templates for bug reports and feature requests. If you want to fire an issue, just enter the [New issue](https://github.com/VisActor/VRender/issues/new/choose) page and select either of them to get started. The best way to get your bug fixed is by using our issue template and provide reproduction steps with this [template](https://github.com/VisActor/VRender/issues/new/choose).

## Proposing a Change

If you intend to change the public API, or make any non-trivial changes to the implementation, we recommend filing an issue, or just enter the [New issue](https://github.com/VisActor/VRender/issues/new/choose) page and select either of them to get started.

If you’re only fixing a bug, it’s fine to submit a pull request right away but we still recommend to file an issue detailing what you’re fixing. This is helpful in case we don’t accept that specific fix but want to keep track of the issue.

## Your First Pull Request

Working on your first Pull Request? You can learn how from this free video series:[How to Contribute to an Open Source Project on GitHub](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github)

To help you get your feet wet and get you familiar with our contribution process, we have a list of [good first issues](https://github.com/VisActor/VRender/issues?q=is%3Aopen+label%3A%22good+first+issue%22) that contain bugs that have a relatively limited scope. This is a great place to get started.

If you decide to fix an issue, please be sure to check the comment thread in case somebody is already working on a fix. If nobody is working on it at the moment, please leave a comment stating that you intend to work on it so other people don’t accidentally duplicate your effort.

If somebody claims an issue but doesn’t follow up for more than two weeks, it’s fine to take it over but you should still leave a comment.

### Sending a Pull Request

The core team is monitoring for pull requests. We will review your pull request and either merge it, request changes to it, or close it with an explanation. We’ll do our best to provide updates and feedback throughout the process.

## Local development and validation

Use Node.js 24 to match current product CI; the visual runtime is validated on Node22/24. Install the system libraries needed by `canvas`. Reinstall native dependencies when switching Node majors rather than reusing the wrong ABI. Keep the lockfile for ordinary installation; use Rush update only for intentional dependency changes and review its diff.

Run from the repository root:

```sh
node common/scripts/install-run-rush.js install --ignore-hooks
node common/scripts/install-run-rush.js test --only tag:package
node common/scripts/install-run-rush.js build --only tag:package
node common/scripts/install-run-rush.js test:artifacts --only tag:package
node common/scripts/install-run-rush.js compile --only tag:package
node common/scripts/install-run-rush.js eslint --only tag:package
```

These commands cover CI's source and artifact checks plus type/style validation; they do not claim all checks pass in your environment. ESLint may modify files, so inspect the diff. Focus on affected packages during development and include their callers for cross-package changes. Start the main package browser examples with `node common/scripts/install-run-rush.js start`. Unit tests do not replace the full visual comparison below. Use Conventional Commits and supply changelog entries required by the repository's release process.

## PR checks and merge process

**Activation snapshot (2026-11-06):** the advisory workflow was enabled at **2026-11-06 17:05 Asia/Shanghai (UTC+8)**. Integration: [#2154](https://github.com/VisActor/VRender/pull/2154). Activation and a designated PR validation do not establish long-term reliability; the first natural PR and at least 24 hours/3 natural executions remain to be observed.

### Scope

The workflow handles non-draft PRs created after initialization and strictly after the cutoff, with both branches in `VisActor/VRender`, targeting `develop`. “Internal” means same-repository branches, not employee status. Eligible new drafts enter after Ready for review. Existing PRs, forks and out-of-scope PRs are not backfilled by updates, reopening or changing draft status. Do not recreate a PR to bypass this boundary.

Stable CR and GitHub Actions have independent scopes. Stable CR covers new and revised non-draft PRs across the repository after its initial baseline; the advisory workflow's branch restrictions do not narrow CR. Missing workflow output does not waive tests or human review. Legacy Photo CI handles unclaimed PRs and push events only under its existing triggers; maintainers coordinate screenshot ownership, so do not dispatch a duplicate batch.

### Before submitting

- Run relevant unit tests, build/type and style checks. For features, fixes or coverage gaps, add deterministic regression cases or strengthen existing ones. Interactions must exercise real actions and assert the resulting state.
- For product, rendering, interaction, dependency or visual-case changes, run the default full comparison in the [visual guide](packages/vrender/__tests__/visual/README.md) before submitting. Focused cases/directories help during development; self-comparison only checks determinism and cannot replace the official baseline comparison. “Full” means the current manifest, not all product behavior.
- For documentation-only changes, check links, commands, versions and actual behavior. Explain why product tests were not run; do not manually rerun models or dispatch Photo just for documentation. Existing CI and automated workflow triggers still apply after submission.
- Report commands, outcomes, report scope, head/base when available, expected visual changes, skipped checks and blockers. Errors are not passes. Do not skip assertions, relax thresholds or replace baselines to hide failures.
- Follow the [case authoring guide](packages/vrender/__tests__/visual/cases/README.md). Only administrators of the corresponding product may create platform cases; other contributors supply reproduction material. Never invent IDs. See [BugServer case collaboration](packages/vrender/__tests__/visual/BUGSERVER_CASE_WORKFLOW.md) (Chinese).

### After submitting

Check the current head, comparison base and report version before reading the Bot Review, Actions runs and PR summary. The three automated recommendations are CR, unit tests and Playwright; other repository CI checks may also apply.

| Result | Action |
| --- | --- |
| CR Review | Fix findings or provide evidence; closing a discussion does not prove a fix |
| Unit tests | Check `unit-test.yml`, the `build` job, `Source tests (without build artifacts)` and `Published artifact tests`; missing, skipped, running or failed results are not passes |
| Playwright | Inspect full comparison images, assertions and difference analysis; execution errors are not acceptable visual changes |
| BugServer Photo | Automatically executed, manually reviewed, report-only; differences, missing baselines, errors and incomplete results remain visible without blocking the three recommendations |

Passing all three checks or reaching completed does not mean every Photo test passed. Contributors without platform access should request maintainer help; do not publish internal reports, business data, private logs or credentials.

### Status and next action

| Summary status | Action |
| --- | --- |
| Queued / running | Wait for the current stage; no result is not a pass |
| Changes or investigation needed | Fix the issue, add coverage or provide verifiable evidence |
| Blocked | Read the action item; ask maintainers about permissions, services or recovery |
| Awaiting approval | Maintainer checks all three results and manually reviews Photo for the current revision |
| Awaiting merge | The three recommendations are complete; inspect Photo and any saved selection, then merge manually subject to repository rules |
| Merged / baseline processing | Check selected-baseline results when selection is enabled; otherwise automatic updates remain skipped |
| Completed | Workflow cleanup finished; original Photo differences and errors remain |
| Superseded / closed without merge | Read the new revision's result, or treat the PR as unmerged; neither implies a baseline update |

A new head or comparison base requires version checks and necessary reruns. Old results cannot prove the new revision passed; verify current results and any saved Photo selection again for each new commit. If a summary is missing, check repository, target, creation time, draft status before contacting maintainers.

### Approval, merge and recovery

GitHub Approve is an audit record in this workflow. Maintainers may merge manually after checking CR, unit tests, Playwright and Photo for the current commit. GitHub branch protection and repository review requirements still apply. The Bot does not change those rules, approve, or merge.

For PRs explicitly enabled for Photo selection, BugServer shows the current images and short explanations. New candidates are selected by default. Inspect each item, deselect any baseline that should stay unchanged, and save successfully before merging. The server's saved revision is authoritative; an unsaved draft has no effect. Default selection does not overwrite a saved manual choice.

After merge, only the selected baselines in that revision are updated. Unselected items stay unchanged. Writes still verify the frozen commit, three checks, merged content, save time and original baseline. Stale versions, post-merge selections and conflicts are not silently accepted. Ask maintainers to resume the original task after a timeout or partial success; do not dispatch another batch or change request IDs.

Photo remains report-only. An unavailable selection list, including more than 20 differences, incomplete explanations or execution errors, adds no merge gate and does not update baselines. PRs without this capability retain their existing mode. Baseline updates do not rewrite the original Photo report, and completed does not mean Photo passed.

For help, provide the PR, current SHA, Review/CI links and a public-safe error description. Do not edit managed summaries or hidden markers, repeatedly reopen PRs, delete state, change request IDs or dispatch duplicate batches. Maintainers recover the original task. Stop test servers, browsers and child processes you started when finished.
