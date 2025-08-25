-- Keep geom in sync with latitude/longitude updates
CREATE OR REPLACE FUNCTION game_geom_sync()
RETURNS trigger AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    ELSE
        NEW.geom := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_game_geom_sync ON game;
CREATE TRIGGER trg_game_geom_sync
BEFORE INSERT OR UPDATE OF latitude, longitude ON game
FOR EACH ROW EXECUTE FUNCTION game_geom_sync();
