import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  getOneUser,
  login,
  logout,
  profile,
  register,
  updateUser,
} from "../controllers/user.controller.js";
import { protect } from "../auth/admin.auth.js";
import { authenticate } from "../auth/user.auth.js";

export const userRouter = Router();

userRouter.post("/register", register);
userRouter.post("/login", login);

userRouter.use(authenticate);
userRouter.get("/profile", profile);
userRouter.post("/logout", logout);
userRouter.patch("/update", updateUser);
userRouter.use(protect("ADMIN"));
userRouter.get("/", getAllUsers);
userRouter.get("/:id", getOneUser);
userRouter.delete("/:id", deleteUser);
