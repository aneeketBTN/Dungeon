# Scanned-notes transcription — run plan

Nine of the 49 course-notes files are image-only scans. `pdftotext` gets **0 characters per
page** from them, so `tools/lib/course_notes.js` marks them `searchable: false` and every
vocabulary finding in the modules they cover is reported as *unverified* rather than judged.
Transcribing them by eye is the only way to close that.

This file is the work plan. It is self-contained: another Claude session on any account can
pick up a row, follow the steps, and finish it without reading the rest of this repo.

---

## Why this is worth doing

Transcribing SPMS module 1 (11 pages) converted 10 unverifiable warnings into decisive
verdicts and immediately exposed **three real vocabulary errors** in the teaching layer — the
notes say *Commercial insights*, *Telemetric data* and *life cycle* where the lessons said
"commercial interest", "telemetry" and "product life cycle". Those are exactly the
examiner-feels-foreign defects the whole gate exists to catch, and nothing else would have
found them.

Expect roughly the same yield per file.

---

## Status

**ALL NINE FILES ARE DONE — 193/193 pages. `course_notes.js` reports zero blind spots.**
This section is kept as the record of what was read and what each file flagged.

| Subject | File | Pages | Notes from the run |
|---|---|---:|---|
| SPMS | `Detailed Notes/module 1.pdf` | 11/11 | Exposed 3 real vocabulary errors (see below) |
| SPMS | `Detailed Notes/module 2.pdf` | 42/42 | 7 `[?]`; confirmed p19 duplicates p17; course prints **Earlyvangelists** (one word, abbrev. EVG) |
| IBM | `Detailed Notes/IBM M1-2.pdf` | 22/22 | 32 `[?]`; p15 pixel-identical to p14; p13 photographed rotated 90° |
| IBM | `Detailed Notes/IBM M3-4.pdf` | 15/15 | 10 `[?]`; flags a "Rung De"/"Rang De" spelling split between p06 and p07, deliberately unreconciled |
| IBM | `Detailed Notes/IBM M 5-6.pdf` | 13/13 | 17 `[?]`; p04 right page is a printed Karnani diagram |
| IBM | `Detailed Notes/IBM M 7.pdf` | 6/6 | 18 `[?]`, 0 illegible |
| SCLM | `Detailed Notes/Module 1-2.pdf` | 43/43 | 12 `[?]`, 3 illegible. **Two flags worth acting on:** the same 10-week dataset shows week-6 as 752 on p36 and 742 on p38; and p35–p41 read as logically out of sequence, suggesting the notebook was photographed out of order across that range |
| SCLM | `Detailed Notes/Module 3-4.pdf` | 41/41 | Most formula-dense file. p37's unclear acronym is resolved by p38 as **CPFR** — recorded as a cross-reference, not a silent edit |
| SCLM | `Detailed Notes/Module 5.pdf` | 11/11 | 10 `[?]` |

BRGSA needed nothing — all 12 of its files extract cleanly.

Subject directory names, exactly as the folder spells them:

- IBM → `docs/course-material/IBM/`
- SCLM → `docs/course-material/Supply chain & Logistic Management/`
- SPMS → `docs/course-material/Software Product Management/`

---

## Cost, measured

One data point per model so far, same task shape:

| Model | File | Pages | Tokens | Tokens/page | `[?]` markers | Wall clock |
|---|---|---:|---:|---:|---:|---:|
| Opus 5 | IBM M 7 | 6 | 62,401 | ~10,400 | 18 | ~3 min |
| Sonnet 5 | IBM M3-4, M 5-6 | 15, 13 | *running* | | | |

At ~10.4k tokens/page, the remaining 159 pages cost roughly **1.65M output-side tokens on
Opus**. That is what exhausted a session limit when eight agents ran at once.

**Recommendation:** run the bulk on **Sonnet**, and escalate a single file to Opus only if its
`[?]` rate comes back far above the ~3/page Opus baseline, or if it is formula-dense (SCLM
Module 3-4 carries EOQ, safety stock and total-cost-of-ownership arithmetic, where a
mis-transcribed digit is worse than an admitted gap). Do not use Haiku here — the failure mode
that matters is silently smoothing ambiguous handwriting into confident wrong words, and that
is the one thing this pipeline cannot tolerate.

**Do not run more than 2–3 agents concurrently.** Eight parallel image-heavy readers hit the
session limit and produced nothing at all.

---

## The two rules that decide whether a run survives

Both were learned from failures, not theory.

1. **Single pass — no zooming to double-check.** Four agents died having read every page and
   written nothing, because they spent their remaining budget cropping and magnifying to
   verify. Their own last words were *"Let me zoom into a few number-heavy regions"*. A page
   transcribed once with an honest `[?]` beats a page verified twice and never saved.
2. **Write incrementally, every 2–3 pages.** If the run is cut off, whatever reached disk
   survives. Holding the whole transcription until the end means losing all of it.

---

## Steps

### 1. Render the pages

Needs PyMuPDF (`pip install pymupdf`). Set `SLUG` and `SRC` for the row you picked.

```bash
python -c "
import fitz, os
SRC = 'docs/course-material/IBM/Detailed Notes/IBM M1-2.pdf'
OUT = 'pages/ibm_m1_2'
os.makedirs(OUT, exist_ok=True)
d = fitz.open(SRC)
for i in range(d.page_count):
    d[i].get_pixmap(dpi=150).save(os.path.join(OUT, 'p%02d.png' % (i+1)))
print('rendered', d.page_count, 'pages to', OUT)
"
```

150 dpi is enough — the handwriting is legible and higher dpi only costs tokens.

### 2. Run the transcription agent

Use the prompt template below. Substitute the four bracketed values. Run it as a subagent on
Sonnet, or paste it into a fresh session on another account.

### 3. Verify what landed

```bash
f="docs/course-material/IBM/Detailed Notes/IBM M1-2.txt"; echo "$(wc -c < "$f") bytes, $(grep -c '^--- p' "$f") page markers, $(grep -o '\[?\]' "$f" | wc -l) ambiguous, $(grep -o '\[illegible\]' "$f" | wc -l) illegible"
```

Page-marker count **must** equal the page count in the status table. If it is short, the run
was cut off — relaunch for the missing pages only and append.

**The `--- pNN ---` markers are load-bearing, not decoration.** `course_notes.js` counts them
to decide whether a transcription actually covers its scan. A `.txt` only supersedes its `.pdf`
when the marker count reaches the PDF's page count; short of that the transcription is still
loaded and searched, but the scan **stays** on the unsearchable list carrying its shortfall
(`[partial 21/42]`). This exists because the first version superseded on the mere existence of
a `.txt`, and a half-written file — 21 of 42 pages, agent still running — silently erased a
42-page blind spot from the report. A transcription with no markers at all counts as 0 pages,
so omitting them makes your work invisible to the gate even when the content is complete.

Confirm it is ignored by git (it must never be committed — `.gitignore:43` covers
`docs/course-material/`):

```bash
git check-ignore -v "docs/course-material/IBM/Detailed Notes/IBM M1-2.txt"
```

### 4. Confirm the gate picked it up

The loader treats a `.txt` as superseding the same-named `.pdf`, so the scan drops out of the
unsearchable list automatically. No config change needed.

```bash
node tools/validate_t6_bank.js "C:/Users/knigh/OneDrive/Desktop/exam/Term 6 Clean Transcripts"
```

Expect the *unverified* warning count to fall. **Errors appearing is the point, not a
regression** — an error here means a lesson term is now provably absent from both the
transcripts and the module's own notes, which is a real defect the blind spot was hiding.
Fix those against the notes' exact wording.

---

## Prompt template

> Replace `[N]`, `[DIR]`, `[OUTPUT PATH]`, `[SUBJECT LINE]`, and the header line.

```
You are transcribing scanned course notes for an exam-prep app. The source PDF is image-only
(yields zero extractable text), so reading the rendered page images by eye is the ONLY way to
make this content searchable.

TASK
Read all [N] page images, in order, from:
[DIR]
Files are p01.png through p[N].png. Use the Read tool on each — it renders images visually.

WORK IN A SINGLE PASS. Read each page once and transcribe it. Do NOT re-read, crop, zoom or
magnify to double-check. A previous attempt died having read every page and written nothing,
because it spent its whole budget verifying. A page transcribed once with honest [?] markers
beats a page verified twice and never saved.

WRITE INCREMENTALLY. After every 3 pages, append what you have to the output file. If you are
cut off, what you already wrote must survive.

Output path (note the spaces):
[OUTPUT PATH]

[SUBJECT LINE]
Some pages may be two-page notebook spreads photographed together — transcribe the left page
fully, then the right, under one page marker, and say so.

THE ONE RULE THAT MATTERS MOST
Transcribe ONLY what you can see. Never infer, complete, expand or "improve". Never add a term,
definition, example or number not visibly written there. This file becomes an authority a
validator uses to decide whether the app's teaching vocabulary is real course vocabulary or
invented. Inventing one plausible-sounding term defeats the entire exercise.

- Ambiguous handwriting: best reading + [?] — e.g. `mission dilution[?]`.
- Truly illegible: [illegible]. Never guess a digit.
- Preserve the notes' own headings, numbering, tables, arrows, abbreviations, British
  spellings and misspellings exactly. Do not standardise terminology. Do not summarise.
- Diagram-only or blank pages: note briefly, transcribe any readable labels.

FORMAT — begin the file with:

[HEADER LINE]

Transcribed visually because the PDF is image-only and yields no extractable text.
Readings that were genuinely ambiguous in the handwriting are marked [?]. This file sits
beside its source inside the gitignored course-material tree and is never committed.

Mark page boundaries with lines like `--- p03 ---`.

REPORT BACK: pages read, count of [?] and [illegible], diagram-only/blank pages, and anything
unreadable. An admitted gap beats a confident guess.
```

---

## Per-subject fill-ins

### IBM — "Inclusive Business Models"

| File | N | Output path | Subject line |
|---|---:|---|---|
| `IBM M1-2.pdf` | 22 | `docs/course-material/IBM/Detailed Notes/IBM M1-2.txt` | This is IBM = "Inclusive Business Models", modules 1 and 2. Expect India's development challenge, GDP/per-capita figures, bottom-of-pyramid markets, and the Vaatsalya / Aravind style cases. Numbers are load-bearing — never guess a digit. |
| `IBM M3-4.pdf` | 15 | `.../IBM M3-4.txt` | modules 3 and 4 — microfinance (Grameen, self-help groups, responsible lending), rural BPO and impact sourcing. Interest rates and loan sizes matter. |
| `IBM M 5-6.pdf` | 13 | `.../IBM M 5-6.txt` | modules 5 and 6 — shared value, energy poverty, affordability, waste and recycling enterprises. |

Header line: `IBM Modules 1-2 — Detailed Notes (transcribed from the scanned pages of "IBM M1-2.pdf")`

### SCLM — "Supply Chain and Logistics Management"

| File | N | Output path | Subject line |
|---|---:|---|---|
| `Module 1-2.pdf` | 43 | `docs/course-material/Supply chain & Logistic Management/Detailed Notes/Module 1-2.txt` | modules 1 and 2 — flows, decision phases, push/pull, strategic fit, forecasting and error metrics. Expect formulas: ROA, cash-to-cash cycle, Little's Law, MAD/MAPE. Transcribe formulas EXACTLY, including subscripts and units. |
| `Module 3-4.pdf` | 41 | `.../Module 3-4.txt` | modules 3 and 4 — inventory (ABC, EOQ, safety stock, inventory costs) and sourcing/contracts (total cost of ownership, buyback and revenue-sharing contracts). Formula-dense; consider Opus for this one. |
| `Module 5.pdf` | 11 | `.../Module 5.txt` | module 5 — re-engineering, coordination, performance measures, mass customization, postponement, and the Kamadhenu ideal. |

Header line: `SCLM Modules 1-2 — Detailed Notes (transcribed from the scanned pages of "Module 1-2.pdf")`

### SPMS — "Software Product Management and Strategy"

| File | N | Output path | Subject line |
|---|---:|---|---|
| `module 2.pdf` | 42 | `docs/course-material/Software Product Management/Detailed Notes/module 2.txt` | module 2 — value pyramid, value proposition canvas (pain relievers, gain creators), markets and customer segments, TAM/SAM/SOM, early evangelists, MVPs and learning loops, market expansion, problem-solution fit vs product-market fit. |

Header line: `SPMS Module 2 — Detailed Notes (transcribed from the scanned pages of "module 2.pdf")`

**Known quirk:** an earlier agent reported that in `module 2.pdf`, **p19 duplicates p17**. Transcribe
it as seen and note the duplication rather than silently dropping a page — the page-marker
count check above expects all 42.

---

## What the completed transcription actually bought

The gate went from **34 warnings, 31 of them "unverified"** to **19 warnings, none unverified**.
Every finding is now decidable, and along the way the reading exposed defects nothing else
would have caught:

- `commercial interest` → **commercial insights**, `telemetry` → **telemetric data**,
  `product life cycle` → **life cycle**, `standalone software product` → **standalone**
  (SPMS module 1 — the lessons were using words the course does not).
- `early evangelists` → **Earlyvangelists**, the form the slides actually print, with EVG noted.
- `mean absolute percentage error` → **MAPE**; the spelled-out phrase appears nowhere in the
  course, only the acronym.
- Six forward-definitions became provable and were moved or dropped; four more surfaced once
  the last SCLM files landed.

It also caught **three bugs in the checker rather than the content** — ligatures, `-ise/-ize`,
and plural direction (`carbon markets` vs `carbon market`). Each had been accusing correct
lessons of inventing vocabulary. That ratio is worth remembering: when this gate fires, suspect
the matcher first.

## After all nine are done

1. Re-run the validator. Every remaining warning should be a real
   *"appears in neither the transcripts nor the module's notes"* finding, with no
   *"could not be extracted"* left.
2. Fix each surviving finding against the notes' **exact wording**, the way
   `commercial interest` → `commercial insights` was fixed. Do not invent a replacement, and
   do not shorten a heading to something meaningless just to satisfy the matcher.
3. Re-check `data/syllabus/*.terms.json` against the now-complete corpus. The earlier audit
   could not judge IBM because its notes were unreadable; with them transcribed, any listed
   "named idea" that appears in neither source is a genuine candidate for removal — and that
   is also the point at which the coverage floors can honestly be re-derived.
