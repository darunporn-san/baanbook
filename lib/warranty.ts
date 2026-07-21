export function getWarrantyDaysLeft(endDate: string, now = new Date()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Math.ceil(
    (new Date(`${endDate}T00:00:00`).getTime() - today.getTime()) /
      86_400_000,
  );
}
