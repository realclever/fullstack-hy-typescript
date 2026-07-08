import { type Request, type Response, type NextFunction } from "express";
import { NewEntrySchema } from "./types.ts";
import { z } from "zod";

export const newDiaryParser = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    NewEntrySchema.parse(req.body);
    next();
  } catch (error: unknown) {
    next(error);
  }
};

export const errorMiddleware = (
  error: unknown,
  req: Request<unknown, unknown, unknown>,
  res: Response,
  next: NextFunction,
) => {
  if (error instanceof z.ZodError) {
    const firstIssue = error.issues[0];
    const field = firstIssue?.path[0];

    if (typeof field === "string") {
      let invalidValue: unknown;

      if (
        typeof req.body === "object" &&
        req.body !== null &&
        field in req.body
      ) {
        invalidValue = (req.body as Record<string, unknown>)[field];
      }

      res.status(400).send({
        error: `Incorrect ${field}: ${String(invalidValue)}`,
      });
      return;
    }

    res.status(400).send({
      error: "Incorrect diary entry",
    });
    return;
  }

  next(error);
};
