import { ChangeEvent } from "react";
import { toast } from "react-toastify";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/**
 * Some browsers and operating systems report a real .xlsx as an empty type or
 * as application/octet-stream. Exact matching on the xlsx MIME rejects those.
 */
const ACCEPTED_XLSX_MIMES = new Set<string>([
  XLSX_MIME,
  "",
  "application/octet-stream",
]);

export function isAcceptedXlsxFile(file: { name: string; type: string }): boolean {
  return (
    file.name.toLowerCase().endsWith(".xlsx") && ACCEPTED_XLSX_MIMES.has(file.type)
  );
}

/**
 * One message per rejected file. Holes are skipped so a sparse list cannot toast
 * `undefined`. An empty selection is not a format error; the caller rejects it.
 */
export function xlsxImportErrorMessages(
  files: ArrayLike<{ name: string; type: string } | undefined> | null | undefined
): string[] {
  if (!files || files.length === 0) {
    return [];
  }

  const messages: string[] = [];
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    if (!file || isAcceptedXlsxFile(file)) {
      continue;
    }
    const message = `${file.type} is not a supported format\n`;
    if (message.trim() !== "") {
      messages.push(message);
    }
  }
  return messages;
}

/**
 * True only when at least one file is selected and every file is an accepted
 * .xlsx. On a format error the input is cleared and each message is toasted.
 */
export function acceptXlsxSelection(event: ChangeEvent<HTMLInputElement>): boolean {
  const files = event.target.files;
  const messages = xlsxImportErrorMessages(files);
  if (messages.length > 0) {
    event.target.value = "";
    messages.forEach((message) => {
      toast.error(message);
    });
    return false;
  }
  return files !== null && files.length > 0;
}
