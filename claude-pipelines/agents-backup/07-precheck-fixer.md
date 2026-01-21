# Precheck Fixer Agent

**Last Modified**: 2026-01-21 (updated output format)

## Purpose

Automatically diagnose and fix common precheck failures so the pipeline can proceed.

## Activation

This agent is invoked when precheck fails. It receives the failure details and attempts to fix them.

## Capabilities

### 1. Dev Server Issues

**Symptoms:**
- Connection refused on localhost:3000
- Timeout when connecting
- HTTP 500 Internal Server Error

**Actions:**
1. Check if any process is using port 3000: `lsof -ti:3000`
2. If stuck process found, kill it: `kill -9 <pid>`
3. Check for TypeScript/build errors that prevent startup
4. Start the dev server: `npm run dev` (in background)
5. Wait for server to be healthy (poll localhost:3000)
6. If server fails to start, read error output and attempt to fix

### 2. TypeScript Errors

**Symptoms:**
- `npx tsc --noEmit` reports errors in production code

**Actions:**
1. Run `npx tsc --noEmit` to get full error list
2. For each error:
   - Read the file containing the error
   - Analyze the error type (missing property, type mismatch, etc.)
   - Apply the fix
3. Re-run TypeScript check to verify
4. Repeat until no production errors remain

### 3. Chrome CDP Not Running (for playwright_mcp)

**Symptoms:**
- Port 9223 not listening

**Actions:**
1. Check if Chrome is running: `pgrep -f "Google Chrome"`
2. If running without CDP, inform user to restart with CDP flag
3. Provide the command:
   ```
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
     --remote-debugging-port=9223 --user-data-dir=/tmp/chrome-debug
   ```

### 4. Supabase MCP Not Available

**Symptoms:**
- `mcp__supabase__list_tables` fails or times out

**Actions:**
1. Check Claude MCP configuration
2. Verify Supabase credentials in environment
3. Test database connection directly if possible

## Workflow

```
1. Receive precheck failure details
2. Categorize each failure
3. For each failure:
   a. Attempt automated fix
   b. Verify fix worked
   c. If fix failed, provide manual instructions
4. Re-run precheck
5. Report final status
```

## Instructions

When activated:

1. **Read the precheck results** to understand what failed
2. **Prioritize fixes** in this order:
   - TypeScript errors (blocks everything)
   - Dev server (required for MCP)
   - Chrome CDP (required for playwright)
   - Supabase MCP
3. **Fix one issue at a time** and verify before moving to next
4. **Do not proceed** if critical issues cannot be fixed
5. **Report clearly** what was fixed and what requires manual intervention

## Example Invocation

```
Fix the following precheck failures:

**Failed Checks:**
- dev_server: Connection refused on localhost:3000
- typescript: 3 production errors

**Instructions:**
1. Fix TypeScript errors first
2. Then start the dev server
3. Verify both are working
4. Report status
```

## Limitations

- Cannot start Chrome with CDP (requires user action due to security)
- Cannot fix Supabase credential issues (requires user to update .env)
- Cannot fix complex TypeScript errors that require architectural changes

## Output Format (MANDATORY)

The agent MUST end with this exact format (plain text, no code blocks):

```
PRECHECK FIX SUMMARY:
======================
ACTIONS TAKEN:
- Fixed TypeScript error in src/lib/foo.ts:42 - added missing property 'bar'
- Killed stuck process on port 3000 (PID 12345)
- Started dev server with npm run dev
- Verified server responding with HTTP 200

ISSUES FIXED:
- TypeScript: FIXED - resolved 3 type errors in production code
- dev_server: FIXED - restarted successfully, responding on localhost:3000

ISSUES REQUIRING MANUAL ACTION:
- Chrome CDP: User must start Chrome with --remote-debugging-port=9223

STATUS: PARTIAL
```

**Status values:**
- `SUCCESS` - All issues fixed automatically
- `PARTIAL` - Some issues fixed, others need manual action
- `FAILED` - Could not fix critical issues
