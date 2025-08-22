# Flyway Migrations

This folder contains versioned SQL migrations that evolve the database schema.

Recommended workflow:
1) First run (existing database):
   - We configured `spring.flyway.baseline-on-migrate=true` and `baseline-version=1`.
   - Start the app once; Flyway will create `flyway_schema_history` and mark version `1` as applied.
   - After the first successful startup, change `spring.flyway.baseline-on-migrate` to `false`.

2) New schema changes:
   - Add a new file: `V2__<short_description>.sql`, `V3__...`, etc.
   - Each file contains forward-only DDL and data fixes as needed.
   - Keep scripts idempotent where feasible (e.g., check existence before creating indexes).

3) Fresh environments:
   - Optionally add a `V1__init.sql` that contains a full schema for brand new databases.
   - With `V1__init.sql` present, Flyway can build the schema from scratch for empty DBs.

Naming:
- Files must start with `V<version>__` and use underscores for spaces, e.g.:
  - `V2__add_index_on_game_time.sql`
  - `V3__create_notifications_table.sql`

Tips:
- Test DDL in your DB client first, then commit as a new migration.
- Never edit previously applied migrations; add a new versioned script instead.
