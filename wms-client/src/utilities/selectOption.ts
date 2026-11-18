import type { SelectOption } from "../types";

/**
 * Runtime type guard for `{ value: string, label: string }` options returned by
 * category list endpoints.
 */
export const isSelectOption = (value: unknown): value is SelectOption =>
  typeof value === "object" &&
  value !== null &&
  "value" in value &&
  typeof value.value === "string" &&
  "label" in value &&
  typeof value.label === "string";
