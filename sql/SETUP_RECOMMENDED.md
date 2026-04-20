# Recommended Supabase Setup

Run these scripts in order:

1. sql/01-core-schema.sql
2. sql/03-customer-profile-updates.sql
3. sql/04-loyalty-system.sql
4. sql/05-seed-nepali-thai.sql

These files are the canonical setup for this repository.
They are idempotent and safe to run more than once.

## Quick Verify Query

```sql
select table_name
from information_schema.tables
where table_schema='public'
and table_name in (
  'menu_categories','menu_items','tables','orders','order_items',
  'transactions','settings','inventory','users',
  'loyalty_settings','user_loyalty','loyalty_ledger'
)
order by table_name;
```

Expected: 12 rows.

## Notes

- Older SQL files are kept for history and debugging only.
- For new setup, follow the order above.
- This project uses Supabase Auth and Supabase data only.
