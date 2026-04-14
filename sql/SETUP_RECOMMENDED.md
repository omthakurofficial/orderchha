# Recommended Supabase Setup (Use Only These 2 Files)

Run these scripts in order:

1. sql/01-core-schema.sql
2. sql/02-seed-demo-data.sql

These two files are the canonical setup for this repository.
They are idempotent and safe to run more than once.

## Quick Verify Query

```sql
select table_name
from information_schema.tables
where table_schema='public'
and table_name in (
  'menu_categories','menu_items','tables','orders','order_items',
  'transactions','settings','inventory','users'
)
order by table_name;
```

Expected: 9 rows.

## Notes

- Older SQL files are kept for history and debugging only.
- For new setup, do not run multiple old scripts together.
- This project uses Supabase Auth and Supabase data only.
