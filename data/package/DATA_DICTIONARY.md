# Data dictionary

## sample_metadata_wide.parquet
| column | type | meaning |
|---|---|---|
| `sample_key` | string | ENA/BioSample accession (SAMEA/SAMN/SAMD) — primary key |
| `study_accession` | str | BioProject (PRJ…) |
| `secondary_sample` | str | ENA secondary sample accession (ERS/SRS/DRS) |
| `sample_title` | str | submitter sample title |
| `body_site_class` | str | primary (infant gut/stool) | maternal | other | unknown |
| `collection_date` | str | archive collection_date as given |
| `is_gold_heldout` | bool | True if in the curatedMetagenomicData evaluation set |
| `probiotic_exposure` | str | yes | no | unknown |
| `preterm_status` | str | preterm | term | unknown |
| `gestational_age_weeks` | float64 | float weeks at birth |
| `delivery_mode` | str | vaginal | c_section | c_section_elective | c_section_emergency | unknown |
| `feeding_mode` | str | exclusive_breast | mixed | formula | weaned | unknown |
| `antibiotic_exposure` | str | yes | no | unknown (any antibiotics to the infant before/at sampling) |
| `age_at_collection_days` | float64 | integer days postnatal |
| `birth_weight_grams` | float64 | integer grams |
| `country` | str | ISO-3166 alpha-2 |
| `maternal_antibiotics` | str | yes | no | unknown (pregnancy, labour or lactation) |
| `hmo_supplementation` | str | yes | no | unknown |
| `nec_status` | str | yes | no | unknown (necrotising enterocolitis diagnosis) |
| `health_condition` | str | healthy_control | preterm_nicu | nec | sepsis_or_infection | ibd_or_gi_disease | allergy_or_atopy | malnutrition | antibiotic_or_probiotic_trial | other_disease | unknown |
| `multiple_birth` | str | singleton | twin | triplet_or_more | unknown |
| `sibling_in_study` | str | yes | no | unknown |
| `geo_subregion` | str | 'City, Region' free text as given by submitter (never reverse-geocoded) |
| `sex` | str | male | female | unknown |
| `timepoint_label` | str | study's own label (free text) |
| `subject_id` | str | study's own subject identifier (free text) |
| `probiotic_exposure__confidence` | float | confidence (0–1) of `probiotic_exposure` |
| `preterm_status__confidence` | float | confidence (0–1) of `preterm_status` |
| `gestational_age_weeks__confidence` | float | confidence (0–1) of `gestational_age_weeks` |
| `delivery_mode__confidence` | float | confidence (0–1) of `delivery_mode` |
| `feeding_mode__confidence` | float | confidence (0–1) of `feeding_mode` |
| `antibiotic_exposure__confidence` | float | confidence (0–1) of `antibiotic_exposure` |
| `age_at_collection_days__confidence` | float | confidence (0–1) of `age_at_collection_days` |
| `birth_weight_grams__confidence` | float | confidence (0–1) of `birth_weight_grams` |
| `country__confidence` | float | confidence (0–1) of `country` |
| `maternal_antibiotics__confidence` | float | confidence (0–1) of `maternal_antibiotics` |
| `hmo_supplementation__confidence` | float | confidence (0–1) of `hmo_supplementation` |
| `nec_status__confidence` | float | confidence (0–1) of `nec_status` |
| `health_condition__confidence` | float | confidence (0–1) of `health_condition` |
| `multiple_birth__confidence` | float | confidence (0–1) of `multiple_birth` |
| `sibling_in_study__confidence` | float | confidence (0–1) of `sibling_in_study` |
| `geo_subregion__confidence` | float | confidence (0–1) of `geo_subregion` |
| `sex__confidence` | float | confidence (0–1) of `sex` |
| `timepoint_label__confidence` | float | confidence (0–1) of `timepoint_label` |
| `subject_id__confidence` | float | confidence (0–1) of `subject_id` |
| `probiotic_exposure__route` | str | evidence route of `probiotic_exposure` (R1–R4) |
| `preterm_status__route` | str | evidence route of `preterm_status` (R1–R4) |
| `gestational_age_weeks__route` | str | evidence route of `gestational_age_weeks` (R1–R4) |
| `delivery_mode__route` | str | evidence route of `delivery_mode` (R1–R4) |
| `feeding_mode__route` | str | evidence route of `feeding_mode` (R1–R4) |
| `antibiotic_exposure__route` | str | evidence route of `antibiotic_exposure` (R1–R4) |
| `age_at_collection_days__route` | str | evidence route of `age_at_collection_days` (R1–R4) |
| `birth_weight_grams__route` | str | evidence route of `birth_weight_grams` (R1–R4) |
| `country__route` | str | evidence route of `country` (R1–R4) |
| `maternal_antibiotics__route` | str | evidence route of `maternal_antibiotics` (R1–R4) |
| `hmo_supplementation__route` | str | evidence route of `hmo_supplementation` (R1–R4) |
| `nec_status__route` | str | evidence route of `nec_status` (R1–R4) |
| `health_condition__route` | str | evidence route of `health_condition` (R1–R4) |
| `multiple_birth__route` | str | evidence route of `multiple_birth` (R1–R4) |
| `sibling_in_study__route` | str | evidence route of `sibling_in_study` (R1–R4) |
| `geo_subregion__route` | str | evidence route of `geo_subregion` (R1–R4) |
| `sex__route` | str | evidence route of `sex` (R1–R4) |
| `timepoint_label__route` | str | evidence route of `timepoint_label` (R1–R4) |
| `subject_id__route` | str | evidence route of `subject_id` (R1–R4) |
| `subject_key` | str | resolved subject id (study-scoped) |
| `role` | str | infant | mother | other | unknown |
| `t_index` | float64 | ordinal timepoint within subject |
| `n_timepoints_subject` | float64 | timepoints for this subject |
| `linked_infant_subject_key` | str | for mother samples: the infant's subject_key |
| `run_accessions` | str | ';'-joined run accessions |
| `n_runs` | int64 | runs for this sample |
| `instrument_model` | str | instrument model(s) |
| `library_layout` | str | PAIRED/SINGLE |
| `read_count_total` | int64 | sum of read_count over runs |
| `study_title` | str | BioProject title |
| `cohort_id` | str | cohort cluster id (COH…) |
| `cohort_name` | str | cohort name |
| `first_public_min` | str | earliest run release date in study |
| `adult_age_flag` | bool | True when the resolved age is >36 months (adult/maternal sample) |
| `n_fields_with_value` | int64 | count of populated metadata fields |
| `ena_sample_url` | str | ENA browser link |
| `ena_study_url` | str | ENA browser link |

## sample_determinations.parquet
| column | meaning |
|---|---|
| `sample_key`, `study_accession`, `field_name` | key |
| `field_value` | raw value as found in the source |
| `value_normalized` | value in the controlled vocabulary/unit |
| `confidence` | 0–1 |
| `evidence_source` | label: `sample.attr.<key>`, `run.library_name`, `sample_id_pattern`, `paper.supp.table`, `paper.fulltext.methods`, `paper.abstract`, `study.description` … |
| `evidence_locator` | attribute key / pmcid:file:sheet:column / section |
| `evidence_quote` | ≤12-word verbatim quote |
| `evidence_limited_to_abstract` | 1 when the paper was paywalled |
| `determined_by` | parser or model id |
| `route` | R1–R4 |
| `scope` | sample | subject | group |
| `parse_note` | derivation notes (unit resolution, propagation, supersession, review flags) |
| `group_audit` | keep/downgrade for group statements (Opus audit) |
| `src_track` | pipeline pass that produced the row |

## Routes
R1 = archive sample attribute or sample-name convention (per sample); R2 = supplementary table row (per sample; 'subject_level_join' in parse_note when copied from a per-subject row); R3 = statement in the paper text applied to a defined group; R4 = abstract/ENA description statement (group; confidence ≤0.5).

## Field vocabularies
| field | values |
|---|---|
| `delivery_mode` | vaginal | c_section | c_section_elective | c_section_emergency | unknown |
| `feeding_mode` | exclusive_breast | mixed | formula | weaned | unknown |
| `preterm_status` | preterm | term | unknown |
| `antibiotic_exposure` | yes | no | unknown (any antibiotics to the infant before/at sampling) |
| `maternal_antibiotics` | yes | no | unknown (pregnancy, labour or lactation) |
| `probiotic_exposure` | yes | no | unknown |
| `hmo_supplementation` | yes | no | unknown |
| `nec_status` | yes | no | unknown (necrotising enterocolitis diagnosis) |
| `age_at_collection_days` | integer days postnatal |
| `gestational_age_weeks` | float weeks at birth |
| `birth_weight_grams` | integer grams |
| `country` | ISO-3166 alpha-2 |
| `sex` | male | female | unknown |
| `timepoint_label` | study's own label (free text) |
| `subject_id` | study's own subject identifier (free text) |
| `health_condition` | healthy_control | preterm_nicu | nec | sepsis_or_infection | ibd_or_gi_disease | allergy_or_atopy | malnutrition | antibiotic_or_probiotic_trial | other_disease | unknown |
| `multiple_birth` | singleton | twin | triplet_or_more | unknown |
| `sibling_in_study` | yes | no | unknown |
| `geo_subregion` | 'City, Region' free text as given by submitter (never reverse-geocoded) |

## study_metadata_wide.parquet
| column | meaning |
|---|---|
| `study_accession`, `study_title`, `n_samples`, `n_runs`, `first_public_min` | archive identity and size |
| `catalog_status`, `triage_verdict`, `decision_stage`, `confidence`, `evidence` | inclusion verdict and its evidence |
| `universe_slice` | enumeration channel that found the study |
| `recov_age`, `recov_delivery`, … | recoverability tier predicted before extraction (R1 archive / R2 table / R3 paper / R4 abstract / R0 none) |
| `cov_<field>` | fraction of the study's infant-scope samples with a value |
| `cohort_id`, `cohort_name`, `n_linked_papers`, `linked_pmids` | cohort and literature |
| `n_unique_infants_est`, `longitudinal`, `max_timepoints`, `n_mothers` | subject resolution |
| `worklist_rank`, `effort_class` | curation priority |
| `ena_url`, `ncbi_url` | links |