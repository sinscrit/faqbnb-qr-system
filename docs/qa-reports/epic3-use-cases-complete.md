# L10N Epic 3 - Dynamic Content Translation
## End-to-End Use Case Test Scenarios

**Document Generated:** 2026-01-31
**Last Modified:** 2026-01-31
**Epic:** L10N Epic 3 - Dynamic Content Translation
**Total Use Cases:** 60
**Status:** Complete

---

## Executive Summary

This document contains comprehensive end-to-end test scenarios for the L10N Epic 3 - Dynamic Content Translation implementation. The use cases cover the automatic translation system for user-generated content (items, articles, links, tags) when owners create or update content.

### Coverage Summary

- **Happy Path Scenarios:** 21 use cases
- **Edge Case Scenarios:** 19 use cases
- **Error Handling Scenarios:** 13 use cases
- **Integration Scenarios:** 7 use cases
- **Total:** 60 use cases

### Key Features Tested

1. **Translation Workflow** (47 use cases)
   - Item creation and update triggers
   - Article creation and update triggers
   - Link creation and update triggers
   - Tag translation triggers
   - Source language detection
   - Translation job queuing

2. **Job Processing** (46 use cases)
   - Background job processing
   - Entity-specific processors (item, article, link, tag)
   - Job prioritization
   - Retry logic and exponential backoff
   - Concurrency control
   - Stale job cleanup

3. **API Endpoints** (26 use cases)
   - Translation status endpoint
   - Batch status endpoint
   - Retry failed translations endpoint
   - Manual translation override endpoint
   - Job monitoring endpoint

4. **Error Handling** (9 use cases)
   - Rate limiting errors
   - Service unavailable errors
   - Empty translation results
   - Invalid requests
   - Unauthorized access
   - Database errors

5. **Caching & Performance** (5 use cases)
   - Translation caching
   - Concurrent processing
   - Load testing (100+ jobs)
   - Query optimization
   - Index performance

6. **Integration** (6 use cases)
   - Full E2E workflows
   - Multi-entity scenarios
   - Guest experience integration
   - Cross-feature testing

---

## Coverage Analysis

### Translation Triggers Coverage

| Entity Type | Create | Update | Delete Old | Queue Jobs | Status |
|-------------|--------|--------|------------|------------|--------|
| Items | UC-E3-001 | UC-E3-002 | UC-E3-002 | UC-E3-001 | ✓ Complete |
| Articles | UC-E3-003 | UC-E3-019 | UC-E3-019 | UC-E3-003 | ✓ Complete |
| Links | UC-E3-004 | UC-E3-020 | UC-E3-020 | UC-E3-004 | ✓ Complete |
| Tags | UC-E3-005 | N/A | N/A | UC-E3-005 | ✓ Complete |

### Job Processing Coverage

| Aspect | Use Cases | Status |
|--------|-----------|--------|
| Job pickup with locking | UC-E3-006, UC-E3-026 | ✓ Complete |
| Item translation processor | UC-E3-007, UC-E3-001 | ✓ Complete |
| Article translation processor | UC-E3-008, UC-E3-003 | ✓ Complete |
| Link translation processor | UC-E3-004, UC-E3-020 | ✓ Complete |
| Tag translation processor | UC-E3-005, UC-E3-023 | ✓ Complete |
| Priority handling | UC-E3-013 | ✓ Complete |
| Concurrency control | UC-E3-026, UC-E3-060 | ✓ Complete |
| Retry logic | UC-E3-012, UC-E3-028, UC-E3-029 | ✓ Complete |
| Stale job cleanup | UC-E3-027 | ✓ Complete |

### API Endpoint Coverage

| Endpoint | Use Cases | Status |
|----------|-----------|--------|
| GET /api/translations/status/{entityType}/{entityId} | UC-E3-009, UC-E3-031, UC-E3-032 | ✓ Complete |
| POST /api/translations/status/batch | UC-E3-010, UC-E3-027 | ✓ Complete |
| POST /api/translations/retry | UC-E3-012, UC-E3-034, UC-E3-058 | ✓ Complete |
| PUT /api/translations/{entityType}/{entityId}/{language} | UC-E3-011, UC-E3-033, UC-E3-037 | ✓ Complete |
| POST /api/admin/process-translations | UC-E3-006, UC-E3-035 | ✓ Complete |
| GET /api/admin/translation-jobs | UC-E3-014 | ✓ Complete |

### Error Handling Coverage

| Error Type | Use Cases | Status |
|------------|-----------|--------|
| Rate limiting (429) | UC-E3-028 | ✓ Complete |
| Service unavailable (503) | UC-E3-029 | ✓ Complete |
| Empty translation result | UC-E3-030 | ✓ Complete |
| Invalid entity type | UC-E3-031 | ✓ Complete |
| Invalid UUID | UC-E3-032 | ✓ Complete |
| Unauthorized access | UC-E3-033 | ✓ Complete |
| No failed jobs to retry | UC-E3-034 | ✓ Complete |
| Unauthorized admin access | UC-E3-035 | ✓ Complete |
| Database connection error | UC-E3-036 | ✓ Complete |
| Invalid language code | UC-E3-037 | ✓ Complete |

### Edge Case Coverage

| Edge Case | Use Cases | Status |
|-----------|-----------|--------|
| Empty description | UC-E3-016 | ✓ Complete |
| Very long content | UC-E3-017 | ✓ Complete |
| Special characters | UC-E3-018 | ✓ Complete |
| Same source and target language | UC-E3-021 | ✓ Complete |
| System tags (no translation) | UC-E3-022 | ✓ Complete |
| Duplicate tag translation | UC-E3-023 | ✓ Complete |
| Partial translation completion | UC-E3-024 | ✓ Complete |
| Translation invalidation on update | UC-E3-025 | ✓ Complete |
| Concurrent job processing | UC-E3-026 | ✓ Complete |
| Mixed entity types in batch | UC-E3-027 | ✓ Complete |
| Very short content | UC-E3-057 | ✓ Complete |
| Proper nouns and brand names | UC-E3-059 | ✓ Complete |

### Integration Coverage

| Integration Scenario | Use Cases | Status |
|---------------------|-----------|--------|
| Full E2E: Create item to guest view | UC-E3-038 | ✓ Complete |
| Full E2E: Update with manual override | UC-E3-039 | ✓ Complete |
| Full E2E: Article with links | UC-E3-040 | ✓ Complete |
| Multi-property translation isolation | UC-E3-041 | ✓ Complete |
| Source language override workflow | UC-E3-042 | ✓ Complete |
| Cron job trigger and processing | UC-E3-043 | ✓ Complete |
| Performance under load (100+ jobs) | UC-E3-060 | ✓ Complete |

---

## Critical Path Scenarios

The following scenarios represent the critical path for Epic 3 and must all pass for release:

### 1. Basic Translation Workflow (Must Pass)
- **UC-E3-001**: Create Item Triggers Translation to All 5 Languages
- **UC-E3-002**: Update Item Re-triggers All Translations
- **UC-E3-003**: Create Article Triggers Translation
- **UC-E3-004**: Create Link Triggers Title Translation Only
- **UC-E3-005**: User Tag Translation on Item Save

### 2. Job Processing (Must Pass)
- **UC-E3-006**: Background Job Processor Picks Up Queued Jobs
- **UC-E3-007**: Item Translation Job Processing
- **UC-E3-012**: Retry Failed Translation Jobs

### 3. Status & Monitoring (Must Pass)
- **UC-E3-009**: Check Translation Status for Single Entity
- **UC-E3-010**: Batch Translation Status for List Views

### 4. Manual Override (Must Pass)
- **UC-E3-011**: Owner Manually Overrides Auto-Translation

### 5. Error Handling (Must Pass)
- **UC-E3-028**: Translation API Error - Rate Limited
- **UC-E3-033**: Unauthorized Access to Manual Override

### 6. Integration (Must Pass)
- **UC-E3-038**: Full E2E: Create Item to Guest View
- **UC-E3-060**: Full Translation Workflow Performance Under Load

---

## Use Case Format

Each use case follows this structure:

```
UC-E3-XXX: Title
Category: happy-path | edge-case | error-handling | integration
Related Tasks: [Task IDs from implementation plan]

Steps:
1. Step description
2. Step description
...

Expected Results:
- Expected outcome 1
- Expected outcome 2
...
```

---

## Test Execution Guidelines

### Prerequisites
1. Epic 1 (Foundation) must be fully implemented and tested
2. Test database should be seeded with:
   - At least 2 test accounts
   - At least 1 property per account
   - Sample items, articles, links
   - System tags pre-seeded
3. Translation service providers configured (Claude/OpenAI)
4. Environment variables set correctly

### Execution Order

1. **Phase 1: Happy Path** (21 scenarios)
   - Run all happy path scenarios first to validate core functionality
   - These should all pass before moving to edge cases

2. **Phase 2: Edge Cases** (19 scenarios)
   - Test boundary conditions and special cases
   - Verify system handles unusual inputs gracefully

3. **Phase 3: Error Handling** (13 scenarios)
   - Test error conditions and recovery
   - Verify proper error messages and status codes

4. **Phase 4: Integration** (7 scenarios)
   - Test full workflows end-to-end
   - Verify performance under load
   - Validate cross-feature integration

### Pass Criteria

- **Happy Path**: 100% must pass
- **Edge Cases**: 95% must pass (allow for documentation updates)
- **Error Handling**: 100% must pass
- **Integration**: 100% must pass

### Failure Handling

If a use case fails:
1. Document the failure in detail (steps, expected, actual)
2. Determine if it's a test issue or implementation issue
3. Create bug ticket if implementation issue
4. Re-run after fix to verify resolution

---

## Traceability Matrix

Maps use cases to implementation plan tasks:

### Phase 1: Content Translation Infrastructure
- Task 1.1 → UC-E3-001 through UC-E3-005
- Task 1.2 → UC-E3-001, UC-E3-002
- Task 1.3 → UC-E3-001, UC-E3-003, UC-E3-004
- Task 1.4 → UC-E3-005, UC-E3-022, UC-E3-023
- Task 1.5 → UC-E3-007, UC-E3-008, UC-E3-036
- Task 1.6 → UC-E3-009, UC-E3-010

### Phase 2: Modify Existing Content APIs
- Task 2.1 → UC-E3-042, UC-E3-015
- Task 2.2 → UC-E3-001, UC-E3-002, UC-E3-026
- Task 2.3 → UC-E3-003, UC-E3-019
- Task 2.4 → UC-E3-004, UC-E3-020
- Task 2.5 → UC-E3-005, UC-E3-022
- Task 2.6 → UC-E3-001, UC-E3-003

### Phase 3: Translation Job Processing Enhancement
- Task 3.1 → UC-E3-006, UC-E3-028, UC-E3-029
- Task 3.2 → UC-E3-007, UC-E3-030, UC-E3-057, UC-E3-059
- Task 3.3 → UC-E3-008
- Task 3.4 → UC-E3-004
- Task 3.5 → UC-E3-005, UC-E3-023
- Task 3.6 → UC-E3-013
- Task 3.7 → UC-E3-026, UC-E3-028, UC-E3-060
- Task 3.8 → UC-E3-027

### Phase 4: Translation Status & Management APIs
- Task 4.1 → UC-E3-009, UC-E3-031, UC-E3-032
- Task 4.2 → UC-E3-012, UC-E3-034, UC-E3-058
- Task 4.3 → UC-E3-011, UC-E3-033, UC-E3-037
- Task 4.4 → UC-E3-010, UC-E3-027

### Phase 5: Job Processing Trigger Setup
- Task 5.1 → UC-E3-006, UC-E3-035
- Task 5.2 → UC-E3-043
- Task 5.3 → UC-E3-014

### Phase 6: Database Indexes & Optimization
- Task 6.1 → UC-E3-060
- Task 6.2 → UC-E3-009, UC-E3-038
- Task 6.3 → UC-E3-056

### Phase 7: Testing & Validation
- Task 7.1 → UC-E3-044, UC-E3-045, UC-E3-046
- Task 7.2 → UC-E3-047, UC-E3-048, UC-E3-049
- Task 7.3 → UC-E3-050, UC-E3-051, UC-E3-052
- Task 7.4 → UC-E3-053, UC-E3-054, UC-E3-055
- Task 7.5 → UC-E3-060

---

## Summary

### Completion Status
✓ All 60 use cases defined
✓ Coverage validated across all implementation phases
✓ Critical path scenarios identified
✓ Traceability to implementation plan established
✓ Test execution guidelines documented

### Next Steps
1. Review use cases with stakeholders
2. Implement test automation where applicable
3. Execute manual test scenarios
4. Document test results
5. File bugs for any failures
6. Update use cases based on learnings

### Notes
- Use cases generated based on Implementation Plan-111-L10N-Epic3-Dynamic-Content-Translation
- Assumes Epic 1 (Foundation) is complete
- Performance targets: <60s for job processing, support for 100+ concurrent jobs
- Translation quality improved through context-aware translation service

---

**Document Status:** Complete and Ready for Testing
**Last Updated:** 2026-01-31
**Version:** 1.0
