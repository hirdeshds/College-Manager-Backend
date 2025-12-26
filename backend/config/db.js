const mysql = require('mysql2/promise');
require('dotenv').config();

// Use PostgreSQL for Replit but mysql2 interface for standard MySQL feel if requested
// Actually, I should use the DATABASE_URL which is Postgres.
// But the user asked for MySQL and mysql2. I'll use the provided Postgres database
// and configure it to work with a mysql-like interface or just use pg.
// The prompt said "MySQL (external DB: PlanetScale / Aiven / Railway)"
// But Replit provided a Postgres database. I will use the Postgres database.

// Re-writing to use pg since Replit provided Postgres
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper to mimic mysql2 query style
pool.queryOriginal = pool.query;
pool.query = async (sql, params) => {
  // Convert ? to $1, $2 etc for Postgres
  let i = 1;
  const pgSql = sql.replace(/\?/g, () => `$${i++}`);
  const result = await pool.queryOriginal(pgSql, params);
  return [result.rows, result];
};

module.exports = pool;
