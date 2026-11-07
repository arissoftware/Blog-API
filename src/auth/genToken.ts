import jwt from "jsonwebtoken";
import { ENV } from "../env.js";
import type { DBUsers, Payload } from "../types/type.js";
import type { Response } from "express";

export const genToken = (user: DBUsers, res: Response): string => {
  const payload: Payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, ENV.JWT_SECRET!, {
    expiresIn: 7 * 24 * 60 * 60,
  });

  res.cookie("token", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
    secure: ENV.NODE_ENV === "production",
  });

  return token;
};
