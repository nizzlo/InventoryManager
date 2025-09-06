-- Create the balance view after migration
-- This script should be run after the initial migration

-- Drop view if exists
DROP VIEW IF EXISTS v_item_location_balances;

-- Create the view
CREATE OR REPLACE VIEW v_item_location_balances AS
SELECT
  i.id AS item_id,
  i.sku,
  i.name,
  l.id AS location_id,
  l.name AS location,
  COALESCE(SUM(
    CASE m.type
      WHEN 'IN'     THEN m.qty
      WHEN 'ADJUST' THEN m.qty
      WHEN 'OUT'    THEN -m.qty
      ELSE 0
    END
  ),0) AS qty_on_hand
FROM item i
CROSS JOIN location l
LEFT JOIN inventorymove m
  ON m."itemId" = i.id AND m."locationId" = l.id
GROUP BY i.id, i.sku, i.name, l.id, l.name
ORDER BY i.sku, l.name;
