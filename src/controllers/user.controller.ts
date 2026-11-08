import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors/apiError.js";
import type { User, DBUsers } from "../types/type.js";
import { asyncErrorHandler } from "../errors/asyncError.js";
import {
  registerSchema,
  updateUserSchema,
  userLoginSchema,
} from "../validations/users.validation.js";
import { pool } from "../db/db.js";
import bcrypt from "bcryptjs";
import { genToken } from "../auth/genToken.js";

export const register = asyncErrorHandler(
  async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<Response> => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new ApiError(400, "Please provide a valid input");
    }

    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }
    const { fullName, email, password } = result.data;

    const userExists = await pool.query<User>(
      `SELECT id, email
        FROM users
        WHERE email = $1
        `,
      [email],
    );

    if (userExists.rows[0]) {
      throw new ApiError(409, "Please login to continue");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await pool.query<User>(
      `INSERT INTO users (full_name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, full_name, email, created_at
        `,
      [fullName, email, passwordHash],
    );

    return res.status(201).json({
      success: true,
      message: "User registration successful",
      data: user.rows[0],
    });
  },
);

export const updateUser = asyncErrorHandler(
  async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<Response> => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new ApiError(400, "Please provide a valid input");
    }

    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "You are not authorized");
    }

    const result = updateUserSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { fullName, email } = result.data;

    const user = await pool.query<User>(
      `UPDATE users
        SET
        full_name = COALESCE($1, full_name),
        email = COALESCE($2, email),
        updated_at = NOW()
        WHERE id = $3
        RETURNING id, full_name, email, created_at
        `,
      [fullName, email, userId],
    );

    return res.status(200).json({
      success: true,
      message: "Profile update successful",
      data: user.rows[0],
    });
  },
);

export const login = asyncErrorHandler(
  async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<Response> => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new ApiError(400, "Please provide a valid input");
    }

    const result = userLoginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { email, password } = result.data;

    const loginUser = await pool.query<DBUsers>(
      `SELECT id, full_name, email, password_hash, role, created_at, updated_at
    FROM users
    WHERE email = $1
    `,
      [email],
    );

    const user = loginUser.rows[0];

    if (!user) {
      throw new ApiError(404, "Invalid Email or Password");
    }

    const isMatch = await bcrypt.compare(password, user.password_hash!);
    if (!isMatch) {
      throw new ApiError(401, "Invalid Email or Password");
    }

    const token = genToken(user, res);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
    });
  },
);

export const profile = asyncErrorHandler(
  async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<Response> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Please login to continue");
    }

    const user = await pool.query<DBUsers>(
      `SELECT id, full_name, email, role, created_at, updated_at
        FROM users
        WHERE id = $1
        `,
      [userId],
    );

    if (!user.rows[0]) {
      throw new ApiError(404, "Please login to continue");
    }

    return res.status(200).json({
      success: true,
      message: `Welcome back ${user.rows[0].full_name}`,
      data: user.rows[0],
    });
  },
);

export const deleteUser = asyncErrorHandler(
  async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<Response> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Please login to continue");
    }

    const id = req.params.id;
    if (!id) {
      throw new ApiError(404, "Please provide the ID of the user");
    }

    const user = await pool.query<DBUsers>(
      `SELECT id
        FROM users
        WHERE id = $1
        `,
      [id],
    );

    if (!user.rows[0]) {
      throw new ApiError(404, "User not found");
    }

    const deletedUser = await pool.query<DBUsers>(
      `DELETE FROM users
        WHERE id = $1 AND email = $2
        RETURNING id, full_name, email
        `,
      [id, user.rows[0].email],
    );

    if (!deletedUser.rows[0]) {
      throw new ApiError(500, "Internal server error");
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: deletedUser.rows[0],
    });
  },
);

export const getAllUsers = asyncErrorHandler(
  async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<Response> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Please login to continue");
    }

    const users = await pool.query<DBUsers>(
      `SELECT id, full_name, email, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
        `,
    );

    if (!users.rows) {
      throw new ApiError(404, "No user found");
    }

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      results: users.rowCount,
      data: users.rows,
    });
  },
);

export const getOneUser = asyncErrorHandler(
  async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<Response> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Please login to continue");
    }

    const id = req.params.id;

    if (!id) {
      throw new ApiError(404, "Please provide the ID of the user");
    }

    const user = await pool.query<DBUsers>(
      `SELECT id, full_name, email, created_at, updated_at
        FROM users
        WHERE id = $1
        `,
      [id],
    );

    if (!user.rows[0]) {
      throw new ApiError(404, "User not found");
    }

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user.rows[0],
    });
  },
);

export const logout = asyncErrorHandler(
  async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<Response> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "You are not logged in");
    }

    res.clearCookie("token");
    return res.status(200).json({
      success: true,
      message: "You are logged out",
    });
  },
);
