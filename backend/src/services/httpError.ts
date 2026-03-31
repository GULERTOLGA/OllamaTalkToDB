export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }
}

export function toHttpError(err: unknown, fallbackStatus = 500, fallbackMessage = 'Bilinmeyen hata'): HttpError {
  if (err instanceof HttpError) return err;
  if (err instanceof Error) return new HttpError(fallbackStatus, err.message);
  return new HttpError(fallbackStatus, fallbackMessage);
}
