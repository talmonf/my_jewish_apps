-- Edit these values before running this script.
-- The password is hashed in Postgres using pgcrypto's bcrypt-compatible crypt().

CREATE EXTENSION IF NOT EXISTS pgcrypto;

WITH admin_input AS (
  SELECT
    'Admin'::text AS admin_name,
    'admin@my-jewish-learning.com'::text AS admin_email,
    'Chagai#95'::text AS admin_password
),
upsert_apps AS (
  INSERT INTO "apps" ("key", "name", "description", "href", "enabled")
  VALUES
    ('tehillim', 'Tehillim', 'Read, annotate, favorite, and track Tehillim.', '/tehillim', true),
    ('leining', 'Leining', 'Practice leining with teacher recordings and AI assistance.', '/leining', true)
  ON CONFLICT ("key") DO UPDATE
  SET
    "name" = EXCLUDED."name",
    "description" = EXCLUDED."description",
    "href" = EXCLUDED."href",
    "enabled" = EXCLUDED."enabled"
  RETURNING "key"
),
upsert_default_access AS (
  INSERT INTO "default_app_access" ("app_key", "access_level", "enabled")
  VALUES
    ('tehillim', 'viewer', true),
    ('leining', 'viewer', true)
  ON CONFLICT ("app_key") DO UPDATE
  SET
    "access_level" = EXCLUDED."access_level",
    "enabled" = EXCLUDED."enabled"
  RETURNING "app_key"
),
upsert_admin AS (
  INSERT INTO "users" ("name", "email", "password_hash", "role")
  SELECT
    admin_input.admin_name,
    lower(admin_input.admin_email),
    crypt(admin_input.admin_password, gen_salt('bf', 12)),
    'admin'
  FROM admin_input
  ON CONFLICT ("email") DO UPDATE
  SET
    "name" = EXCLUDED."name",
    "password_hash" = EXCLUDED."password_hash",
    "role" = 'admin',
    "updated_at" = now()
  RETURNING "id", "email"
)
INSERT INTO "user_app_access" ("user_id", "app_key", "access_level")
SELECT upsert_admin."id", app_key, 'admin'
FROM upsert_admin
CROSS JOIN (VALUES ('tehillim'), ('leining')) AS app_access(app_key)
ON CONFLICT ("user_id", "app_key") DO UPDATE
SET "access_level" = EXCLUDED."access_level";

SELECT "id", "name", "email", "role", "created_at", "updated_at"
FROM "users"
WHERE "email" = lower('admin@my-jewish-learning.com');
