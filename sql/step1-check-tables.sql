-- STEP 1: CHECK WHAT TABLES EXIST
-- Run this first to see what tables are currently in your database

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
