Task 1 — Implementation Report

Goal
----
Apply documentation-only corrections per the brief to ensure the docs state that only Angular awaits the Shell readiness gate, while React performs refresh/header calls without awaiting it, and to clarify that the Shell may mount the proxy before auth initialization completes. Keep all changes within dev-docs/authentication/tokens-on-http-calls.adoc.

What I changed
--------------
Edited dev-docs/authentication/tokens-on-http-calls.adoc to consistently state:
- The Angular interceptor explicitly awaits isAuthenticated$.isInitialized (readiness gate).
- The React axios interceptor does not await the readiness gate; it performs updateTokenIfNeeded()/getHeaderValues() without explicitly waiting. React consumers must gate requests themselves when guaranteed readiness is required.
- The Shell may mount the window proxy before auth initialization completes; documentation and debugging guidance were updated to reflect this.

Files modified
--------------
- dev-docs/authentication/tokens-on-http-calls.adoc
- .superpowers/sdd/implementation-plan/task-1-report.md (this report)

Verification performed
---------------------
- Inspected the focused diff for the modified doc to ensure all assertions claiming React awaits the readiness gate were removed or corrected.
- Ran git diff --check to ensure no whitespace or index errors remain.
- Ensured only documentation files were changed; no code edits were made.

Focused diff summary
--------------------
- Replaced the generic claim that both frameworks "wait until authentication has finished" with framework-specific behavior: Angular waits, React does not.
- Clarified How it works, Libs/Shell side, Angular/React comparison table (Gate row), Edge cases, and Debugging guidance.

Self-review notes
-----------------
- Searched the document for occurrences of "wait", "await", and "isAuthenticated$" to ensure consistent messaging. Remaining references to the gate explicitly mark it as Angular-only.
- Confirmed wording instructs React consumers to gate requests when needed and notes the Shell may mount the proxy before auth initialization completes.

Automated tests
---------------
- None applicable (documentation-only change). The brief specified tests do not apply.

Concerns / follow-ups
---------------------
- Ensure downstream docs (if any) referencing this Unit do not reintroduce the old wording; a future sweep of related auth docs was recommended in the PR discussion.

Artifacts
---------
- This implementation report: .superpowers/sdd/implementation-plan/task-1-report.md

End of report.
