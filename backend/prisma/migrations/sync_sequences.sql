-- Sync User ID sequence with current data
-- This ensures the sequence is always ahead of the max ID

-- Function to sync User sequence
CREATE OR REPLACE FUNCTION sync_user_sequence()
RETURNS void AS $$
DECLARE
    max_id INTEGER;
BEGIN
    -- Get the current maximum ID from the User table
    SELECT COALESCE(MAX(id), 0) INTO max_id FROM "User";
    
    -- Set the sequence to max_id + 1
    PERFORM setval('"User_id_seq"', max_id + 1, false);
    
    RAISE NOTICE 'User sequence synced to %', max_id + 1;
END;
$$ LANGUAGE plpgsql;

-- Execute the sync function
SELECT sync_user_sequence();

-- Create a function to auto-sync sequence after data modifications
-- This is optional but helpful for data imports/migrations
CREATE OR REPLACE FUNCTION auto_sync_user_sequence()
RETURNS TRIGGER AS $$
BEGIN
    -- Only sync if the ID was explicitly set (not auto-generated)
    IF NEW.id IS NOT NULL THEN
        PERFORM setval('"User_id_seq"', GREATEST(NEW.id + 1, nextval('"User_id_seq"')), false);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: We don't automatically create a trigger because it may impact performance
-- If you need to import data with explicit IDs, create this trigger:
-- CREATE TRIGGER trigger_auto_sync_user_sequence
-- BEFORE INSERT ON "User"
-- FOR EACH ROW
-- EXECUTE FUNCTION auto_sync_user_sequence();
