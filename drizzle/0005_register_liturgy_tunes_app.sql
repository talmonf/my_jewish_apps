INSERT INTO "apps" ("key", "name", "description", "href", "enabled")
VALUES (
  'liturgy-tunes',
  'Liturgy Tunes',
  'Browse liturgy tunes and search the web to find a melody from words and a recording.',
  '/liturgy-tunes',
  true
)
ON CONFLICT ("key") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "href" = EXCLUDED."href",
  "enabled" = EXCLUDED."enabled";

INSERT INTO "default_app_access" ("app_key", "access_level", "enabled")
VALUES ('liturgy-tunes', 'viewer', true)
ON CONFLICT ("app_key") DO UPDATE
SET
  "access_level" = EXCLUDED."access_level",
  "enabled" = EXCLUDED."enabled";
