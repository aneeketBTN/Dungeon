# Dungeon — Mac workstation and Computer Use handoff

Updated: 2026-08-13

The MacBook Pro supplies private local inference to the authoritative Windows checkout and can also
serve as a second development or browser-verification workstation. It is **not** a server for the
live cohort. Production remains the Cloudflare Worker, and a merge to `main` remains the deploy
trigger.

Verified Mac host: MacBook Pro, Apple M4 Pro, 48 GB, macOS 26.6.1; Git 2.50.1, Python 3.9.6,
Node 26.4.0. Its Tailscale peer is `aneekets-macbook-pro` at `100.81.20.35`; the Windows peer is
`dungeon-windows` at `100.113.218.20`. Native Remote Login is on and the Mac-local ED25519 host
fingerprint is `SHA256:D5gRJY+XdZdABIQ34yzm+UW9PjDSSpEAxktnkXTEJrc`. Tailscale peer ping is
verified from Windows. Native SSH over Tailscale was confirmed using the dedicated Windows identity;
the captured host fingerprint matched exactly. Use the Windows SSH alias `dungeon-mac`.

Verified inference host: LM Studio 1.5.0 with
`qwen3.6-35b-a3b-claude-4.6-opus-reasoning-distilled` loaded on loopback port 1234, 8192-token
context, parallelism 1, maximum GPU offload, and about 26.56 GiB loaded. The installed model is
28.51 GB. Aneeket selected this exact LM Studio identifier as the local practice authority; do not
rename it as an official base checkpoint. The separate 48-answer owner-marked quality gate remains
open.

## 0. Confirm the Mac can run the local model

In Terminal:

```bash
system_profiler SPHardwareDataType | egrep 'Model Name|Model Identifier|Chip|Memory'
sw_vers
git --version
python3 --version
node --version
```

LM Studio currently requires Apple Silicon and macOS 13.4 or newer; MLX models require macOS 14 or
newer. It recommends at least 16 GB RAM, but the proposed 35B-class checkpoint needs materially more
headroom. Do not guess from the model name: use LM Studio's load-time memory estimate, start with an
8K context, and leave several GB for macOS and the browser. If the machine is Intel, stop this path.
If Node is missing or below 20, install a current Node LTS release before running Dungeon's grader.

## 1. Optional: put the repository on the Mac

The Windows→Mac inference bridge does **not** require a Mac checkout. Keep Windows authoritative
unless you independently want to develop on macOS.

Prefer a Git clone of the private repository in a local folder such as `~/Developer/Dungeon`.
Copying the whole folder also works, but do not copy only `app/`: governance, tests, tools, evidence,
and the Cloudflare boundary are part of the project. Work on a `codex/*` branch and open a pull
request; never push or merge directly to `main`.

Live learner state is deliberately absent from the repository. Signed-in progress comes from D1;
localhost uses its own browser storage under `term6.revision.v2`. A new origin or browser profile
starts with separate local state and does not erase the live profile.

## 2. Install ChatGPT Computer Use on macOS

1. Install and sign in to the official [ChatGPT desktop app](https://openai.com/chatgpt/desktop/).
2. In ChatGPT, open **Work or Codex → Plugins → Computer Use**, then choose **Install** and enable
   both the server and skill. The official setup guide is [Computer Use](https://learn.chatgpt.com/docs/computer-use).
3. Open **System Settings → Privacy & Security**. Grant ChatGPT:
   - **Screen & System Audio Recording** (or **Screen Recording**, depending on macOS version);
   - **Accessibility**.
4. Quit and reopen ChatGPT after changing either permission. In **ChatGPT Settings → Computer use**,
   confirm the capability is enabled.
5. Open the Dungeon folder in Codex. Use the built-in Browser for this local web app first. Use
   `@Computer` when a task requires desktop UI outside the browser, and `@Chrome` only when an
   existing signed-in Chrome session is required.

Copy-ready first prompt, before installing anything:

```text
@Computer Open Terminal, run the hardware and tool-version checks from docs/ops/MAC_TRANSFER.md,
and report the exact chip, memory, macOS, Git, Python, and Node versions. Do not install packages,
download models, change macOS security settings, expose a public tunnel, push Git, or touch the live
site. Report any permission prompt and wait for me.
```

### Connect Windows Codex to this Mac over SSH

The Connections screen distinguishes two directions. **Control this PC** makes the current computer
a host and generates a code for a supported remote controller; it has no field for a code generated
by another desktop. Windows→Mac desktop work uses the adjacent **SSH** tab. This was corrected after
the owner supplied a screenshot of the actual Windows UI.

Use SSH only on the same trusted LAN for the first setup. Do not port-forward port 22, expose Remote
Login to the internet, or introduce VNC.

1. Update the ChatGPT desktop app on both machines and keep the Mac awake.
2. On the Mac, open **System Settings → General → Sharing → Remote Login**. Enable it only for the
   owner account that will hold Dungeon. This is a macOS security change and must be performed by
   the owner, not Computer Use.
3. In Mac Terminal, collect the connection facts without sharing a password:

```bash
whoami
scutil --get LocalHostName
ipconfig getifaddr en0 || ipconfig getifaddr en1
```

4. On Windows, open **Codex → Settings → Connections → SSH**, choose **Add**, and connect using the
   Mac account and either `MAC_LOCAL_HOSTNAME.local` or the private LAN IP. Prefer SSH-key
   authentication if the panel supports an existing SSH config; never paste the Mac password into
   this repository or chat.
5. Open `~/Developer/Dungeon` as the remote workspace, then run this read-only smoke prompt:

```text
On the connected Mac host, report the hostname, current Dungeon path, Git branch, macOS version,
Node version, and whether http://127.0.0.1:8099/ responds. Do not install, edit, start or stop
anything, approve a model, expose a network service, push Git, or touch production.
```

Once that succeeds, the Windows Codex client can work in the Mac-hosted SSH workspace. Local Dungeon
files, Terminal, LM Studio, and localhost remain on the Mac. SSH workspace access does not by itself
grant macOS Computer Use; that capability must remain enabled and permissioned in the Mac app when
the selected remote workflow supports it. If the SSH panel's fields differ from this description,
capture that tab before entering credentials and update this handoff from the observed UI.

#### Tailscale fallback when the Wi-Fi isolates clients

The owner's `Lifeline 5G` access point permits ARP but blocks peer IP traffic, so native LAN SSH is
unreachable even while macOS listens on `*:22`. Use Tailscale as the encrypted network path and keep
native macOS Remote Login as the SSH service. Do not enable an exit node, subnet routes, Tailscale
SSH, public sharing, or port forwarding.

The verified Windows peer is `dungeon-windows` at `100.113.218.20`, running Tailscale 1.102.2 with
`RouteAll:false`, no advertised routes, `RunSSH:false`, and posture checking off. On the Mac, install
the official stable Standalone client, sign into the same tailnet, and report its `tailscale ip -4`.
Then put `aneeket@MAC_TAILSCALE_IP` in the Codex SSH form, port 22, with the dedicated Windows
identity `C:\Users\knigh\.ssh\dungeon_mac_ed25519`. Before accepting the first connection, compare
the key presented from Windows with the Mac-local ED25519 host fingerprint:

```text
SHA256:D5gRJY+XdZdABIQ34yzm+UW9PjDSSpEAxktnkXTEJrc
```

The verified address is `100.81.20.35`, recorded in the Windows SSH config as `dungeon-mac`.
`ssh dungeon-mac` completed from Windows on 2026-08-13 and returned macOS 26.6.1, `arm64`, and
`Aneekets-MacBook-Pro.local`.

**Mullvad constraint:** the Mullvad macOS client installs a PF kill-switch anchor whose terminal
`block drop quick all` rule blocks incoming Tailscale traffic. The failure is visible as repeated
SYN packets arriving on the Mac's Tailscale `utun` interface with no SYN-ACK. Mullvad's macOS split
tunnelling supports outgoing applications only, not incoming services such as SSH. Disconnect
Mullvad and ensure Lockdown mode is off before opening this SSH connection. Do not weaken or edit
Mullvad's PF rules manually. Reconnect Mullvad after the remote session if remote Mac access is no
longer needed.

## 3. Keep the external course source private

The preferred two-machine path reads the existing transcript pack on Windows; do not copy it just
to run the model. For an independent all-Mac checkout, copy the separately supplied transcript
directory to a local path such as:

```text
~/Documents/Term 6 Clean Transcripts
```

Do not commit it. Confirm that it contains subject subdirectories or the AI-ready pack manifest,
then run the real source gate with the path present:

```bash
node tools/validate_t6_bank.js "$HOME/Documents/Term 6 Clean Transcripts"
```

An empty `coverage` block means the source check was skipped and is not a passing result.

## 4. Run the local website without a model on Mac (optional)

No package install is needed:

```bash
cd ~/Developer/Dungeon
python3 tools/server.py 8099
```

Or use the launcher:

```bash
cd ~/Developer/Dungeon
bash tools/start-mac.sh
```

Open [http://localhost:8099/](http://localhost:8099/). Stop the server with `Control-C`.

The server binds to `0.0.0.0`. If the Windows machine must open this **local development server**,
put both machines on the same trusted LAN, run `ipconfig getifaddr en0` on the Mac, allow Python in
the macOS firewall if prompted, and open `http://MAC_LAN_IP:8099/` from Windows. Do not port-forward
8099 and do not create a public tunnel. Computer Use running on the Mac itself should use
`localhost`, which needs no inbound firewall access.

## 5. Install and configure LM Studio

1. LM Studio is installed. In **Developer**, load
   `qwen3.6-35b-a3b-claude-4.6-opus-reasoning-distilled` and the embedding model
   `text-embedding-nomic-embed-text-v1.5`.
2. Use context **8192**, parallelism **1**, maximum GPU offload, and start the local server on port
   **1234**.
3. Keep **Serve on Local Network** off. Dungeon expects `http://127.0.0.1:1234/v1` and rejects a
   non-loopback model URL.
4. Confirm both exact loaded model IDs:

```bash
curl -s http://127.0.0.1:1234/v1/models | python3 -m json.tool
```

### Model availability decision

Aneeket selected the already installed
`qwen3.6-35b-a3b-claude-4.6-opus-reasoning-distilled` checkpoint. This resolves the model-selection
gate for the local product path; it does not claim that the distilled checkpoint is the official
base Qwen release. Replacing it requires a new exact-ID approval and calibration run.

Copy-ready Computer Use prompt after the model is already downloaded:

```text
@Computer Open LM Studio. Load the exact generation model I already downloaded,
qwen3.6-35b-a3b-claude-4.6-opus-reasoning-distilled, with context 8192, and also load
text-embedding-nomic-embed-text-v1.5. Open Developer and start the API server on port 1234 with
network serving OFF. Do not download or substitute a model, enable MCP, expose the server to the
LAN, or change global security settings. Then open Terminal, run
curl -s http://127.0.0.1:1234/v1/models, and report both exact loaded IDs.
```

## 6. Start the private Windows→Mac grader

First disconnect Mullvad on the Mac and leave LM Studio serving on `127.0.0.1:1234`. From the
authoritative Windows checkout:

```powershell
pwsh -NoProfile -File tools/start-windows-mac-grader.ps1 -HealthOnly
```

The launcher reuses or opens an SSH local forward at Windows `127.0.0.1:12340`, verifies both exact
model IDs, verifies all 283 lectures are available from the Windows transcript pack, and never
exposes either service to the LAN. The health result must report `"available": true`, the exact
generation model, `"embeddingModel":"text-embedding-nomic-embed-text-v1.5"`,
`"lectureCount":283`, and `rubric-mark`. The local-only `subject-coach` capability is retained for
owner evaluation and is not linked from the learner app or exposed by the production Worker.

To start the website and guarded grader together:

```powershell
pwsh -NoProfile -File tools/start-windows-mac-grader.ps1
```

Open [the isolated written-response scenario](http://127.0.0.1:8099/app/t6.html?scenario=question-short-answer)
or the ordinary local app at [http://127.0.0.1:8099/](http://127.0.0.1:8099/). Stop the foreground
Dungeon server with `Control-C`. The SSH tunnel is loopback-only and may be closed when local model
work is finished. On the dashboard, **Practise written answers** selects four Dungeon-authored
prompts; each uses the question's declared-lecture boundary and rubric. The subject-wide hybrid-RAG
analyzer remains an internal local test path only.

## 7. Calibrate before treating the checkpoint as authority

Create an ignored local file such as `work/local-grader/calibration.jsonl`. Each line is one owner-
marked answer; do not commit real candidate answers:

```json
{"id":"brgsa-demand-strong-01","courseId":"BRGSA","questionId":"brgsa_m1_demand_short_answer","answer":"...","expected":{"principle":"met","decision":"met","reason":"met"},"tags":["clear","strong"]}
{"id":"brgsa-demand-ambiguous-01","courseId":"BRGSA","questionId":"brgsa_m1_demand_short_answer","answer":"...","expectedAbstain":true,"tags":["ambiguous","should-abstain"]}
```

Run:

```bash
npm run evaluate:grader -- work/local-grader/calibration.jsonl
```

The completed 12-case synthetic smoke spans all four subjects plus partial and prompt-injection
answers; it checks operation and adversarial shape, not academic truth. The provisional authority
review gate is 48
answers, at least 12 per subject, with ≤5% false awards, ≥85% exact case agreement, ≤30% abstention,
and zero marks issued on cases marked “should abstain”. These are conservative product acceptance
thresholds, not psychometric validation. Inspect every false award and every invented rationale;
the owner still decides whether the quality evidence is accepted. The exact checkpoint is already
owner-approved for this local path; that approval and this quality gate are intentionally separate.

The browser sends the answer only to the Windows Dungeon process; Dungeon reaches LM Studio only
through the encrypted loopback SSH forward. The local browser profile can retain the answer and
bounded result for resume.
It is not synced to D1 because localhost is not the production backend. Reset local progress or
clear the localhost site data to remove that copy.

## 8. Live-site and routing boundaries

To exercise the signed-in production site, use `@Chrome` on the Mac after installing the ChatGPT
Chrome extension and signing in normally. Do not copy cookies or browser storage between machines.

Run and inspect graded responses from the Windows localhost site. The grader route rejects
non-loopback clients and LM Studio remains on Mac `127.0.0.1`; never create a LAN listener or public
tunnel. The separate hosted implementation belongs behind the Cloudflare Worker and does not route
to the Mac. It remains disabled until its private Vectorize corpus, separate hosted-model
calibration, updated consent, D1 quota migration, real-Browser acceptance, and owner deployment are
complete. See `docs/ops/WRITTEN_AUTHORITY.md`.

## 9. Verify the checkout

```bash
cd ~/Developer/Dungeon
node --check app/t6.js
npm test
npm run check:palette
npm run check:exam
```

The content gates require the separately supplied transcript pack. Do not run
`tools/validate_t6_bank.js` without its transcript-root argument: an empty coverage result means the
lecture checks were skipped. The Mac-specific smoke pass is: open all four subjects, start and
resume one run, open one mock without submitting it, and inspect both themes at narrow and wide
widths. Record evidence before calling the Mac path verified.

Useful isolated routes include `?scenario=dashboard-progress`, `?scenario=question-mcq`,
`?scenario=question-boss`, `?scenario=simulation-results`, and
`?scenario=measurement-evidence`. `?scenario=measurement-question` is the isolated interaction
fixture for the rapid-response clock; `?scenario=measurement-msq-question` proves timing runs to
commit rather than the first selected option; `?scenario=measurement-restored-question` verifies
that a saved complete response resumes with unknown timing rather than being called rapid. Scenario
state does not overwrite the normal browser profile.
