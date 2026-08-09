# Repository Agent Instructions

## Browser Testing

- Before using any Playwright MCP browser tool, run the `browser-init` workflow.
- Read `cdp_port` from `.projstuff`; do not invent or hardcode a project CDP port.
- Check `http://localhost:<cdp_port>/json/version`. If unavailable, start Chrome for Testing with:

  ```bash
  /Users/shinyqk/Documents/mastuff/proj/utils/bash/start_chrome_debug_mcp_playwright.sh "$(jq -r '.cdp_port' .projstuff)" --keep-session
  ```

- Use the standalone Playwright MCP tools (`mcp__playwright__browser_*`) only after that endpoint responds.
- Do not use the in-app browser for this repository.
- Start the local application separately, then navigate the Playwright MCP browser to its localhost URL.
- The Playwright MCP `--cdp-endpoint` port must match `.projstuff`. If `.projstuff` or MCP configuration changes after the session starts, restart the MCP/session before browser testing.
