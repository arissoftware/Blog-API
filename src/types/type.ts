export interface Payload {
  id: string;
  email: string;
  role: string;
}

export type Role = "USER" | "ADMIN";

export interface User {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DBUsers {
  id: string;
  full_name: string;
  email: string;
  password_hash?: string;
  role: string;
  created_at?: Date;
  updated_at?: Date;
}

export type BlogStatus = "draft" | "published";

export interface DBBlogs {
  id: string;
  user_id: string;
  title: string;
  body: string;
  status: BlogStatus;
  created_at?: string;
  updated_at?: string;
}
