-- ==========================================
-- KODERUANG - UPDATED SCHEMA (ROLES & RANKING)
-- ==========================================

-- 1. Create Enums for Roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Update Profiles Table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reputation INTEGER DEFAULT 0;

-- 3. Update Resources Table for Moderation
ALTER TABLE resources ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 4. Ranking / Reputation Function
CREATE OR REPLACE FUNCTION public.update_user_reputation()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
BEGIN
    IF (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'resources') THEN
        UPDATE profiles SET reputation = reputation + 10 WHERE id = NEW.user_id;
    ELSIF (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'comments') THEN
        UPDATE profiles SET reputation = reputation + 2 WHERE id = NEW.user_id;
    ELSIF (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'votes' AND NEW.resource_id IS NOT NULL AND NEW.vote_type = 1) THEN
        SELECT user_id INTO target_user_id FROM resources WHERE id = NEW.resource_id;
        IF target_user_id IS NOT NULL THEN
            UPDATE profiles SET reputation = reputation + 5 WHERE id = target_user_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
DROP TRIGGER IF EXISTS on_resource_created_rep ON resources;
CREATE TRIGGER on_resource_created_rep AFTER INSERT ON resources FOR EACH ROW EXECUTE PROCEDURE update_user_reputation();

DROP TRIGGER IF EXISTS on_comment_created_rep ON comments;
CREATE TRIGGER on_comment_created_rep AFTER INSERT ON comments FOR EACH ROW EXECUTE PROCEDURE update_user_reputation();

DROP TRIGGER IF EXISTS on_vote_created_rep ON votes;
CREATE TRIGGER on_vote_created_rep AFTER INSERT ON votes FOR EACH ROW EXECUTE PROCEDURE update_user_reputation();

-- 5. Updated RLS Policies
DROP POLICY IF EXISTS "Moderators/Admins can delete any resource" ON resources;
CREATE POLICY "Moderators/Admins can delete any resource" ON resources FOR DELETE 
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('moderator', 'admin')
);

DROP POLICY IF EXISTS "Moderators/Admins can delete any comment" ON comments;
CREATE POLICY "Moderators/Admins can delete any comment" ON comments FOR DELETE 
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('moderator', 'admin')
);

-- 6. Helper View for Tiers (Curator Theme)
CREATE OR REPLACE VIEW profile_tiers AS
SELECT 
    id,
    username,
    reputation,
    CASE 
        WHEN reputation >= 10001 THEN 'The Grand Indexer'
        WHEN reputation >= 6001 THEN 'Ecosystem Builder'
        WHEN reputation >= 3501 THEN 'Community Sage'
        WHEN reputation >= 2001 THEN 'Stack Architect'
        WHEN reputation >= 1201 THEN 'Reference Master'
        WHEN reputation >= 701 THEN 'Knowledge Navigator'
        WHEN reputation >= 351 THEN 'Tech Curator'
        WHEN reputation >= 151 THEN 'Resource Finder'
        WHEN reputation >= 51 THEN 'Link Scout'
        ELSE 'Hello World'
    END as tier_name,
    CASE 
        WHEN reputation >= 10001 THEN 10
        WHEN reputation >= 6001 THEN 9
        WHEN reputation >= 3501 THEN 8
        WHEN reputation >= 2001 THEN 7
        WHEN reputation >= 1201 THEN 6
        WHEN reputation >= 701 THEN 5
        WHEN reputation >= 351 THEN 4
        WHEN reputation >= 151 THEN 3
        WHEN reputation >= 51 THEN 2
        ELSE 1
    END as tier_level
FROM profiles;
