import { RequestHandler } from "express";

export const asyncErrorHandler = (func: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(func(req, res, next)).catch(next);
  };
};
