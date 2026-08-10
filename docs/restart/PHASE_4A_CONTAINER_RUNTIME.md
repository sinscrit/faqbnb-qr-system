# Phase 4A Container Runtime Restoration

Status: **INDEPENDENTLY ACCEPTED**

Updated: 2026-08-10.

## Scope

Restore a supported, local Docker-compatible runtime for Phase 4 without
linking, querying, or mutating the existing data-bearing Supabase project. This
step proves only the host runtime and the repository-pinned Supabase CLI's
Docker access. Migration replay, pgTAP, generated types, and PostgreSQL 17
acceptance belong to Phase 4B.

## Initial State

- Host: Apple Silicon macOS 26.6 with 48 GiB memory and 887 GiB free disk.
- Docker CLI: `29.5.3`, installed at `/usr/local/bin/docker` and running as a
  Rosetta `darwin/amd64` client.
- Existing selected context: `desktop-linux`, targeting the unavailable socket
  `unix:///Users/shinyqk/.docker/run/docker.sock`.
- Docker Desktop application: not installed. Its named context and unrelated
  privileged-helper remnant were not removed or modified.
- Colima, Podman, OrbStack, and Rancher Desktop: not installed/running.
- System Supabase CLI: stale `2.20.12`; it was not used for project checks.
- Repository-pinned Supabase CLI: `./node_modules/.bin/supabase` version
  `2.113.0`.

## Installation And Configuration

The first `brew install colima` correctly refused to mix a Rosetta process with
the native ARM Homebrew prefix. Installation was repeated explicitly as ARM64:

```text
arch -arm64 /opt/homebrew/bin/brew install colima
arch -arm64 /opt/homebrew/bin/brew install docker-credential-helper
```

This installed:

- Colima `0.10.3`;
- Lima `2.2.0`; and
- Docker credential helper `0.9.8`.

No system package, cask, login service, privileged service, or existing Docker
context was removed. Colima was started as a user process with a persisted
profile:

```text
arch -arm64 /opt/homebrew/bin/colima start \
  --runtime docker \
  --arch aarch64 \
  --vm-type vz \
  --mount-type virtiofs \
  --cpus 4 \
  --memory 8 \
  --disk 40 \
  --vz-rosetta
```

The resulting VM uses macOS Virtualization.Framework, native `aarch64`, four
CPUs, 8 GiB memory, a 40 GiB Docker data disk, and a 20 GiB root disk. Rosetta
and binfmt provide optional `linux/amd64`/`linux/386` compatibility.

Colima created and activated its own Docker context:

```text
context: colima
socket:  unix:///Users/shinyqk/.colima/default/docker.sock
```

The first anonymous Alpine pull found a pre-existing
`"credsStore": "desktop"` reference whose Docker Desktop helper no longer
existed. The Docker configuration contained no registry auth entries. Its exact
pre-correction content was backed up to:

```text
/Users/shinyqk/.docker/config.json.phase4a-before-colima-20260810
```

The original and backup SHA-256 were both
`8e8bd6a37b9c2b77bb3033a22a020ecf78722127966a8b0db27e597558d6faf8`.
Only `credsStore` was changed from `desktop` to the installed
`osxkeychain`; Colima's already-selected `currentContext` and empty `auths`
object were retained. No credential values were read or recorded.

## Executor Evidence

`colima status`, `docker context inspect`, `docker version`, and formatted
`docker info` prove:

- Docker Engine server `29.5.2`;
- Docker API `1.54`;
- server OS/architecture `linux/arm64` (`aarch64`);
- four CPUs and `8,307,101,696` bytes reported daemon memory;
- `overlayfs` storage at `/var/lib/docker`; and
- the exact user socket/context recorded above.

A disposable container proof passed:

```text
docker run --rm --pull=always alpine:3.22 \
  sh -c 'printf "container_arch="; uname -m; printf "container_ok=true\\n"'
```

It returned `container_arch=aarch64` and `container_ok=true`. A filtered
post-run container listing was empty, proving `--rm` removed the test
container. The pulled image is `linux/arm64`. No application or Supabase
container was started in Phase 4A.

The repository-pinned CLI returned `2.113.0`. Its bounded daemon preflight:

```text
./node_modules/.bin/supabase status --debug
```

reached Docker and received the expected `No such container:
supabase_db_faqbnb_manus` result because Phase 4B has not started the local
stack. Debug output also reported that `~/.supabase/profile` is absent, which
confirms no local Supabase CLI login profile was introduced. Exit `1` is
expected for this stopped-stack check; it is not database acceptance. A
following `docker info` still passed, and `docker ps` was empty.

## Safety Boundary

- No `supabase link`, `db push`, `migration repair`, remote type generation,
  project reference, profile login, or remote API/database call occurred.
- No existing data-bearing Supabase project was named, queried, or mutated.
- No repository application code changed.
- No Supabase local stack or database container was started; Phase 4B must
  prove disposability before starting it.
- The Docker Desktop context/config remnants were preserved.

## Continue, Stop, And Recover

The runtime is deliberately left running for Phase 4B. Confirm it with:

```text
arch -arm64 /opt/homebrew/bin/colima status
docker context use colima
docker info
```

If it is stopped, restart the persisted profile with:

```text
arch -arm64 /opt/homebrew/bin/colima start
```

Stop it without deleting the VM, image cache, profile, or contexts:

```text
arch -arm64 /opt/homebrew/bin/colima stop
```

To select the historical context without deleting Colima:

```text
docker context use desktop-linux
```

Only if Docker Desktop is restored and its credential helper is available,
the exact prior Docker config can be recovered with:

```text
cp /Users/shinyqk/.docker/config.json.phase4a-before-colima-20260810 \
  /Users/shinyqk/.docker/config.json
```

That backup intentionally points at the absent Desktop credential helper, so it
must not be restored while Docker Desktop remains unavailable.

## Independent Validation

A different agent independently accepted Phase 4A without modifying its
implementation or documentation:

- repeated the installed formula versions, persisted Colima resources/runtime,
  active context/socket, Docker server/architecture, credential helper, backup
  hash, and repository-pinned Supabase CLI `2.113.0` checks;
- ran a distinct container named `phase4a-validator-20260810` with
  `--rm --pull=never` against the existing Alpine image and received `aarch64`
  plus `ok`;
- proved both exact validator-container residue and total container count were
  zero after that run;
- repeated the stopped-stack Supabase status check, which reached Docker and
  returned the expected missing `supabase_db_faqbnb_manus` result;
- found zero Supabase/PostgreSQL images, containers, volumes, or networks and no
  Supabase login profile, project reference, remote-project process, or
  application-source diff; and
- found no documentation correction or unresolved acceptance issue.

The pre-install context selection, first Rosetta Homebrew refusal, and first
credential-helper failure are historical executor observations and cannot be
reproduced after successful restoration. The validator therefore treated them
as transcript/artifact evidence rather than independently repeated current
state; the preserved contexts, configuration backup/hash, installed helpers,
and live outcomes are consistent with that record.

Do not accept Phase 4 itself from this evidence. Phase 4B must still start the
disposable local project, replay all six migrations on PostgreSQL 17, run every
pgTAP assertion and required probe, generate types, and repeat application
acceptance.
