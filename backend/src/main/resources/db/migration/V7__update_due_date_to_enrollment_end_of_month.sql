UPDATE monthly_fee mf
JOIN enrollment e ON mf.enrollment_id = e.enrollment_id
SET mf.due_date = LAST_DAY(e.enroll_date);
