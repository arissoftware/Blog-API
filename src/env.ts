import "dotenv/config";

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "production",
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES: process.env.JWT_EXPIRES,
};
