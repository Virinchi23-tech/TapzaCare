import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[API Error]', err);

  if (err instanceof ZodError) {
    const issueMessages = err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ');
    return res.status(400).json({
      success: false,
      error: `Validation Error: ${issueMessages}`,
    });
  }

  if (err.status || err.statusCode) {
    return res.status(err.status || err.statusCode).json({
      success: false,
      error: err.message || 'An error occurred.',
    });
  }

  return res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
}
