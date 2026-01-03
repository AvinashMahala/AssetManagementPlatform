# Seeder CLI Usage

You can now run the seeder with CLI flags to automate workflows non-interactively.

- Interactive (default):
  - `python3 db/seeds/python/seed_to_db.py` (prompts for each step)
- Non-interactive / CI:
  - `python3 db/seeds/python/seed_to_db.py --seed -y` (run seeding without prompts)
  - `python3 db/seeds/python/seed_to_db.py --drop --create --seed -y` (drop, recreate schema, seed)
  - `python3 db/seeds/python/seed_to_db.py --seed --dry-run -y` (preview actions, no DB writes)

You can filter which sheets to seed with `--only users,properties` or exclude with `--exclude receipts`.

There is a convenience npm script at the repo root:

```
npm run seed:db
```

Run logs and a JSON summary are written to the `logs/` directory after each run.
