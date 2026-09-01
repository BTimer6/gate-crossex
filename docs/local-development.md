# Local development

## Requirements and startup

The README bootstrap installs a private Node.js runtime and dependencies for normal local use. Contributors who clone the repository manually should use Node.js 20.19+, 22.13+, or 24 with npm, then run the launcher; it installs the lockfile-pinned dependencies when needed.

```bash
./run          # production build on macOS/Linux
./run dev      # hot reload on macOS/Linux
```

```powershell
.\run.ps1      # production build on Windows
.\run.ps1 dev  # hot reload on Windows
```

The launcher prefers `.runtime`, when present, over a system Node.js installation. It verifies dependency state against `package-lock.json`, builds the workspaces, applies checksummed migrations, selects an available loopback port, waits for health, and opens the UI. Production normally starts at `http://127.0.0.1:17840`.

Docker requires an access password. Copy the example environment file, replace the password, and start the container:

```bash
cp .env.example .env
docker compose up --build
```

The container publishes loopback only by default and stores data in the `gate-crossex-data` volume. It cannot use the host OS keychain.

For a public server, the recommended layout is an HTTPS reverse proxy on the same host forwarding to `127.0.0.1:17840`. Set `GCT_ALLOWED_HOSTS` to the public hostname, `GCT_FRONTEND_ORIGIN` to its full `https://` origin, and `GCT_ACCESS_COOKIE_SECURE=1`. Keep `GCT_PUBLISH_ADDRESS=127.0.0.1`; the reverse proxy is the only public listener.

Direct router forwarding without TLS is not recommended because the password and trading data cross the network as plain HTTP. If it is unavoidable on a trusted private network, set `GCT_PUBLISH_ADDRESS=0.0.0.0`, add the address clients use to `GCT_ALLOWED_HOSTS`, and leave `GCT_ACCESS_COOKIE_SECURE=0`.

Access authentication configuration:

| Variable | Purpose |
| --- | --- |
| `GCT_ACCESS_PASSWORD` | Enables server-side password authentication; must contain 12–256 characters. |
| `GCT_ACCESS_COOKIE_SECURE` | Set to `1` behind HTTPS so browsers only send the session cookie over TLS. |
| `GCT_ALLOWED_HOSTS` | Comma-separated public hostnames or IP addresses accepted by Host-header validation. |
| `GCT_FRONTEND_ORIGIN` | Exact browser origin, including scheme and optional port. |
| `GCT_PUBLISH_ADDRESS` | Docker host bind address; defaults to loopback. |

## Verification

```bash
npm ci --no-audit --no-fund
npx playwright install chromium
npm run verify
npm audit --audit-level=high
```

Tests use temporary databases, an in-memory credential vault, and fake gateways. They must never read local credentials or submit authenticated exchange requests.

## Local files

```text
.local-data/config.json          Selected ports and non-secret preferences
.local-data/runtime.json         Recorded process ownership
.local-data/gate-crossex.sqlite  Local database
.local-data/backend.lock         Single-backend lock
.local-data/dependencies.sha256  Lockfile used for the installed dependency tree
.runtime/                        Bootstrap-managed private Node.js runtime
logs/backend.log                 Backend log
logs/frontend.log                Development frontend log
```

These paths and `.env` are ignored by Git. Never share credentials, account identifiers, trading history, databases, or unredacted logs.

## Launcher commands

```text
./run                 Build and start
./run dev             Start hot reload
./run doctor          Print sanitized diagnostics
./run stop            Stop recorded local processes
./run logs            Print bounded recent logs
./run update          Back up, refresh source/runtime/dependencies, and build
./run backup [path]   Create and verify a SQLite backup
./run restore <path>  Validate and restore a backup
./run maintenance     Checkpoint, optimize, vacuum, and verify
./run reset           Delete local state after explicit confirmation
```

Use the corresponding `.\run.ps1` commands on Windows.

For bootstrap-managed source snapshots, `update` stages and validates a fresh source tree before activation and preserves `.local-data`, logs, and `.env`. For a normal Git checkout, it retains the fast-forward-only `git pull` workflow.

An interactive `./run` startup checks the latest published GitHub release with a short timeout and offers to run the existing update command when a newer semantic version is available. It skips development branches, pinned bootstrap refs, redirected input/output, and sessions with `GCT_SKIP_UPDATE_CHECK=1`; network failures never block startup. The PowerShell launcher provides the same behavior.

## Development rules

- Add new migrations; never edit a migration that may already have been released. Startup rejects checksum changes.
- Keep exchange fixtures synthetic and secret-free.
- Use the secure setup page for manual Gate testing and a dedicated least-privilege APIv4 key. Never grant withdrawal permission.
- Every backend start is trading-locked; enabling live mode is session-only.
- Keep the service on loopback unless access authentication is enabled and an HTTPS reverse proxy is the public boundary.

## Troubleshooting

- Run `./run doctor`, then `./run stop` and `./run`.
- If dependency installation fails, remove only `node_modules` and rerun; do not delete `.local-data`.
- Let the launcher choose another loopback port when the preferred port is occupied.
- Review `./run logs` locally and redact private trading data before sharing any excerpt.
