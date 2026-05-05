-- ==========================================
-- KODERUANG - FIX REPUTATION GLITCH
-- ==========================================

-- 1. Drop existing triggers to avoid duplication
DROP TRIGGER IF EXISTS on_vote_created_rep ON votes;
DROP TRIGGER IF EXISTS on_vote_deleted_rep ON votes;
DROP TRIGGER IF EXISTS on_vote_change_rep ON votes;

-- 2. Enhanced function to handle both additions and subtractions
CREATE OR REPLACE FUNCTION public.handle_vote_reputation()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        SELECT user_id INTO target_user_id FROM resources WHERE id = NEW.resource_id;
        IF target_user_id IS NOT NULL AND NEW.vote_type = 1 THEN
            UPDATE profiles SET reputation = reputation + 5 WHERE id = target_user_id;
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        SELECT user_id INTO target_user_id FROM resources WHERE id = OLD.resource_id;
        IF target_user_id IS NOT NULL AND OLD.vote_type = 1 THEN
            -- Subtract points when upvote is removed, but don't go below 0
            UPDATE profiles SET reputation = GREATEST(0, reputation - 5) WHERE id = target_user_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach trigger for both INSERT and DELETE
CREATE TRIGGER on_vote_change_rep 
AFTER INSERT OR DELETE ON votes 
FOR EACH ROW EXECUTE PROCEDURE handle_vote_reputation();

-- 4. Also fix Resource/Comment deletion to subtract points
DROP TRIGGER IF EXISTS on_resource_created_rep ON resources;
CREATE OR REPLACE FUNCTION public.handle_resource_reputation()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE profiles SET reputation = reputation + 10 WHERE id = NEW.user_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE profiles SET reputation = GREATEST(0, reputation - 10) WHERE id = OLD.user_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_resource_change_rep 
AFTER INSERT OR DELETE ON resources 
FOR EACH ROW EXECUTE PROCEDURE handle_resource_reputation();

DROP TRIGGER IF EXISTS on_comment_created_rep ON comments;
CREATE OR REPLACE FUNCTION public.handle_comment_reputation()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE profiles SET reputation = reputation + 2 WHERE id = NEW.user_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE profiles SET reputation = GREATEST(0, reputation - 2) WHERE id = OLD.user_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_change_rep 
AFTER INSERT OR DELETE ON comments 
FOR EACH ROW EXECUTE PROCEDURE handle_comment_reputation();
