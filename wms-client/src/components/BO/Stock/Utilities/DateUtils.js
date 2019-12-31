export function dayOfStart(dayOfStart) {
  dayOfStart.setHours(0);
  dayOfStart.setMinutes(0);
  dayOfStart.setSeconds(0);

  return dayOfStart;
}

export function dayOfEnd(dayOfEnd) {
  dayOfEnd.setHours(23);
  dayOfEnd.setMinutes(59);
  dayOfEnd.setSeconds(59);

  return dayOfEnd;
}

export function setPreviousMonth(date, backward) {
  dayOfStart(date);

  date.setMonth(date.getMonth() - backward);

  return date;
}
