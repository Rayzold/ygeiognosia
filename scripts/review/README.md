# Spell-check tooling (Phase 1 review)

One-off scripts that produced `archive/review/*.csv`: corpus.py (text corpus from archive) → check.mjs (Hunspell el via nspell + dictionary-el) → triage.py (classify) → build_review.py (hand-curated fix list → orthografia.csv); mixed.py → latinika-grammata.csv. Paths are absolute to the Phase 1 work dir; adjust before re-running.
