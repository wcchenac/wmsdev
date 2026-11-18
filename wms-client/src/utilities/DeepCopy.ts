function recursiveCopy<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }
  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => recursiveCopy(item)) as T;
  }

  const copied: Record<string, unknown> = {};
  for (const key of Object.keys(value)) {
    copied[key] = recursiveCopy((value as Record<string, unknown>)[key]);
  }
  return copied as T;
}

/**
 * Deep copy a value.
 * Preserves primitives, Date, RegExp, arrays, and plain own-property objects without
 * walking inherited prototypes or mutating the original structure.
 */
export function copy<T>(aObject: T): T {
  if (aObject === null || typeof aObject !== "object") {
    return aObject;
  }

  if (typeof structuredClone === "function") {
    try {
      return structuredClone(aObject);
    } catch {
      // Fallback for values containing functions or other non-structured-cloneable fields.
    }
  }

  return recursiveCopy(aObject);
}
