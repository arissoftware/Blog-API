import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { notFound } from "./errors/notFound.js";
import { errorHandler } from "./errors/errorHandler.js";
import { userRouter } from "./routes/user.route.js";
import blogRouter from "./routes/blog.route.js";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/blogs", blogRouter);

app.use(notFound);
app.use(errorHandler);
