DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'liturgy_tunes_tunes_created_by_id_users_id_fk'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'liturgy_tunes_tunes_created_by_fk'
  ) THEN
    ALTER TABLE "liturgy_tunes_tunes"
      RENAME CONSTRAINT "liturgy_tunes_tunes_created_by_id_users_id_fk"
      TO "liturgy_tunes_tunes_created_by_fk";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'liturgy_tunes_tune_parts_tune_id_liturgy_tunes_tunes_id_fk'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'liturgy_tunes_tune_parts_tune_fk'
  ) THEN
    ALTER TABLE "liturgy_tunes_tune_parts"
      RENAME CONSTRAINT "liturgy_tunes_tune_parts_tune_id_liturgy_tunes_tunes_id_fk"
      TO "liturgy_tunes_tune_parts_tune_fk";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'liturgy_tunes_tune_parts_part_id_liturgy_tunes_parts_id_fk'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'liturgy_tunes_tune_parts_part_fk'
  ) THEN
    ALTER TABLE "liturgy_tunes_tune_parts"
      RENAME CONSTRAINT "liturgy_tunes_tune_parts_part_id_liturgy_tunes_parts_id_fk"
      TO "liturgy_tunes_tune_parts_part_fk";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'liturgy_tunes_links_tune_id_liturgy_tunes_tunes_id_fk'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'liturgy_tunes_links_tune_fk'
  ) THEN
    ALTER TABLE "liturgy_tunes_links"
      RENAME CONSTRAINT "liturgy_tunes_links_tune_id_liturgy_tunes_tunes_id_fk"
      TO "liturgy_tunes_links_tune_fk";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'liturgy_tunes_search_requests_user_id_users_id_fk'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'liturgy_tunes_search_req_user_fk'
  ) THEN
    ALTER TABLE "liturgy_tunes_search_requests"
      RENAME CONSTRAINT "liturgy_tunes_search_requests_user_id_users_id_fk"
      TO "liturgy_tunes_search_req_user_fk";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'liturgy_tunes_search_requests_part_id_liturgy_tunes_parts_id_fk'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'liturgy_tunes_search_req_part_fk'
  ) THEN
    ALTER TABLE "liturgy_tunes_search_requests"
      RENAME CONSTRAINT "liturgy_tunes_search_requests_part_id_liturgy_tunes_parts_id_fk"
      TO "liturgy_tunes_search_req_part_fk";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'liturgy_tunes_search_results_request_id_liturgy_tunes_search_re'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'liturgy_tunes_search_res_request_fk'
  ) THEN
    ALTER TABLE "liturgy_tunes_search_results"
      RENAME CONSTRAINT "liturgy_tunes_search_results_request_id_liturgy_tunes_search_re"
      TO "liturgy_tunes_search_res_request_fk";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'liturgy_tunes_search_results_request_id_liturgy_tunes_search_requests_id_fk'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'liturgy_tunes_search_res_request_fk'
  ) THEN
    ALTER TABLE "liturgy_tunes_search_results"
      RENAME CONSTRAINT "liturgy_tunes_search_results_request_id_liturgy_tunes_search_requests_id_fk"
      TO "liturgy_tunes_search_res_request_fk";
  END IF;
END $$;
