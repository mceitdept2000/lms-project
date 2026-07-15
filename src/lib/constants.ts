export const PERMISSIONS = {
  UPLOAD_FILES: "UPLOAD_FILES",
  MANAGE_USERS: "MANAGE_USERS",
  MANAGE_CATALOG: "MANAGE_CATALOG",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_VALUES = Object.values(PERMISSIONS) as [
  Permission,
  ...Permission[],
];

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const MIME_TO_EXT: Record<AllowedMimeType, string> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/msword": "doc",
};

export const EXT_TO_MIME: Record<string, AllowedMimeType> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
};

export const REGULATIONS = ["AU-21", "AU-25"] as const;
export type Regulation = (typeof REGULATIONS)[number];

export const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;
export type Semester = (typeof SEMESTERS)[number];

export const YEARS = ["1", "2", "3", "4"] as const;
export type Year = (typeof YEARS)[number];

export const UNITS = ["1", "2", "3", "4", "5"] as const;
export type Unit = (typeof UNITS)[number];

export const ALL_UNITS = "-1";

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export const DEFAULT_PAGE_SIZE: PageSize = 20;

export const EXAM_TYPES = ["ENDSEM", "IAT", "ASGT"] as const;
export type ExamType = (typeof EXAM_TYPES)[number];

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  ENDSEM: "End Semester",
  IAT: "IAT",
  ASGT: "Assignment",
};

// Exam code formats, per DESIGN.md ## Normalization
export const EXAM_CODE_PATTERNS: Record<ExamType, RegExp> = {
  ASGT: /^(AM|ND)(\d{4})-A(\d+)$/,
  IAT: /^(AM|ND)(\d{4})-(IAT\d+)$/,
  ENDSEM: /^(AM|ND)(\d{4})$/,
};

export const SESSION_NAMES = {
  AM: "April May",
  ND: "November December",
} as const;

export const FILE_KINDS = ["notes", "question-papers"] as const;
export type FileKind = (typeof FILE_KINDS)[number];
