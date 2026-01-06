/**
 * Deep copy an object or array
 * Creates a new object with all nested properties copied (not referenced)
 *
 * @param aObject - The object or array to copy
 * @returns A deep copy of the input
 *
 * @example
 * const original = { a: 1, b: { c: 2 } };
 * const copied = copy(original);
 * copied.b.c = 3; // original.b.c remains 2
 */
export function copy<T>(aObject: T): T {
  if (!aObject) {
    return aObject;
  }

  let v: unknown;
  const bObject: Record<string, unknown> | unknown[] = Array.isArray(aObject) ? [] : {};

  for (const k in aObject) {
    v = aObject[k as keyof T];
    (bObject as Record<string, unknown>)[k] = typeof v === "object" ? copy(v) : v;
  }

  return bObject as T;
}
