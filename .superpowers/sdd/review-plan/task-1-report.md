Status: SUCCESS

Commit: 0edbf364975995cd7ce64663f7db17f2a4f51cf9
Subject: docs(topic-catalogue): fix consumers capitalization and restore consumers while keeping publisher updates

Verification: git show --check HEAD reported no whitespace errors; focused check confirms every Topic and Gatherer data row has exactly five table cells.

Concerns: None. I corrected accidental lowercasing of React context names and restored consumers while applying the requested publisher updates (ConfigurationTopic -> Shell; CurrentPageTopic -> App/RC; GlobalLoadingTopic/GlobalErrorTopic -> Any App/RC; MessageTopic -> Apps/Remote Components). No code changes were made; this is documentation-only.

Report path: .superpowers/sdd/review-plan/task-1-report.md

- Round 1 fix: updated ConfigurationTopic, GlobalLoadingTopic, MessageTopic publishers to include Shell based on controller evidence. Commit: bdfa3328
- Round 2 fix: corrected framework adapter docs to describe per-adapter Topic instances, documented Shell usage of Angular adapters, clarified Angular vs React external-topic teardown behavior, and fixed topic-catalogue debugging guidance to point readers at linked Topic definitions for transport names.
