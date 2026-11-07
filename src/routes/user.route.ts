import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  getOneUser,
  login,
  profile,
  register,
  updateUser,
} from "../controllers/user.controller.js";
import { protect } from "../auth/admin.auth.js";
import { authenticate } from "../auth/user.auth.js";

export const userRouter = Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/profile", authenticate, profile);

userRouter.patch("/update", authenticate, updateUser);

userRouter.use(authenticate);
userRouter.use(protect("ADMIN"));
userRouter.get("/", getAllUsers);
userRouter.get("/:id", getOneUser);
userRouter.delete("/:id", deleteUser);
