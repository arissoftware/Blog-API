import { RequestHandler } from "express";

export const notFound: RequestHandler = (req, res, _next) => {
  return res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};
