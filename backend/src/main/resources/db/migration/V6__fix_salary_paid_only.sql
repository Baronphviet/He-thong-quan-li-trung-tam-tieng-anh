CREATE OR REPLACE VIEW vw_uc_a07_finance_monthly AS
WITH all_months AS (
    SELECT DISTINCT `year`, `month` FROM monthly_fee
    UNION
    SELECT DISTINCT `year`, `month` FROM teacher_salary
)
SELECT
    CONCAT(am.`year`, '-', LPAD(am.`month`, 2, '0')) AS id,
    am.`year`,
    am.`month`,
    COALESCE(SUM(mf.final_amount), 0) AS tuition_expected,
    COALESCE(SUM(pp.paid_amount), 0) AS tuition_collected,
    COALESCE(SUM(mf.final_amount), 0) - COALESCE(SUM(pp.paid_amount), 0) AS tuition_outstanding,
    COALESCE(ts.salary_cost, 0) AS teacher_salary_cost
FROM all_months am
LEFT JOIN monthly_fee mf ON mf.`year` = am.`year` AND mf.`month` = am.`month`
LEFT JOIN (
    SELECT fee_id, SUM(amount) AS paid_amount
    FROM payment
    GROUP BY fee_id
) pp ON pp.fee_id = mf.fee_id
LEFT JOIN (
    SELECT `year`, `month`, SUM(amount) AS salary_cost
    FROM teacher_salary
    WHERE status = 'PAID'
    GROUP BY `year`, `month`
) ts ON ts.`year` = am.`year` AND ts.`month` = am.`month`
GROUP BY am.`year`, am.`month`, ts.salary_cost;
