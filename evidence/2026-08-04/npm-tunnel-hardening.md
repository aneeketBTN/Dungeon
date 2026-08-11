# npm Tunnel Hardening Verification

- **Goal:** Remove implicit npm package download and execution from the optional Windows public-
  tunnel helper.
- **Status:** `DIAGNOSED → IMPLEMENTED → VERIFIED(fail-closed runtime and source checks) → DONE`.
- **Date:** 2026-08-04.
- **Changed files:** `mock/serve-tunnel.cmd`, `AGENTS.md`, `BUG-LAWS.md`, `CHANGELOG.md`.
- **Environment:** Windows PowerShell and `cmd.exe`; Dungeon workspace only.
- **Primary acceptance:** deterministic launcher behavior before network exposure.
- **Remaining product gate:** real-browser acceptance remains `WAITING_REAL_BROWSER` and is
  unrelated to this launcher security change.

## Risk found

`mock/serve-tunnel.cmd` invoked `npx -y localtunnel` each time it opened the optional tunnel. That
allowed npm to resolve, download, and execute package code outside a project lockfile even though
the Dungeon application itself has no npm build or runtime dependency.

The workspace audit also found:

- no `package.json`, npm/PNPM/Yarn/Bun lockfile, or `node_modules` tree in Dungeon;
- no project reference to the reported `keyv`, `flat-cache`, `file-entry-cache`,
  `cacheable-request`, `cache-manager`, or `cacheable` package families;
- no named affected package in the inspected global npm directories or cached `npx` manifests;
- one cached LocalTunnel 2.0.2 tree from 2026-06-09, with none of the named package families in
  its lockfile.

## Security contract implemented

Before starting the Python server or opening a tunnel, the launcher now:

1. resolves an already-installed `lt.cmd` from `PATH`;
2. fails with exit code 1 when no CLI is available;
3. executes only the CLI's version check and requires exact version `2.0.2`;
4. fails with exit code 1 when the version differs;
5. displays the resolved executable path and verified version;
6. contains no npm, npx, Yarn, PNPM, or Bun execution and no automatic-download fallback.

## Verification

### Missing CLI

- **Setup:** restricted `PATH` to Windows system tools, excluding any `lt.cmd`.
- **Expected:** launcher refuses to run before either child process starts.
- **Observed:** printed `Tunnel not started: reviewed LocalTunnel CLI required` and exited 1.
- **Observed network state:** no process was listening on port 8080 after the check.

### Wrong version

- **Setup:** temporarily supplied a test `lt.cmd` reporting version `9.9.9`; removed the fixture
  immediately after the check.
- **Expected:** launcher identifies the resolved path and rejects the mismatched version before
  either child process starts.
- **Observed:** printed expected `2.0.2`, observed `9.9.9`, and exited 1.

### Source checks

- Version validation appears before both `start` commands.
- The launcher contains no package-manager command.
- The temporary mismatch fixture was removed.

## Intentionally unrun

The matching-version success path was not exercised because no explicitly reviewed global
LocalTunnel 2.0.2 installation is present and the test would open a public network tunnel. This
does not weaken the completed security acceptance: the goal was removal of implicit package
acquisition and fail-closed handling. Tunnel availability remains conditional on the owner
installing and reviewing the pinned external CLI.
