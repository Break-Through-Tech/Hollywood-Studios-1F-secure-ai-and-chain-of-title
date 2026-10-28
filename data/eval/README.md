# Extraction evaluation dataset

30 **synthetic** entertainment-industry inputs with hand-written gold labels. Every person, title,
company, award, email and phone number is invented (emails use `.invalid`, phones use `555`).

## Layout

```
data/eval/cases/<NN-slug>/
  bio.txt        pasted biography           (input kind "bio")
  credits.txt    separate full credit list  (input kind "creditList")
  resume.txt     résumé text                (input kind "resume")
  gold.json      expected extraction
```

A case has one or more of the three inputs. `gold.json`:

```jsonc
{
  "id": "05-remake-same-title",
  "summary": "...",
  "tags": ["bio-only", "remake-same-title", ...],
  "inputs": { "bio": "bio.txt" },
  "expected": {                       // every field present; [] when nothing should be extracted
    "bio": [{ "value": "..." }],      // single-value fields hold 0 or 1 item
    "credits": [
      { "value": { "department": "Producing", "title": "Harbor Lights", "year": 2022,
                   "role": "Executive Producer", "work_type": "Film" },
        "needsConfirmation": true,    // optional: extractor should flag it
        "note": "why" }               // optional: for reviewers
    ],
    ...
  },
  "notes": ["Things that must NOT be extracted, e.g. films the member only watched."]
}
```

Values use the shared `Suggestion` value shapes (`api/profile/suggest/_types.ts`).
Types and a loader for scripts are in `scripts/eval/gold.ts`.
`tests/data/eval-dataset.test.ts` checks every label is grounded in its source text and uses valid options.

## Labeling rules

These are the judgment calls behind the labels. If you disagree with one, change the rule here and
update the affected cases.

**General**
- Label only what the text states. Missing → `[]` / `null`. Never fill from outside knowledge.
- Each list item is its own entry. The same credit mentioned in two inputs is labeled once.
- When inputs disagree, keep the credit-list value and set `needsConfirmation` (case 25).

**Bio, headline, location**
- `bio`: the narrative text as supplied (the whole paste for bios; the Summary/About section for résumés).
- `headline`: only an explicit title line (résumé header, LinkedIn headline). "Writer-director Noor…" in
  running prose is not a headline.
- `location`: where the member is based now. Birthplaces, childhood cities and story settings are
  excluded. A city given only as the employer's location is labeled but flagged.

**Credits**
- Film and TV only. Stage productions are excluded.
- One credit per (title, year, role). A multi-hyphenate on one title gets several credits.
- `role` is the specific role: Producer ≠ Executive Producer ≠ Co-Producer ≠ Line Producer, and so on.
  Standard abbreviations are spelled out (EP → Executive Producer, DP → Director of Photography).
  Acting roles are the character name; "(voice)" and "(uncredited)" are kept in the role.
- `department`: Acting, Directing, Producing, Writing, Music, Camera, Editing, or Other.
  Casting, production design and art direction → Other. Lighting crew → Camera. 1st AD → Directing.
- `work_type`: Film, TV, Short, Web Series, or Music Video. Documentary features → Film. Series,
  miniseries, docuseries and TV movies → TV. If the text doesn't say, `null` + `needsConfirmation`,
  except in credit lists that mark TV/shorts explicitly, where unmarked entries are features.
- `year`: the year stated for that credit. Year ranges → first year. An award year is not a credit year.
- Missing year or role → `null` + `needsConfirmation`.
- Completed or in-post projects are included (in-post flagged); in-development projects are excluded.

**Experience, skills, awards, representation**
- Experience: jobs with an employer. Education, affiliations and union membership are excluded.
  Dates keep the precision given (`2016`, `2016-09`); "Present" → `end_date: null`.
- Skills: only from an explicit skills/specialties list.
- Awards: wins and nominations only. "Official Selection" and "shortlisted" are excluded.
  `award_name` is the award or festival; `category` is the prize or category.
- Representation: current reps only; "formerly with" is excluded. A rep with no stated role is
  labeled with the likely role and flagged.

## Coverage

| Tag | Cases |
|-----|-------|
| producer-vs-ep | 03, 05, 07, 12, 20, 21, 26, 30 |
| remake-same-title | 05, 30 |
| missing-year | 02, 11, 13, 14, 22, 23 |
| tv-vs-film | 06, 07, 19, 22, 25 |
| hallucination-trap | 13, 17, 22, 27 |
| location-trap | 06, 13, 19 |
| dedupe-across-inputs / conflict | 04, 25 |
| representation | 11, 15, 30 |
| has awards | 01, 11, 16, 20 |
| use-case mocks | 01 (empty profile), 30 (populated profile) |
