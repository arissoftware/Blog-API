import type { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "../errors/asyncError.js";
import { ApiError } from "../errors/apiError.js";
import {
  createBlogSchema,
  updateBlogSchema,
} from "../validations/blogs.validation.js";
import { pool } from "../db/db.js";
import { DBBlogs } from "../types/type.js";
import { error } from "node:console";

export const createBlog = asyncErrorHandler(
  async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<Response> => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new ApiError(400, "Please provide an input");
    }

    const result = createBlogSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { title, body } = result.data;

    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Please login to create a post");
    }

    const blog = await pool.query<DBBlogs>(
      `INSERT INTO blogs (user_id, title, body)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, title, body, status, created_at
        `,
      [userId, title, body],
    );

    if (!blog.rows[0]) {
      console.error(error);
      throw new ApiError(500, "Internal server error");
    }

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog.rows[0],
    });
  },
);

export const updateBlog = asyncErrorHandler(
  async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<Response> => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new ApiError(400, "Please provide an input");
    }

    const result = updateBlogSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { title, body, status } = result.data;

    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Please login to create a post");
    }

    const id = req.params.id;
    if (!id) {
      throw new ApiError(
        400,
        "Please provide the ID of the blog you are updating",
      );
    }

    const blog = await pool.query<DBBlogs>(
      `SELECT id, user_id, title, body, status, updated_at
        FROM blogs
        WHERE id = $1 AND user_id = $2
        `,
      [id, userId],
    );

    if (!blog.rows[0]) {
      throw new ApiError(404, "Blog not found");
    }

    const updatedBlog = await pool.query<DBBlogs>(
      `UPDATE blogs
        SET 
        title = COALESCE($1, title),
        body = COALESCE($2, body),
        status = COALESCE($3, status),
        updated_at = NOW()
        WHERE id = $4 AND user_id = $5
        RETURNING id, user_id, title, body, status, updated_at
        `,
      [title, body, status, id, userId],
    );

    if (!updatedBlog.rows[0]) {
      throw new ApiError(500, "Internal server error");
    }

    return res.status(200).json({
      success: true,
      message: "Blog update successfull",
      data: blog.rows[0],
    });
  },
);

export const deleteBlog = asyncErrorHandler(
  async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<Response> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Please login to create a post");
    }

    const id = req.params.id;
    if (!id) {
      throw new ApiError(
        400,
        "Please provide the ID of the blog you are updating",
      );
    }

    const blog = await pool.query<DBBlogs>(
      `SELECT id, user_id, title, body, status, updated_at
        FROM blogs
        WHERE id = $1 AND user_id = $2
        `,
      [id, userId],
    );

    if (!blog.rows[0]) {
      throw new ApiError(404, "Blog not found");
    }

    const deletedBlog = await pool.query<DBBlogs>(
      `DELETE FROM blogs
        WHERE id = $1 AND user_id = $2
        RETURNING id, user_id, title, body, status, created_at, updated_at
        `,
      [blog.rows[0].id, blog.rows[0].user_id],
    );

    if (!deletedBlog.rows[0]) {
      throw new ApiError(500, "Internal server error");
    }

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
      data: deletedBlog.rows[0],
    });
  },
);

export const getAllBlogs = asyncErrorHandler(
  async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<Response> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Please login to create a post");
    }

    const blogs = await pool.query<DBBlogs>(
      `SELECT blogs.id, blogs.user_id, users.full_name, blogs.title, blogs.body, blogs.status, blogs.created_at, blogs.updated_at
        FROM blogs
        RIGHT JOIN users
        ON blogs.user_id = users.id
        WHERE blogs.user_id = $1
        ORDER BY created_at DESC
        `,
      [userId],
    );

    if (blogs.rows.length <= 0) {
      throw new ApiError(404, "You do not have any blog");
    }

    return res.status(200).json({
      success: true,
      message: "Blogs retrieved successfully",
      results: blogs.rowCount,
      data: blogs.rows,
    });
  },
);

export const getOneBlog = asyncErrorHandler(
  async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<Response> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Please login to create a post");
    }

    const id = req.params.id;
    if (!id) {
      throw new ApiError(
        400,
        "Please provide the ID of the blog you are updating",
      );
    }

    const blog = await pool.query<DBBlogs>(
      `SELECT blogs.id, blogs.user_id, users.full_name, blogs.title, blogs.body, blogs.status, blogs.updated_at, blogs.created_at
        FROM blogs
        RIGHT JOIN users
        ON blogs.user_id = users.id
        WHERE blogs.id = $1 AND blogs.user_id = $2
        `,
      [id, userId],
    );

    if (!blog.rows[0]) {
      throw new ApiError(404, "Blog not found");
    }

    return res.status(200).json({
      success: true,
      message: "Blog retrieved successfully",
      data: blog.rows[0],
    });
  },
);
