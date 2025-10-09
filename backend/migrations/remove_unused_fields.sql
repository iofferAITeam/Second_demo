-- Migration: Remove unused fields from user_profiles table
-- Date: 2025-01-08
-- Description: Clean up database by removing fields not used in frontend

BEGIN;

-- Remove unused personal information fields
ALTER TABLE user_profiles DROP COLUMN IF EXISTS wechat;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "birthDate";

-- Remove unused academic fields
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "graduationDate";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "undergraduateUniversity";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "universityRank";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "universityType";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "highSchoolName";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "graduationYear";

-- Remove unused test score detail fields (replaced by structured data)
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "toeflDetails";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "ieltsDetails";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "greDetails";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "languageTestType";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "languageTestScore";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "languageTestDate";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "standardizedTestType";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "standardizedTestScore";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "standardizedTestDate";

-- Remove unused JSON fields
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "workExperiences";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "internshipExperiences";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "researchProjects";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "extracurricularActivities";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "awards";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "experiences";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "recommendationLetters";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "programmingSkills";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "languageSkills";

-- Remove unused application intention fields (redundant with main fields)
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "targetDegreeType";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "targetMajors";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "targetCountries";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "applicationYear";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "applicationTerm";

-- Remove unused preference fields
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "preferredCityType";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "climatePreference";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "campusSize";

-- Remove unused goal and statement fields
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "goals";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "personalStatement";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "researchInterests";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "budgetRange";

-- Remove ML/AI tag fields (internal use only)
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "gpaTag";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "paperTag";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "toeflTag";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "greTag";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "researchTag";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "collegeTypeTag";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "recommendationTag";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "networkingTag";

-- Remove system/internal fields
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "hasResearchExperience";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "publicationCount";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "totalWorkMonths";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "leadershipScore";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "averageGPA";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "lastSyncAt";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "syncStatus";
ALTER TABLE user_profiles DROP COLUMN IF EXISTS "syncErrors";

COMMIT;
