# Supabase User Stats Auto-Sync

## Problem
Supabase wasn't tracking `total_study_time` and `total_xp_earned` for users because the frontend was storing everything in localStorage and not properly syncing to the database.

## Solution
We've implemented database triggers that automatically calculate and update user stats whenever a study session is created or deleted.

## Migration Steps

### 1. Run the Migration
Apply the migration `009_auto_calculate_user_stats.sql` to your Supabase database:

```sql
-- This migration:
-- 1. Creates triggers that auto-update user_stats when study_sessions change
-- 2. Creates a function to backfill existing data
-- 3. Automatically runs the backfill on migration
```

You can run this via:
- Supabase Dashboard → SQL Editor → Paste the migration file contents
- Or via Supabase CLI: `supabase migration up`

### 2. Backfill Existing Data (if needed)
If you need to recalculate stats for all existing users, call the API endpoint:

```bash
POST /api/admin/recalculate-stats
```

Or manually run in Supabase SQL Editor:
```sql
SELECT recalculate_all_user_stats();
```

## How It Works

### Database Triggers
- **On INSERT**: When a new study session is created, the trigger automatically:
  - Calculates `total_study_time` = sum of all `duration_minutes` for that user
  - Calculates `total_xp_earned` = sum of all `xp_earned` for that user
  - Updates `total_sessions` = count of sessions for that user
  - Creates a `user_stats` record if one doesn't exist

- **On DELETE**: When a study session is deleted, the trigger recalculates all totals

### Frontend Sync
The frontend still saves study sessions to Supabase, and the database triggers handle the aggregation automatically. This ensures:
- ✅ Data is always accurate (calculated from source of truth: `study_sessions`)
- ✅ No race conditions or sync issues
- ✅ Works even if frontend sync fails temporarily

## Verification

Check that stats are being updated:
```sql
SELECT 
  user_id,
  total_study_time,
  total_xp_earned,
  total_sessions,
  (SELECT SUM(duration_minutes) FROM study_sessions WHERE user_id = user_stats.user_id) as calculated_time,
  (SELECT SUM(xp_earned) FROM study_sessions WHERE user_id = user_stats.user_id) as calculated_xp
FROM user_stats
LIMIT 10;
```

The `calculated_time` and `calculated_xp` should match `total_study_time` and `total_xp_earned`.

