import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../errors/apiError.js";
import { ENV } from "../env.js";
import { DBUsers, Payload, User } from "../types/type.js";
import { asyncErrorHandler } from "../errors/asyncError.js";
import { pool } from "../db/db.js";

export const authenticate: RequestHandler = asyncErrorHandler(
  async (req, _res, next): Promise<void> => {
    const token = req.cookies.token;
    if (!token) {
      throw new ApiError(403, "Please login to coninue");
    }

    const verified = jwt.verify(token, ENV.JWT_SECRET!);
    console.log("Verified JWT:", verified);
    console.log("Is string:", typeof verified === "string");
    if (
      typeof verified === "string" ||
      typeof verified.id !== "string" ||
      typeof verified.email !== "string" ||
      typeof verified.role !== "string"
    ) {
      throw new ApiError(403, "Not authorized");
    }

    const decoded: Payload = {
      id: verified.id,
      email: verified.email,
      role: verified.role,
    };

    const user = await pool.query<DBUsers>(
      `SELECT id, email, role
    FROM users
    WHERE id = $1 AND email = $2
    `,
      [decoded.id, decoded.email],
    );

    if (!user.rows[0]) {
      throw new ApiError(403, "You are not authorized");
    }

    req.user = user.rows[0];

    next();
  },
);
