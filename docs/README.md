# Infant Gut Shotgun-Metagenome Catalog — data package v1 (2026-09-25)

A curated, evidence-linked catalog of every public shotgun-metagenome study of the human infant gut (0–36 months) in the INSDC archives (ENA/SRA/DDBJ), with per-sample metadata recovered from archive attributes, supplementary tables and papers.

**Headline numbers.** 389 included studies · 153,743 samples · 174,022 sequencing runs · 606,023 sample × field determinations, each with a verbatim evidence quote · age at collection recovered for 53,802 infant-scope samples (37%) · precision vs 3,670 independently curated samples: age 0.99, delivery mode 0.995, preterm status 1.00.

Universe screened: 9,579 candidate studies (all METAGENOMIC WGS/WXS runs in ENA with a human signal, no taxon filter) → 389 included, 52 unresolvable after two full-text review rounds, the rest excluded with a coded reason (`universe_studies_all.parquet`).

## Files
| File | Rows | What it is |
|---|---:|---|
| `sample_metadata_wide.parquet` / `.csv.gz` | 153,701 | **Start here.** One row per sample: identifiers, body-site class, every metadata field with `<field>__confidence` and `<field>__route`, subject/timepoint, run accessions, cohort, links |
| `sample_determinations.parquet` | 606,023 | Long form: one row per sample × field with `evidence_source`, `evidence_locator`, `evidence_quote` (≤12 words verbatim), `route`, `scope`, `confidence` |
| `study_metadata_wide.parquet` / `.csv` | 389 | One row per included study (BioProject): title, counts, triage evidence, recoverability tiers, per-field coverage (`cov_*`), cohort, links |
| `runs.parquet` | 174,022 | Run → sample → study with library/instrument fields (join key into ENA/SRA) |
| `sample_subjects.parquet` | 153,701 | Subject and timepoint resolution per sample (`subject_key`, `role` infant/mother/other, `t_index`) |
| `cohorts.csv` | 373 | Cohort clusters (studies + papers sharing a cohort) with unique-infant estimates |
| `study_paper_links.csv` | 972 | Study ↔ paper links with PMID/PMCID/DOI and link method |
| `universe_studies_all.parquet` | 9,579 | Every screened study with verdict, reason code and evidence |
| `human_review_queue.csv` | 52 | Studies the pipeline could not decide, with the reason |
| `field_coverage_summary.csv`, `study_field_coverage_matrix.csv` | | Coverage per field and per study × field |
| `extraction_gold_eval_hires.csv` | | Precision/recall vs curatedMetagenomicData |
| `DATA_DICTIONARY.md` | | Every column, every vocabulary |
| `getting_started.ipynb` | | Load, filter, join, plot |

## How to read a value
Every value carries a **route** (R1 = archive sample attribute or sample-name convention (per sample); R2 = supplementary table row (per sample; 'subject_level_join' in parse_note when copied from a per-subject row); R3 = statement in the paper text applied to a defined group; R4 = abstract/ENA description statement (group; confidence ≤0.5).) and a **confidence** (0–1). For most analyses: use R1/R2 values at any confidence, and R3/R4 values only when `confidence ≥ 0.5` — those are group-level statements applied to samples. `parse_note` explains derivations (unit resolution, subject propagation, date arithmetic). Rows the validator rejected are not in these tables (see the release bundle for `*_rejected.parquet`).

## Known limitations
* Age is recoverable for ~37 % of infant-scope samples; per study it is all-or-nothing. ~42k samples belong to studies whose supplementary tables are keyed by identifiers absent from the archive (e.g. TEDDY) and can only be joined with submitter help.
* `antibiotic_exposure` means *any* antibiotics before/at sampling; sources that record only current use disagree (precision 0.87 vs that definition).
* `feeding_mode` categories differ between sources; precision 0.89.
* Exposure fields (probiotic, HMO, NEC, birth weight, maternal antibiotics) have no external truth set — audited by blind model re-judgement only.
* ~9.6k samples in included studies are adults/mothers (`adult_age_flag`); `body_site_class` and `role` separate them.
* Extension fields (`health_condition`, `multiple_birth`, `sibling_in_study`, `geo_subregion`) were added in a single pass and are less audited than the core fields.

## Provenance
Built 2026-09-17 → 2026-09-25 with Claude-model pipelines (Haiku for screening/normalisation, Sonnet for rubric judgement and prose extraction, Opus for adjudication), deterministic parsers, and two rounds of full-text model review of the undecidable residue. Full methods: `CATALOG_REPORT.md` and `EXTRACTION_REPORT.md` in the release bundle. Licence: CC-BY-4.0 for the curated tables (archive metadata remains under INSDC terms). Citation placeholder: *Infant Gut Shotgun-Metagenome Catalog v1, 2026.*
