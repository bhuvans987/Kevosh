<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Supabase Database Schema Migration Rule
When modifying database table column types, constraints, indexes, or relationships in `supabase/schema.sql` for an existing table:
1. **Never rely solely on `CREATE TABLE IF NOT EXISTS`** to apply these schema updates, as it is a no-op on existing tables.
2. **Provide a separate, explicit SQL `ALTER TABLE` block** for the user to execute.
3. **Clearly flag to the user** whether the change can be run safely as a fresh setup or if it requires a manual migration/alter statement on an existing database instance.

