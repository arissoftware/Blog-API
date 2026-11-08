import { Router } from "express";
import {
  createBlog,
  deleteBlog,
  getAllBlogs,
  getOneBlog,
  updateBlog,
} from "../controllers/blog.controller.js";
import { authenticate } from "../auth/user.auth.js";

const blogRouter = Router();

blogRouter.use(authenticate);
blogRouter.post("/", createBlog);
blogRouter.patch("/:id", updateBlog);
blogRouter.delete("/:id", deleteBlog);
blogRouter.get("/", getAllBlogs);
blogRouter.get("/:id", getOneBlog);

export default blogRouter;
