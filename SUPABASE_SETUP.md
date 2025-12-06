# Supabase Cloud Database Setup Guide

This document explains how to set up your Supabase database to enable cloud persistence for all your app data.

## Overview

Your app now supports cloud-based data storage using Supabase. All your data (levels, XP, study sessions, study time, mastery data, tasks, subjects, etc.) can be synced to the cloud and accessed from any browser or device.

## Prerequisites

- You already have a Supabase project set up (the environment variables are configured)
- Your Supabase URL and anonymous key are in the environment

## Setup Steps

### Step 1: Create Supabase Tables

You need to create the database tables in your Supabase project. There are two ways to do this:

#### Option A: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** section
3. Create a new query
4. Copy the entire SQL from `supabase/migrations/001_create_tables.sql`
5. Paste it into the SQL editor
6. Click "Run" to create all tables and set up RLS policies

#### Option B: Using Supabase Migrations

If your Supabase project has migrations enabled:
1. The file `supabase/migrations/001_create_tables.sql` contains all the migrations
2. Push the migrations to your Supabase project

### Step 2: Verify Tables Were Created

1. Go to the **Tables** section in your Supabase dashboard
2. You should see these tables:
   - `user_stats` - Stores user progression (XP, levels, streaks, achievements)
   - `study_sessions` - Stores individual study sessions
   - `topic_progress` - Stores mastery page topic progress
   - `user_subjects` - Stores subjects user is studying
   - `user_tasks` - Stores tasks
   - All tables should have RLS (Row Level Security) policies enabled

### Step 3: Test the Connection

1. Log in or sign up in your app
2. The app will automatically:
   - Create a default user_stats record
   - Migrate any existing data from localStorage to Supabase
   - Set up real-time syncing

## How It Works

### Data Sync Flow

```
App State (React)
    ↓
useSupabaseUserStats Hook
    ↓
Supabase Cloud Database
    ↓
Real-time Updates Back to App
```

### Key Features

1. **Automatic Migration**: When you first log in, any existing localStorage data is automatically migrated to Supabase
2. **Real-time Sync**: Changes are automatically synced to Supabase with debouncing to avoid too many requests
3. **Cross-Device Access**: Log in from any browser or device to see the same data
4. **Fallback Support**: If Supabase is unavailable, the app will use localStorage as a backup
5. **Security**: Row Level Security (RLS) policies ensure users can only access their own data

### Data Persistence

All of the following data is now synced to the cloud:

- **User Stats**
  - XP and Levels
  - Prestige Level
  - Total Sessions and Study Time
  - Streak Information (current, longest, streak savers)
  - Badges and Achievements
  - Titles and Skins
  - Gems and Currency
  - Quests (Daily and Weekly)

- **Study Sessions**
  - Session duration
  - Subject studied
  - Difficulty level
  - XP earned
  - Mood when studying
  - Timestamps

- **Mastery Data**
  - Topic progress for each subject
  - Blurt test scores
  - Spaced retrieval scores
  - Mock exam scores
  - Study notes
  - Completion percentages
  - Memory deterioration info

- **Subjects & Tasks**
  - Subjects you're studying
  - Goal hours per subject
  - All your tasks
  - Task completion status

## Accessing Data from Different Browsers

1. **Browser 1**: Log in, add a study session
   - The session is saved to Supabase
2. **Browser 2**: Log in with the same account
   - You'll see the same study session automatically loaded
3. **Mobile**: Log in with the same account
   - You'll have access to all your data

## Troubleshooting

### I don't see my old data

The app migrates data from localStorage to Supabase automatically when you first log in after this update. If you don't see your data:

1. Check that you're logged in
2. Check the browser console for any errors
3. Make sure the Supabase tables were created correctly
4. If still having issues, your localStorage data is still available as a backup

### Real-time updates not working

1. Make sure RLS policies are enabled on all tables
2. Check your Supabase project's realtime settings
3. Verify that you're logged in to the correct account

### Data not syncing to Supabase

1. Check your internet connection
2. Check the browser console for errors
3. Verify the Supabase URL and anonymous key are correct
4. Make sure you're logged in

## Database Schema Reference

### user_stats Table
Stores all user progression data. Key columns:
- `user_id` - Reference to authenticated user
- `xp`, `level` - Current XP and level
- `prestige_level` - Prestige rank
- `total_sessions`, `total_study_time` - Aggregate statistics
- `current_streak`, `longest_streak` - Streak information
- `badges`, `achievements`, `unlocked_titles` - JSONB arrays
- `subject_mastery` - JSONB object mapping subjects to study time
- `daily_quests`, `weekly_quests` - Current quests (JSONB arrays)
- `xp_events` - History of XP events (JSONB array)

### study_sessions Table
Individual study session records. Key columns:
- `user_id` - Reference to authenticated user
- `subject_name` - Subject studied
- `duration_minutes` - How long studied
- `difficulty` - Difficulty multiplier
- `xp_earned` - XP earned from session
- `bonuses` - JSONB object with bonus breakdown
- `timestamp` - When the session occurred

### topic_progress Table
Mastery page progress per subject. Key columns:
- `user_id` - Reference to authenticated user
- `subject` - Subject name (unique per user)
- `progress_data` - JSONB object containing all topic progress

### user_subjects Table
Subjects user is studying. Key columns:
- `user_id` - Reference to authenticated user
- `name` - Subject name
- `goal_hours` - Study goal for subject
- `color` - UI color for subject

### user_tasks Table
User's task list. Key columns:
- `user_id` - Reference to authenticated user
- `title`, `description` - Task details
- `done` - Completion status
- `done_at` - When task was completed
- `priority` - Task priority level
- `subject_id` - Associated subject

## Performance Notes

- Updates are debounced to avoid overwhelming the database
- RLS policies ensure security and data isolation
- Real-time subscriptions only track changes for the logged-in user
- Historical data (xp_events, session_history) is kept recent for performance

## Support

For issues with the setup:
1. Check the browser console for error messages
2. Verify all tables exist in your Supabase dashboard
3. Test the Supabase connection in the SQL editor
4. Check that RLS policies are enabled
