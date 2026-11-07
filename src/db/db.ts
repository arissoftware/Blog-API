import { Pool } from "pg";
import { ENV } from "../env.js";

export const pool = new Pool({
  connectionString: ENV.DATABASE_URL,
});
