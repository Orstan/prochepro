-- Update all existing users to have both roles
-- This ensures everyone can switch between client and provider roles

UPDATE users 
SET 
    roles = JSON_ARRAY('client', 'prestataire'),
    active_role = COALESCE(active_role, role, 'client')
WHERE 
    roles IS NULL 
    OR JSON_LENGTH(roles) < 2
    OR NOT JSON_CONTAINS(roles, '"client"')
    OR NOT JSON_CONTAINS(roles, '"prestataire"');

-- Verify the update
SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN JSON_CONTAINS(roles, '"client"') AND JSON_CONTAINS(roles, '"prestataire"') THEN 1 ELSE 0 END) as users_with_both_roles
FROM users;
