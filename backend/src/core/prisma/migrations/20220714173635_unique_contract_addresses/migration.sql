-- Since contracts do not have any other tables referencing the IDs, it should be safe to soft-delete duplicate records.
-- Soft-deletes all contracts that have duplicate addresses except for the most recent contract.
UPDATE "Contract"
SET active = false 
WHERE id NOT IN
  (
      SELECT max(id) -- this was arbitrarily chosen, it could also be min
      FROM "Contract"
      WHERE active = true
      GROUP BY "environmentId", "address"
  );

-- Create conditionally unique index
CREATE UNIQUE INDEX Contract_environmentId_address_key ON "Contract"("environmentId", "address") WHERE (active IS true);
