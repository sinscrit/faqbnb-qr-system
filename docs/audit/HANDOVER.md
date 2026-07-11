# Audit Handover

## Purpose

This folder contains the repository audit for deciding how to restart FAQBNB in a way that an LLM can complete safely and efficiently.

## Files

- `00-current-state.md`: baseline branch, dirty state, stack, repo structure, and immediate risks.
- `01-product-map.md`: product intent, user roles, domains, MVP definition, and scope boundaries.
- `02-route-inventory.md`: route/API classifications and canonical route recommendation.
- Existing `api-error-audit-report.md`: prior API-focused audit report, preserved as source material.

## Status

Current completed documents:

- `00-current-state.md`
- `01-product-map.md`
- `02-route-inventory.md`
- `03-data-model.md`
- `04-auth-tenancy.md`
- `05-workflow-status.md`
- `06-architecture.md`
- `07-health-check.md`
- `08-deployment-config.md`
- `09-keep-rebuild-archive.md`
- `10-llm-restart-plan.md`

Audit status:

- Complete through restart planning.
- Next phase should create canonical `docs/restart/*` docs, then implement database reproducibility and auth/tenancy consolidation.

Keep these documents concise, evidence-based, and actionable.
