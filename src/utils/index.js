// Use Content-Type: application/json
import pkg from 'pg';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.USER_DB,
  host: process.env.HOST_DB,
  database: process.env.DATA_BASE,
  password: process.env.PASS_DB,
  port: process.env.PORT_DB,
});


export { pool };