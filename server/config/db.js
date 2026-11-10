import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kethaki_emporium',
  ssl: process.env.DB_PORT ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
});

pool.getConnection()
  .then((conn) => {
    console.log(`✅ Connected to MySQL Database: ${process.env.DB_NAME || 'kethaki_emporium'}`);
    conn.release();
  })
  .catch((err) => {
    console.error('❌ MySQL Connection Error:', err.message);
  });

export default pool;