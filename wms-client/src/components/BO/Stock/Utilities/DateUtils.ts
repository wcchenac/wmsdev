export function dayOfStart(dayOfStart: Date): Date {
  dayOfStart.setHours(0);
  dayOfStart.setMinutes(0);
  dayOfStart.setSeconds(0);

  return dayOfStart;
}

export function dayOfEnd(dayOfEnd: Date): Date {
  dayOfEnd.setHours(23);
  dayOfEnd.setMinutes(59);
  dayOfEnd.setSeconds(59);

  return dayOfEnd;
}

export function setPreviousMonth(date: Date, backward: number): Date {
  dayOfStart(date);

  date.setMonth(date.getMonth() - backward);

  return date;
}
