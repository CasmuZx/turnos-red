import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

// Express 5 expone query mediante un getter. Guardamos los datos validados en res.locals.
export function validate(schema: ZodType, source: 'body' | 'params' | 'query'): RequestHandler {
  return (req, res, next) => {
    try {
      res.locals[source] = schema.parse(req[source]);
      next();
    } catch (error) {
      next(error);
    }
  };
}
