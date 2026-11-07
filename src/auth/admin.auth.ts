import type { NextFunction, Request, Response } from "express";
import type { Role, User } from "../types/type.js";
import { ApiError } from "../errors/apiError.js";

export const protect = (role: Role) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.user?.role !== role) {
      throw new ApiError(403, "You are not authorized");
    }

    next();
  };
};
