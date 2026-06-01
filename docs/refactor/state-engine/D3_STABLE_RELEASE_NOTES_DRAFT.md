# D3 Stable Release Notes Draft

> Status: draft for stable release
> Target version: `1.1.0`
> Scope: VRender D3 state / animation / app-scoped runtime stable release
> User-facing guide: [VRender 1.1.0 升级指南](/Users/bytedance/Documents/GitHub/VRender2/docs/assets/guide/zh/asd/Basic/Upgrade_to_1_1_0.md)

## Headline

This release promotes the D3 state and animation refactor from alpha verification to stable release readiness. The stable contract centers on one static truth model:

`baseAttributes + resolvedStatePatch -> attribute`

Animation no longer acts as an implicit static truth source. Shared state definitions, same-state refresh, update animation targets, and app-scoped env bootstrapping now use explicit public contracts.

## Major Changes

1. State system stable contract
   - `sharedStateDefinitions` is the preferred group-first state definition surface.
   - `graphic.setStates(states, { animate, animateSameStatePatchChange })` supports same-state refresh and same-state patch changed animation.
   - Dynamic state resolvers receive a valid `graphic` in `StateResolveContext`.
   - `graphic.states` remains the local graphic state-definition surface only outside shared-state scopes. Once a graphic is bound to a shared-state scope, local `graphic.states` definitions are ignored instead of being used as missing-state fallback.

2. Animation and update target contract
   - State animation keeps `baseAttributes`, `finalAttribute`, `attribute`, and `resolvedStatePatch` aligned without flashing through normal attrs.
   - Same-state patch changes can animate from the old resolved patch to the new resolved patch.
   - Sibling update animations no longer let channel-specific custom animations prematurely commit keys owned by another update item.
   - `TagPointsUpdate` can read update targets from standard animation context instead of requiring upper layers to pre-maintain `finalAttribute`.
   - `scaleIn` supports explicit start scale options: `fromScale`, `fromScaleX`, and `fromScaleY`; the default inferred-start behavior is unchanged.
   - Ordinary appear/fade should set the final static attributes first and use `animate().from(...)` for the starting pose; `animate().to(...)` does not commit the endpoint to `baseAttributes`.

3. Component layout alignment
   - Label layout reads final target attrs through the update/final-bounds context instead of mutating source graphics during render.
   - This keeps layout-time target reads consistent with animation binding-time target reads.

4. App-scoped runtime and environments
   - Tier 1 stable environments: `browser`, `node`, `wx`, `lynx`, `harmony`.
   - Tier 2 code-level connected environments: `taro`, `feishu`, `tt`; they require real-device smoke before Tier 1 promotion.
   - `native` is not part of the stable default contract.
   - Public app creators activate the target env explicitly; `envParams` are inputs to activation and are not stored on `IApp`.
   - Node release verification uses Node `20.19.6` to match the installed `canvas` native ABI.

5. Legacy/default path cleanup
   - New code should use the environment-specific app creator plus `app.createStage()`.
   - Deprecated root `createStage()` remains a compatibility surface, not the recommended integration path.
   - Browser smoke pages in `packages/vrender` are locked by source-scan tests against new direct root `createStage()` usage.

6. Glyph boundary
   - `Glyph` remains a documented special surface.
   - `glyphStates` / `glyphStateProxy` and `subAttributes` are not merged into the shared-state main path in this release.
   - Existing Glyph tests lock the current behavior: state attributes apply to the glyph itself; subGraphic ownership is not redefined by D3.

## Upper-Layer Migration Notes

1. VChart
   - Use `graphic.setStates(states, { animate, animateSameStatePatchChange: true })`.
   - Do not call `clearStates()` before reInit state refresh.
   - Do not maintain merged state style patches in VChart; VRender owns resolved state patches.

2. VTable
   - For fade/appear, write the final static attrs first, then use `animate().from({ opacity: 0 })`.
   - Do not rely on `animate().to({ opacity: 1 })` to write `baseAttributes`.
   - Migrate app usage to the environment-specific app creator plus `app.createStage()`; root `createStage()` should be treated as compatibility-only.

## Verification Snapshot

Known local evidence as of 2026-05-25:

- `packages/vrender-core` full unit: `107` passed / `1` skipped suites, `597` passed / `3` skipped tests.
- `packages/vrender` full unit: `19` suites passed, `154` passed / `2` skipped tests.
- `packages/vrender-components` full unit: `36` suites / `114` tests passed.
- `packages/vrender-core` compile passed.
- `packages/vrender` compile passed.
- `packages/vrender-components` compile passed.
- `packages/vrender` targeted app entry / node runtime / build artifact / legacy-removal tests: `4` suites / `101` tests passed.
- `packages/vrender-animate` animation runtime targeted test: `1` suite / `44` tests passed.
- `packages/vrender-animate` compile passed.
- affected `vrender-components` / `vrender-animate` eslint passed.
- affected `vrender-core` / `vrender` eslint passed.
- pre-push package tests passed under Node `20.19.6`.

Release-day rerun should still execute the targeted suites under the final release Node environment, especially the Node native canvas lane.

## Not In Stable Default Contract

- `taro` / `feishu` / `tt` Tier 1 claims are deferred until real-device smoke is available.
- Strong multi-env isolation inside one JS runtime is not claimed; each public creator explicitly activates its target env.
- Advanced on-demand assembly remains a separate governance topic, not a D3 stable release blocker.
- Further constructor/memory optimization is moved out of D3 stable release unless a new performance project is opened.
