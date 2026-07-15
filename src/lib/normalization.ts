import {
  EXAM_CODE_PATTERNS,
  SESSION_NAMES,
  type ExamType,
} from "~/lib/constants";

export function titleCase(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function normalizeExamCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function validateExamCode(code: string, type: ExamType): boolean {
  return EXAM_CODE_PATTERNS[type].test(code);
}

/**
 * Expands a normalized exam code to its display name per DESIGN.md ## Normalization.
 * ENDSEM fully expands the session ("April May 2024"); IAT/ASGT keep the
 * session+year prefix verbatim and only expand the exam kind, exactly as spec'd.
 */
export function examNameFromCode(
  code: string,
  type: ExamType,
): string | null {
  const match = EXAM_CODE_PATTERNS[type].exec(code);
  if (!match) return null;

  const session = match[1] as keyof typeof SESSION_NAMES;
  const year = match[2];

  switch (type) {
    case "ENDSEM":
      return `${SESSION_NAMES[session]} ${year}`;
    case "IAT":
      return `${session}${year} ${match[3]}`;
    case "ASGT":
      return `${session}${year} Assignment${match[3]}`;
  }
}
