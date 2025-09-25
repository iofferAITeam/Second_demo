-- Database initialization script for College Recommendation System
-- This script will run automatically when the PostgreSQL container starts

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database if it doesn't exist (this is handled by POSTGRES_DB env var)
-- The database and user are automatically created by the postgres image

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE ioffer_db TO ioffer_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ioffer_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ioffer_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ioffer_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ioffer_user;