# Localization Review Link Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Replace the dead Styling cross-Area link with the existing Dev Docs page and keep the overview's link inventory accurate.

**Architecture:** This is a documentation-only correction. Update every Styling reference in the two Localization pages that use the dead destination, and correct the overview's cross-link explanation to distinguish existing pages from planned pages.

**Tech Stack:** AsciiDoc.

**Spec:** `../issue.json` (onecx/internal-tasks#904), constrained to review thread 4207909872.

## Global Constraints

- Explain each concept once in its owning Area; link to other Areas using the planned paths from the top-index slug map (links to not-yet-written pages in other Areas are allowed only if listed in the PR).
- Pages render on GitHub; in-Area links, Shell links and diagrams resolve.
- Commit only review-feedback-related changes; avoid unrelated refactors.

## Review Focus

- A corrected link must resolve from both Localization documents to `dev-docs/styles/primeng-scoping.adoc`.
- The overview must not claim that every cross-Area link points to an unwritten page when the Styling destination exists.

---

### Task 1: Correct Styling cross-Area references

**Files:**
- Modify: `dev-docs/localization/README.adoc`
- Modify: `dev-docs/localization/app-translations.adoc`

**Interfaces:**
- Consumes: Existing page `dev-docs/styles/primeng-scoping.adoc`.
- Produces: Relative links from both Localization pages to `../styles/primeng-scoping.adoc`; accurate cross-link inventory wording and label in the overview.

- [ ] Update the Styling link in the overview's Related Areas and Cross-Area links table to target `../styles/primeng-scoping.adoc`, and name the existing destination accurately.
- [ ] Revise the Cross-Area links introduction so it only characterizes genuinely unwritten destinations as planned pages.
- [ ] Update the App translations page's Related Units Styling link to target `../styles/primeng-scoping.adoc`.
- [ ] Verify the destination exists and no obsolete `primeng-style-scoping.adoc` references remain in the Localization pages.
- [ ] Run `git diff --check` and inspect the complete diff.
