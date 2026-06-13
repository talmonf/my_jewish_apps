DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'leining_analysis_results_submission_id_leining_student_submissi'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'leining_analysis_submission_fk'
  ) THEN
    ALTER TABLE "leining_analysis_results"
      RENAME CONSTRAINT "leining_analysis_results_submission_id_leining_student_submissi"
      TO "leining_analysis_submission_fk";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'leining_reference_recordings_assignment_id_leining_assignments_'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'leining_ref_assignment_fk'
  ) THEN
    ALTER TABLE "leining_reference_recordings"
      RENAME CONSTRAINT "leining_reference_recordings_assignment_id_leining_assignments_"
      TO "leining_ref_assignment_fk";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'leining_student_submissions_assignment_id_leining_assignments_i'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'leining_submission_assignment_fk'
  ) THEN
    ALTER TABLE "leining_student_submissions"
      RENAME CONSTRAINT "leining_student_submissions_assignment_id_leining_assignments_i"
      TO "leining_submission_assignment_fk";
  END IF;
END $$;
