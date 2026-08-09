# Reproducible Build Baseline

Status: complete and independently validated on 2026-08-10.

This baseline covers only the Milestone 0.3 runtime, dependency installation, typecheck, and production build slice. The production route gate was completed and independently validated as a subsequent slice; see `ROUTE_GATE.md`. Provider-side credential rotations listed in `SECURITY_INVENTORY.md` remain outstanding and do not block this local baseline.

## Pinned Toolchain

| Tool | Pin | Repository source |
| --- | --- | --- |
| Node.js | `22.23.2` (LTS `Jod`) | Exact selection in `.nvmrc` and `.node-version`; supported deployment range `>=22.23.2 <23` in `package.json#engines.node` |
| npm | `10.9.9` | `package.json#packageManager` and `package.json#engines.npm` |
| Dependency graph | `package-lock.json` | Installed only with `npm ci --include=optional` |

The versions were selected from published package metadata rather than inferred from the machine's default runtime. The validation shell used exact temporary `node@22.23.2` and `npm@10.9.9` packages because no Node version manager or Node 22 installation was present on the machine.

Nixpacks accepts only a Node major selector. `nixpacks.toml` therefore selects Node `22` consistently with the exact local/CI pin and invokes npm `10.9.9` explicitly for install and build. The Node engine accepts later Node 22 patches but rejects earlier patches and other majors. A deployment must report its resolved Node patch in build logs; if it is not `22.23.2`, record and validate that patch before claiming Railway parity.

## Commands And Results

All commands ran from the repository root. No environment values were printed or recorded.

| Check | Command | Result | Wall time |
| --- | --- | --- | ---: |
| Runtime identity | `node --version`; `node -p "process.release.lts"`; `npm --version` | `v22.23.2`; `Jod`; `10.9.9` | under 1s after tool availability |
| Clean dependency install | `npm ci --include=optional` | Passed; 943 packages installed and 944 audited | 12s on the final repeat run |
| Native watcher | `node -p "require('@parcel/watcher-darwin-arm64/package.json').version"` plus binary existence check | `2.5.4`; native binary present | under 1s |
| TypeScript | `npm run typecheck` | Passed with no diagnostics | 2.35s |
| Production build | `npm run build` | Passed after the final clean install; Next.js emitted `.next/BUILD_ID` and the route manifest | 37.65s |

The clean install itself removed the previous `node_modules` contents before reconstructing the dependency tree from `package-lock.json`. Optional dependencies are enabled by the committed `.npmrc` and were also explicit in the acceptance command. No direct or platform-specific dependency was added for `@parcel/watcher-darwin-arm64`; its lockfile-declared optional package now installs reproducibly on macOS ARM.

## Known Non-Blocking Output

The successful install/build reported these follow-ups:

- Four deprecated packages during installation: the two legacy Supabase auth-helper packages, `jpeg-exif`, and `node-domexception`. Canonical auth work already intends to converge on `@supabase/ssr`.
- `npm audit` reported 29 dependency findings: 1 low, 11 moderate, 15 high, and 2 critical. Do not run an unreviewed bulk `npm audit fix`; triage upgrades as scoped dependency work.
- Sentry emitted deprecations for three webpack options and the legacy `sentry.client.config.ts` location.
- Webpack reported two `next-intl` dynamic-import cache-analysis warnings and three large-string cache serialization warnings.

None of those warnings failed installation, typechecking, or the production build. They are not waived permanently; they are categorized so later maintenance can address them without reopening this reproducibility result.

## Clean-Checkout Reproduction

Use a Node version manager that reads `.nvmrc` or `.node-version`. With `nvm`, the complete local sequence is:

```bash
nvm install
nvm use
npm install --global npm@10.9.9
node --version
npm --version
npm ci --include=optional
npm run typecheck
npm run build
test -s .next/BUILD_ID
```

Expected version output is `v22.23.2` and `10.9.9`. Stop immediately if either differs. Do not substitute `npm install` for `npm ci`, omit optional dependencies, reuse an old `node_modules`, or hand-edit the lockfile.

For CI, install Node from `.node-version`, install npm `10.9.9`, and run the same three acceptance commands. For Railway/Nixpacks, use the committed `nixpacks.toml` and inspect the resolved Node version in deployment evidence before declaring environment parity.

## Independent Validation

Result: **PASS**. A separate validator accepted the runtime/build slice after confirming:

- every exact pin agrees where the platform supports patch-level selection;
- a fresh `npm ci --include=optional` succeeds under the pinned toolchain;
- the native watcher package and binary are present on macOS ARM;
- typecheck and production build succeed under that same toolchain;
- no environment value or platform-specific direct dependency entered the diff;
- `git diff --check` passes.

The accepted slice retains four explicit follow-ups rather than overstating its scope:

- The host's default `node` and `npm` can still differ from the repository pins. Developers and CI must activate the pinned toolchain before running acceptance commands.
- `engines` and `packageManager` metadata are advisory in tooling that does not enforce them. Version output remains an explicit preflight check.
- Railway patch parity is pending a real deployment log because Nixpacks selects only the Node 22 major family.
- The 29 dependency vulnerability findings are separate security-maintenance work. Validation confirms a reproducible build, not that the dependency graph is vulnerability-free.
