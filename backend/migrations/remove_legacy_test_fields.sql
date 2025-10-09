-- Remove legacy test score fields
-- These are now replaced by languageTestsData and standardizedTestsData JSON arrays

-- Remove individual test score fields
ALTER TABLE user_profiles DROP COLUMN IF EXISTS toefl;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS ielts;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS gre;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS gmat;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "satScore";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "actScore";

-- Remove detailed test score JSON fields
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "toeflDetails";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "ieltsDetails";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "greDetails";

