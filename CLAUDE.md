# FAQBNB Project Notes

Last Modified: 2026-01-17

## URLs

- **Staging:** https://faqbnb-staging.up.railway.app
- **Version API:** https://faqbnb-staging.up.railway.app/api/version

## Version

Auto-versioning is enabled via pre-commit hook. Version format: `0.{commit_count}`

Check current version:
- Local: `cat version.json`
- Remote: `curl https://faqbnb-staging.up.railway.app/api/version`

## Deployment

```bash
railway up
```

## Database

- Supabase (check MCP for access)
- Tables: `users`, `accounts`, `access_requests`, `auth.users`
