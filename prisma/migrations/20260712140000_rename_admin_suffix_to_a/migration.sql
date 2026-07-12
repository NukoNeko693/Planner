UPDATE "User" AS admin_user
SET "username" = LEFT(admin_user."username", LENGTH(admin_user."username") - 1) || 'A'
WHERE admin_user."role" = 'ADMIN'
  AND RIGHT(admin_user."username", 1) = 'O'
  AND NOT EXISTS (
    SELECT 1
    FROM "User" AS existing_user
    WHERE LOWER(existing_user."username") = LOWER(
      LEFT(admin_user."username", LENGTH(admin_user."username") - 1) || 'A'
    )
  );
