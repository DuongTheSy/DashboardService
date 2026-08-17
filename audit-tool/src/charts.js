// Định nghĩa 33 chart, trích trực tiếp từ dashboard_export_20260814T091558/charts/*.yaml
// dim: cột dùng để GROUP BY / trục X (null = big number, 1 dòng duy nhất)
// dimKind: "x_axis" (biểu đồ theo thời gian/đơn vị) | "groupby" (biểu đồ pie)
// extraWhere: điều kiện cứng có sẵn trong chart gốc, ngoài 3 filter Đơn vị/Năm/Tháng
module.exports = [
  // ---- Tab: Tổng hợp ----
  { id: 641, tab: "Tổng hợp", name: "Tổng số lượng lao động", viz: "big_number_total", table: "dbv_count_employee", metric: "COUNT(EMPLOYEE_ID)", dim: null },
  { id: 642, tab: "Tổng hợp", name: "Tổng số lượng FTE", viz: "big_number_total", table: "dbv_fte", metric: "SUM(EMPLOYEE_COUNT)", dim: null },
  { id: 668, tab: "Tổng hợp", name: "Tỷ lệ lao động quản lý", viz: "big_number_total", table: "DBV_HU_MANAGER_SPAN_OF_CONTROL", metric: "AVG(AVG_SPAN_OF_CONTROL)", dim: null },
  { id: 648, tab: "Tổng hợp", name: "Trình độ học vấn", viz: "pie", table: "DBV_HU_EMPLOYEE_LEARNING_LEVEL_STATISTICS", metric: "SUM(EMPLOYEE_COUNT)", dim: "LEARNING_LEVEL_NAME", dimKind: "groupby" },
  { id: 649, tab: "Tổng hợp", name: "Độ tuổi", viz: "pie", table: "DBV_HU_EMPLOYEE_AGE_STATISTICS", metric: "SUM(EMPLOYEE_COUNT)", dim: "AGE_GROUP_NAME", dimKind: "groupby" },
  { id: 650, tab: "Tổng hợp", name: "Thâm niên công tác", viz: "pie", table: "DBV_HU_EMPLOYEE_SENIORITY_STATISTICS", metric: "SUM(EMPLOYEE_COUNT)", dim: "SENIORITY_GROUP_NAME", dimKind: "groupby" },
  { id: 646, tab: "Tổng hợp", name: "Doanh thu", viz: "echarts_timeseries_bar", table: "DBV_PA_FINANCIAL_REVENUE_EMPLOYEE", metric: "SUM(REVENUE_PER_EMPLOYEE_TOTAL)", dim: "ORG_NAME4", dimKind: "x_axis" },
  { id: 645, tab: "Tổng hợp", name: "Lợi nhuận trước thuế", viz: "echarts_timeseries_bar", table: "dbv_pa_financial_profit_employee", metric: "SUM(PROFIT_PER_EMPLOYEE_TOTAL)", dim: "ORG_NAME4", dimKind: "x_axis" },
  { id: 643, tab: "Tổng hợp", name: "Tổng thu nhập", viz: "echarts_timeseries_bar", table: "DBV_PA_PAYROLL_TOTAL_INCOME", metric: "SUM(TOTAL_INCOME_AMOUNT)", dim: "ORG_NAME4", dimKind: "x_axis" },
  { id: 647, tab: "Tổng hợp", name: "Lương trung bình", viz: "echarts_timeseries_bar", table: "DBV_HU_WAGE_AVERAGE_EMPLOYEE", metric: "SUM(AVERAGE_SALARY)", dim: "ORG_NAME4", dimKind: "x_axis" },
  { id: 644, tab: "Tổng hợp", name: "Chi phí nhân công", viz: "echarts_timeseries_bar", table: "DBV_HR_LABOR_COST", metric: "SUM(CHI_PHI_NHAN_CONG)", dim: "ORG_NAME4", dimKind: "x_axis" },
  { id: 667, tab: "Tổng hợp", name: "Tỉ lệ nghỉ việc", viz: "echarts_timeseries_line", table: "DBV_HU_EMPLOYEE_TERMINATION_RATE", metric: "SUM(TERMINATION_RATE_PCT)", dim: "REPORT_DATE", dimKind: "x_axis" },

  // ---- Tab: Lực lượng lao động ----
  { id: 651, tab: "Lực lượng lao động", name: "Tổng số lượng nhân sự", viz: "echarts_timeseries_bar", table: "DBV_HU_EMPLOYEE_HEADCOUNT", metric: "SUM(EMPLOYEE_COUNT_TOTAL)", dim: "ORG_NAME4", dimKind: "x_axis" },
  { id: 652, tab: "Lực lượng lao động", name: "Tổng số lượng FTE", viz: "echarts_timeseries_bar", table: "DBV_HU_EMPLOYEE_FTE", metric: "SUM(FTE_COUNT_TOTAL)", dim: "ORG_NAME4", dimKind: "x_axis" },
  { id: 653, tab: "Lực lượng lao động", name: "Số lượng nhân sự tuyển mới", viz: "echarts_timeseries_line", table: "DBV_HU_EMPLOYEE_NEW_HIRE", metric: "SUM(EMPLOYEE_COUNT_NEW_HIRE)", dim: "REPORT_DATE", dimKind: "x_axis" },
  { id: 654, tab: "Lực lượng lao động", name: "Số lượng nhân sự nghỉ việc", viz: "echarts_timeseries_bar", table: "DBV_HU_EMPLOYEE_TERMINATION", metric: "SUM(EMPLOYEE_COUNT_TERMINATION)", dim: "ORG_NAME4", dimKind: "x_axis" },
  { id: 655, tab: "Lực lượng lao động", name: "Tỉ lệ nghỉ việc", viz: "echarts_timeseries_line", table: "DBV_HU_EMPLOYEE_TERMINATION_RATE", metric: "SUM(TERMINATION_RATE_PCT)", dim: "REPORT_DATE", dimKind: "x_axis" },
  { id: 656, tab: "Lực lượng lao động", name: "Tỷ lệ đội ngũ kỹ sư, kỹ thuật", viz: "pie", table: "DBV_HU_EMPLOYEE_ENGINEER_TECH_RATE", metric: "SUM(EMPLOYEE_COUNT)", dim: "EMPLOYEE_GROUP", dimKind: "groupby" },
  { id: 671, tab: "Lực lượng lao động", name: "Thâm niên trung bình", viz: "big_number_total", table: "DBV_HU_EMPLOYEE_AVERAGE_SENIORITY", metric: "MAX(AVG_SENIORITY_YEARS)", dim: null },
  { id: 657, tab: "Lực lượng lao động", name: "Độ tuổi trung bình", viz: "big_number_total", table: "DBV_HU_EMPLOYEE_AVERAGE_AGE", metric: "AVG(AVG_AGE)", dim: null },
  { id: 672, tab: "Lực lượng lao động", name: "Phạm vi quản lý", viz: "big_number_total", table: "DBV_HU_MANAGER_SPAN_OF_CONTROL", metric: "AVG(AVG_SPAN_OF_CONTROL)", dim: null },
  { id: 673, tab: "Lực lượng lao động", name: "Tỷ lệ nhân sự được điều động, luân chuyển nội bộ", viz: "echarts_timeseries_line", table: "DBV_HU_EMPLOYEE_INTERNAL_TRANSFER_RATE", metric: "SUM(EMPLOYEE_COUNT_CHANGED)*100/SUM(EMPLOYEE_COUNT_TOTAL)", dim: "REPORT_DATE", dimKind: "x_axis", extraWhere: "REPORT_DATE > DATE'2016-01-01'" },
  { id: 674, tab: "Lực lượng lao động", name: "Tỷ lệ được bổ nhiệm, giao nhiệm vụ", viz: "echarts_timeseries_line", table: "DBV_HU_EMPLOYEE_APPOINTMENT_RATE", metric: "SUM(MANAGEMENT_POSITION_COUNT_FILLED)*100/SUM(EMPLOYEE_COUNT_APPOINTED)", dim: "REPORT_DATE", dimKind: "x_axis", extraWhere: "REPORT_DATE > DATE'2016-01-01'" },

  // ---- Tab: Lương & chi phí nhân sự ----
  { id: 658, tab: "Lương & chi phí nhân sự", name: "Tỉ lệ quỹ lương / doanh thu", viz: "big_number_total", table: "DBV_PA_FINANCIAL_SALARY_FUND_REVENUE", metric: "SUM(SALARY_FUND)*100/SUM(REVENUE_AMOUNT)", dim: null },
  { id: 669, tab: "Lương & chi phí nhân sự", name: "Chi phí làm thêm giờ", viz: "big_number_total", table: "DBV_AT_OT_COST", metric: "SUM(OT_COST_TOTAL)", dim: null },
  { id: 666, tab: "Lương & chi phí nhân sự", name: "Chi phí nhân công", viz: "echarts_timeseries_bar", table: "DBV_HR_LABOR_COST", metric: "SUM(CHI_PHI_NHAN_CONG)", dim: "ORG_NAME4", dimKind: "x_axis" },
  { id: 670, tab: "Lương & chi phí nhân sự", name: "Mức tăng lương", viz: "echarts_timeseries_line", table: "DBV_HU_EMPLOYEE_SALARY_INCREASE_RATE", metric: "AVG(AVG_SALARY_INCREASE_PCT)", dim: "REPORT_DATE", dimKind: "x_axis" },
  { id: 665, tab: "Lương & chi phí nhân sự", name: "Tổng thu nhập", viz: "echarts_timeseries_bar", table: "DBV_PA_PAYROLL_TOTAL_INCOME", metric: "SUM(TOTAL_INCOME_AMOUNT)", dim: "ORG_NAME4", dimKind: "x_axis" },

  // ---- Tab: Chấm công và thời gian làm việc ----
  { id: 659, tab: "Chấm công và thời gian làm việc", name: "Tỷ lệ vắng mặt", viz: "echarts_timeseries_line", table: "DBV_AT_ABSENCE_RATE", metric: "ROUND(SUM(ABSENCE_TOTAL) * 100.0 / NULLIF(SUM(TOTAL_WORKING_XJ_TOTAL), 0), 2)", dim: "REPORT_DATE", dimKind: "x_axis" },
  { id: 660, tab: "Chấm công và thời gian làm việc", name: "Tỉ lệ làm thêm giờ", viz: "echarts_timeseries_line", table: "DBV_AT_OT_RATE", metric: "ROUND(SUM(OT_HOURS_CONVERTED) / 24 * 100 / NULLIF(SUM(TOTAL_WORKING_XJ), 0), 2)", dim: "REPORT_DATE", dimKind: "x_axis" },
  { id: 661, tab: "Chấm công và thời gian làm việc", name: "Tỷ lệ sử dụng nhân lực", viz: "echarts_timeseries_line", table: "DBV_AT_UTILIZATION_RATE", metric: "ROUND(SUM(WORKING_ACTUAL_HOURS) * 100 / NULLIF(SUM(WORKING_STANDARD_HOURS), 0), 2)", dim: "REPORT_DATE", dimKind: "x_axis" },
  { id: 662, tab: "Chấm công và thời gian làm việc", name: "Tỷ lệ sử dụng ngày nghỉ", viz: "big_number_total", table: "DBV_AT_LEAVE_UTILIZATION_RATE", metric: "ROUND(SUM(USED_LEAVE_DAYS) * 100 / NULLIF(SUM(TOTAL_LEAVE_DAYS), 0), 2)", dim: null },
  { id: 663, tab: "Chấm công và thời gian làm việc", name: "Tổng công làm việc hưởng lương", viz: "echarts_timeseries_bar", table: "DBV_AT_TOTAL_WORKING_SALARY", metric: "SUM(TOTAL_WORKING_SALARY)", dim: "ORG_NAME4", dimKind: "x_axis" },
  { id: 664, tab: "Chấm công và thời gian làm việc", name: "Số lượng ngày nghỉ do vấn đề sức khỏe, ATLĐ", viz: "echarts_timeseries_bar", table: "DBV_AT_HEALTH_SAFETY_LEAVE", metric: "SUM(TOTAL_HEALTH_SAFETY_LEAVE_DAYS)", dim: "ORG_NAME4", dimKind: "x_axis" },
];
