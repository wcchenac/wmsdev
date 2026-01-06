/**
 * Check if an object is empty (has no own properties)
 *
 * @param obj - The object to check
 * @returns True if object is empty, false otherwise
 *
 * @example
 * isEmpty({}) // true
 * isEmpty({ a: 1 }) // false
 */
export function isEmpty(obj: Record<string, unknown>): boolean {
  for (const prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) return false;
  }

  return true;
}
