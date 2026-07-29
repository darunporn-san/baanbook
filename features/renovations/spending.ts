export function getRenovationActualAmount(
  expenses: ReadonlyArray<{
    renovation_project_id: string | null;
    amount_minor: number;
  }>,
  projectId?: string,
) {
  return expenses.reduce(
    (sum, expense) =>
      expense.renovation_project_id &&
      (!projectId || expense.renovation_project_id === projectId)
        ? sum + expense.amount_minor
        : sum,
    0,
  );
}
