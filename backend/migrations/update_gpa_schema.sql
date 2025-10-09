-- Migration: Update GPA schema to use simple fields instead of complex JSON
-- Date: 2025-01-08
-- Description: Remove majorSubjects and majorSubjectsData, rename lastTwoYearsGpa to majorGpa

BEGIN;

-- Step 1: Add new majorGpa column
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS majorGpa double precision;

-- Step 2: Copy data from lastTwoYearsGpa to majorGpa (if any exists)
UPDATE user_profiles SET majorGpa = lastTwoYearsGpa WHERE lastTwoYearsGpa IS NOT NULL;

-- Step 3: Drop the old columns
ALTER TABLE user_profiles DROP COLUMN IF EXISTS majorSubjects;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS majorSubjectsData;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS lastTwoYearsGpa;

COMMIT;
