# Syllabus term lists

One file per subject: the named, examinable ideas the course's own per-module revision sheets
carry, with the module each belongs to.

## Why these files exist

`tools/measure-syllabus-coverage.mjs` answers the only question that matters for a learner who
arrives cold: **if they read nothing but Dungeon, would they ever meet this idea?** That needs a
list of what the course actually examines. Before these files existed there was no such list in
the repository, so nothing could tell whether the teaching layer covered a tenth of the syllabus
or all of it — and it turned out to be about half.

## What may and may not go in them

**Terms only.** A name, its module, and optionally the aliases the course itself uses for the same
idea. Nothing else.

The source material in `docs/course-material/` is owner-supplied and gitignored
(`.gitignore:43`). No sentence, definition, table, or passage from it may be copied into this
directory or anywhere else in the repository. A term is a label, not content — that is what makes
this list committable when the material behind it is not.

The same rule the lesson layer already follows applies here: prose is authored, never extracted.
See `docs/authoring/LESSON-AUTHORING-PROTOCOL.md`.

## Shape

```json
{
  "courseId": "SPMS",
  "source": "course revision sheets, modules 1-8",
  "modules": {
    "1": [
      "Product vs project",
      {"term": "Jobs to Be Done", "aliases": ["JTBD"]}
    ]
  }
}
```

A bare string is a term. An object adds `aliases` — other names the course or the lesson layer
uses for the same idea, so a lesson that teaches "data protection by design" satisfies "Privacy by
design" without a second entry. Matching is lexical and case-insensitive; an alias hit counts as
taught.

## Keeping them honest

These lists were derived from the revision sheets and then curated by hand. Two kinds of error are
expected and both matter:

- **A term that is not really examinable** inflates the denominator and makes coverage look worse
  than it is. Delete it.
- **A missing term** hides a real gap. RICE was missed on the first pass because the course renders
  its formula as an image, and the extractor only saw `RICE (Quantitative):` followed by a blank
  line. It was added by hand after the omission was caught.

When a term is added or removed, re-run `npm run check:syllabus` and move the floor in
`coverage-floors.json` only if the change was authoring, not accounting.
