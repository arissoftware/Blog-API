export class ApiError extends Error {
  public statusCode: number;
  readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);

    this.name = "ApiError";
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}
