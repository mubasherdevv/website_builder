export class DatabaseError extends Error {
  public code?: string;
  public details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "DatabaseError";
    this.code = code;
    this.details = details;
  }
}

export class NotFoundError extends DatabaseError {
  constructor(entity: string, identifier: string) {
    super(`${entity} with identifier "${identifier}" was not found.`, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends DatabaseError {
  constructor(message = "Unauthorized access to database resource.") {
    super(message, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ValidationError extends DatabaseError {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

export function handleDatabaseError(error: unknown, fallbackMessage = "Database operation failed"): never {
  if (error instanceof DatabaseError) {
    throw error;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const err = error as { message: string; code?: string; details?: unknown };
    throw new DatabaseError(err.message || fallbackMessage, err.code, err.details);
  }

  throw new DatabaseError(fallbackMessage, "UNKNOWN_ERROR", error);
}

