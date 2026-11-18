export function dayOfStart(dayOfStart: Date): Date {
  const result = new Date(dayOfStart.getTime());
  result.setHours(0, 0, 0, 0);

  return result;
}

export function dayOfEnd(dayOfEnd: Date): Date {
  const result = new Date(dayOfEnd.getTime());
  result.setHours(23, 59, 59, 999);

  return result;
}

export function setPreviousMonth(date: Date, backward: number): Date {
  const result = dayOfStart(date);
  const originalDay = result.getDate();

  // Move to day 1 first so subtracting months from month-end dates clamps instead of overflowing.
  result.setDate(1);
  result.setMonth(result.getMonth() - backward);
  const lastDayOfTargetMonth = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0
  ).getDate();
  result.setDate(Math.min(originalDay, lastDayOfTargetMonth));

  return result;
}
