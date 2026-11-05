export interface UploadValidationResult {
  valid: boolean;
  error?: string;
}

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
];

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateSafeUpload(file: {
  filename: string;
  mimeType: string;
  sizeBytes: number;
}): UploadValidationResult {
  if (!file.filename || file.filename.trim() === "") {
    return { valid: false, error: "Filename is required" };
  }

  // Block dangerous extensions (PHP, executable, JS, HTML scripts)
  const lowerName = file.filename.toLowerCase();
  const dangerousExtensions = [
    ".php",
    ".php3",
    ".php4",
    ".php5",
    ".phtml",
    ".exe",
    ".sh",
    ".bat",
    ".cmd",
    ".js",
    ".jsp",
    ".py",
    ".cgi",
    ".pl",
    ".phar",
    ".htaccess",
  ];

  if (dangerousExtensions.some((ext) => lowerName.endsWith(ext))) {
    return {
      valid: false,
      error: "Arbitrary executable script uploads are strictly forbidden.",
    };
  }

  // Enforce allowlisted image MIME types
  if (!ALLOWED_MIME_TYPES.includes(file.mimeType.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.mimeType}. Allowed formats are JPEG, PNG, WebP, SVG, and GIF.`,
    };
  }

  // Enforce size limit
  if (file.sizeBytes > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: "File size exceeds the 5MB maximum limit.",
    };
  }

  return { valid: true };
}

export function sanitizeRichTextHTML(raw: string): string {
  if (!raw) return "";
  let clean = raw;
  // Strip <script>...</script>
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  // Strip iframe / object / embed
  clean = clean.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  clean = clean.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
  clean = clean.replace(/<embed\b[^>]*>/gi, "");
  // Strip inline on* attributes (onclick, onload, onerror, etc.)
  clean = clean.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // Strip javascript: URLs
  clean = clean.replace(/javascript:[^"'\s>]*/gi, "");
  return clean;
}

