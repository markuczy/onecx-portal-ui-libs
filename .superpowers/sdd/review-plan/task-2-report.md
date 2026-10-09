# Task 2 Report

## Summary
Applied the final review-fix documentation updates across the State Management Area only. No production code was changed.

## Files updated
- `dev-docs/state-management/persisting-state.adoc`
- `dev-docs/state-management/url-synced-state.adoc`
- `dev-docs/state-management/README.adoc`

## What changed
- Corrected persistence terminology to use `ngrx-store-localstorage` and its `localStorageSync` meta-reducer.
- Replaced invalid wiring references to `createLocalReducer` and `mergeStrategy` with the verified `localStorageSync` / `mergeReducer` flow.
- Clarified that the Shell publishes context and drives navigation/current-location, while App fragment helpers can also update the shared URL.
- Removed wording that implied namespaced keys or per-MFE anchor segments make named-anchor fragments work.
- Kept the existing shared-fragment, array-collapse, and anchor-limit guidance intact.

## Verification
- `git diff --check` ✅
- Searched `dev-docs/state-management/persisting-state.adoc` for `@ngrx/store/localStorage`, `createLocalReducer`, and `mergeStrategy` ✅ no matches
- Inspected the complete diff for all three modified docs ✅

## Commit
- `bb3d081db21f8082fee7ac7a639a2047ca7a1fc2` — `docs(state-management): correct persistence and URL sync guidance`

## Concerns
- None. Changes are documentation-only and match the verified package/API wiring.

## Post-change verification
- File modified: `dev-docs/state-management/url-synced-state.adoc` — wording updated to state the writer "parses the full fragment without stripping a named-anchor prefix", and that named-anchor fragments are unsupported and unreliable.

### git diff --check
- No whitespace or index errors reported by `git diff --check` for the change.

### One-line diff
- Unified diff hunk:

@@ -66 +66 @@ The reason for the switch is the property the query string does not have in a On
-The fragment addresses the server-leak concern because it is not sent to the server, but it is still part of the shared client-side URL: the Shell and other MFEs can read and modify the fragment, so it is not inherently "app-private". Apps should namespace fragment parameter keys to avoid collisions. The current writer preserves any existing anchor prefix when it writes back, but it parses with `new URLSearchParams(fragment)` before stripping named anchors, so named-anchor fragments are not a supported pattern. The libraries reflect the trade-off by deprecating the query-params helpers and promoting the fragment variants as the current API.
+The fragment addresses the server-leak concern because it is not sent to the server, but it is still part of the shared client-side URL: the Shell and other MFEs can read and modify the fragment, so it is not inherently "app-private". Apps should namespace fragment parameter keys to avoid collisions. The current writer preserves any existing anchor prefix when it writes back, but it parses the full fragment without stripping a named-anchor prefix, so named-anchor fragments are unsupported and unreliable. The libraries reflect the trade-off by deprecating the query-params helpers and promoting the fragment variants as the current API.

### Commit
- SHA: abcc94a1
- Subject: docs(state-management): clarify fragment parsing does not strip named anchors

Appended to this report.

