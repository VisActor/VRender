# Bug Server Manual Dispatch Implementation Plan

> Execute inline in this task; the workflow design was approved in the conversation. The referenced superpowers execution skills are not installed, so implementation uses the available repository tools.

**Goal:** Allow maintainers to test an external PR at a reviewed SHA without creating a temporary PR.

**Architecture:** Add manual-only validation, build, and submission jobs to the existing workflow. Keep the credential-bearing runner separate from PR code and use the workflow commit for trusted scripts.

**Tech Stack:** GitHub Actions, actions/github-script, Node.js 24, existing TypeScript Bug Server client.

## Global Constraints

- Base branch: `develop`; implementation branch: `codex/bugserver-workflow-dispatch`.
- Inputs: `pr_number` and full `head_sha`.
- PR artifacts are data only in the submission job.
- Existing automatic workflows and Bug Server API protocol retain their behavior.

## Task 1: Validate and resolve the manual target

Files: `.github/scripts/bug-server-dispatch.cjs`, `.github/scripts/bug-server-dispatch.test.cjs`.

- [ ] Write Node tests for valid fork PRs, invalid PR numbers, malformed SHAs, stale SHAs, wrong base repository and non-default workflow branches.
- [ ] Run `node --test .github/scripts/bug-server-dispatch.test.cjs` and confirm the missing module fails.
- [ ] Implement `resolveBugServerTarget({ github, context, prNumber, headSha })`, returning `{ prNumber, sha, headRef, prUrl }`. Validate locally before calling `github.rest.pulls.get`; compare the returned PR's repository and current head with the requested target.
- [ ] Rerun the tests.

## Task 2: Isolate build and submission

Files: `.github/workflows/bug-server.yml`.

- [ ] Add the two string inputs, retain existing automatic build behind a non-dispatch condition, and add manual validation/build/submission jobs with read-only repository permissions.
- [ ] Checkout PR code by the validated SHA, verify `git rev-parse HEAD`, build with the existing Rush commands, and upload only the generated bundle.
- [ ] Checkout the trusted client by `github.workflow_sha` in the submission job. Install `node-fetch@2.6.6`, `form-data@4.0.6`, `ts-node@10.9.0`, and `typescript@4.9.5` outside the repository with lifecycle scripts disabled.
- [ ] Run the client through the isolated ts-node executable with explicit CommonJS/esModuleInterop compiler options and reviewed PR metadata; expose the secret only for this command.
- [ ] Run actionlint and simulate the trusted client against mocked API responses, verifying that the bundle is uploaded without execution.

## Task 3: Document and verify

Files: `tools/bugserver-trigger/README.md`.

- [ ] Document UI and CLI invocation, default-branch availability, tested head versus merge semantics, metadata, and result logs.
- [ ] Review the final diff for secret exposure, event regressions and shell interpolation; run `git diff --check`.
- [ ] Record completed checks and deliver the local branch. Do not claim a live Bug Server run before the default-branch workflow exists.
