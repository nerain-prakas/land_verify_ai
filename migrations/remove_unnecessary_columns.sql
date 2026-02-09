-- Remove Unnecessary House and Land Columns
-- These are either too detailed, duplicate, or not useful for marketplace filtering

-- Remove duplicate/overly detailed house columns
ALTER TABLE land_listings 
DROP COLUMN IF EXISTS house_wall_color,           -- Duplicate with exteriorColor
DROP COLUMN IF EXISTS house_paint_freshness,      -- Too detailed for marketplace
DROP COLUMN IF EXISTS interiorColor,              -- Can't see in video, not useful
DROP COLUMN IF EXISTS designStyle,                -- Duplicate with architecturalStyle
DROP COLUMN IF EXISTS exteriorColor,              -- Array of colors is overkill
DROP COLUMN IF EXISTS livingRooms,                -- Usually just 1, not useful filter
DROP COLUMN IF EXISTS kitchens,                   -- Usually just 1, not useful filter
DROP COLUMN IF EXISTS hasAttic,                   -- Too specific, rarely matters
DROP COLUMN IF EXISTS hasWarehouse,               -- Too specific for land marketplace
DROP COLUMN IF EXISTS hasShed,                    -- Minor detail
DROP COLUMN IF EXISTS otherStructures;            -- Vague array field

-- Remove overly specific land details
ALTER TABLE land_listings
DROP COLUMN IF EXISTS soilColor,                  -- Too detailed, soilQuality is enough
DROP COLUMN IF EXISTS vegetationType,             -- vegetationDensity is sufficient
DROP COLUMN IF EXISTS landWealth;                 -- Vague metric

-- Clean up comments
COMMENT ON TABLE land_listings IS 'Land and property listings with AI verification and essential attributes only';
