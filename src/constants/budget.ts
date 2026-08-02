/**
 * Default per-category savings timespans (in months), shared between
 * BudgetPanel (where the user can adjust them) and the budget export sheet
 * (which needs the same defaults when no live values are passed through).
 */
export interface BudgetMonths {
  accommodation: number;
  activities: number;
  transport: number;
  buffer: number;
}

export const DEFAULT_BUDGET_MONTHS: BudgetMonths = {
  accommodation: 5,
  activities: 5,
  transport: 6,
  buffer: 6,
};
