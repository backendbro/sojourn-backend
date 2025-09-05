// csrf.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { doubleCsrf } from 'csrf-csrf';

const { generateToken, doubleCsrfProtection, validateRequest } = doubleCsrf({
  getSecret: (req: Request) => req.cookies['csrf-secret'],
  cookieName: 'csrf-secret',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
  size: 64,
});

export const csrfProtection = doubleCsrfProtection;
export const generateCsrfToken = generateToken;
export const validateCsrf = validateRequest;
