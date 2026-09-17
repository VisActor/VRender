# Bug Server PR Artifact Implementation Plan

> Execute inline as the fallback in the approved security fix plan. The user reported that alert #45 still blocks the latest revision; this plan completes that repair without dismissing the alert.

**Goal:** Remove PR code execution from the default-branch manual workflow and make the CodeQL security check pass.

**Architecture:** A separate `pull_request` workflow builds the exact head with read-only repository permissions. The manual workflow retains PR number and reviewed SHA inputs, locates an immutable artifact using GitHub API provenance, and submits only its `index.js` bytes with the trusted client. No PR build scripts or downloaded code execute in the manual workflow.

**Tech Stack:** GitHub Actions, Node.js tests, Python standard-library ZIP handling.

## Constraints

- Keep existing push / PR Bug Server behavior and the trusted client API protocol.
- Keep workflow-wide `contents: read`; grant `actions: read` only to manual artifact lookup/download jobs and `pull-requests: read` only to target validation.
- Remove the superseded `build-manual-bundle`, `cache-mode` and runtime-mode guard; isolation comes from the PR event's cache scope.
- Treat artifacts as untrusted bytes. Never extract archive paths or execute their content.
- Fork run API responses can have an empty `pull_requests` array: verified using PR #2128 run 35075478495. Bind provenance to workflow ID/path, event, repository IDs, source branch and exact run head SHA. If PR associations are present, they must include the requested PR.

## Task 1: Resolve a PR artifact

Files: `.github/scripts/bug-server-dispatch.cjs`, `.github/scripts/bug-server-dispatch.test.cjs`.

- [x] Extend fixture tests to cover successful fork provenance, incorrect workflow/event/SHA/repository/branch/PR, unsuccessful builds, and missing/expired/ambiguous artifacts. Preserve all input validation tests.
- [x] Run `node --test .github/scripts/bug-server-dispatch.test.cjs`; confirm new tests fail before implementation.
- [x] Extend `resolveBugServerTarget({github, context, prNumber, headSha})` to return the existing target fields plus `{runId, runUrl, artifactId}`. Resolve `bug-server-pr-bundle.yml`, list successful PR runs for the reviewed SHA, select the latest matching run, and select exactly one non-expired artifact named `bug-server-pr-${prNumber}-${sha}` whose API provenance matches the run.
- [x] Run the tests again; all provenance rejection cases must pass.

## Task 2: Move the build and safely consume the artifact

Files: `.github/workflows/bug-server-pr-bundle.yml`, `.github/workflows/bug-server.yml`, `.github/scripts/extract_bug_server_bundle.py`, `.github/scripts/test_extract_bug_server_bundle.py`.

- [x] Add a PR-only workflow for `main`, `develop`, `dev/**`, using checkout at `github.event.pull_request.head.sha`, disabled persisted credentials, Node 24, the existing native dependencies/Rush build and upload-artifact v4. Artifact retention: 7 days. No repository secrets or cache action.
- [x] Add ZIP tests for a valid binary bundle, executable text treated as bytes, path traversal, extra files, duplicate names, symlink entries, oversized payloads and existing output files.
- [x] Implement `extract_bundle(archive_path, destination)` with Python `zipfile`: require exactly one regular entry named `index.js`, limit the uncompressed bundle to 64 MiB, and write bytes to the explicit destination with exclusive creation. Do not call `extract` or `extractall`.
- [x] Remove the manual build job. Add trusted API artifact lookup outputs and download the selected artifact ID into a fixed temporary ZIP file. Run the trusted extraction script before the token-bearing submission step; keep the existing client command unchanged.
- [x] Run `python3 -m unittest discover -s .github/scripts -p 'test_extract_bug_server_bundle.py'`, the Node tests, actionlint on both workflows and `git diff --check`.

## Task 3: Verify and document

- [ ] Push the update to PR #2134, check CodeQL alert #45 and #46 on the new commit, and require the CodeQL check to pass without dismissals.
- [ ] Wait for the new PR-only bundle workflow to succeed. Invoke the trusted resolver against that real run, download its immutable artifact, verify single-file extraction, and verify the existing upload client with the local mock API. Do not execute the bundle.
- [ ] Update README, design, the previous security plan, PR description and the existing Lark maintenance section. Document that maintainers wait for `Bug Server PR Bundle` before dispatch; missing/expired artifacts require a fresh successful PR bundle run. Existing PRs may need a new PR event after the workflow is merged.
- [ ] Record separate results for security checks, artifact pipeline and the existing photo CI. End-to-end manual dispatch from the default branch remains a post-merge check.

## Validation before push

- Node resolver tests: 36 passed.
- Python archive tests: 6 tests passed, including multiple malicious-entry subcases.
- actionlint 1.7.12: both final workflows pass without ignored diagnostics.
- `git diff --check`: passed.
