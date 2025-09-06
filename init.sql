-- SQL script to create the view after migration
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
  ON m.itemid = i.id AND m.locationid = l.id
GROUP BY i.id, i.sku, i.name, l.id, l.name;
