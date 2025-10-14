// src/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME, // scripts_db (base principal)
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z', // para evitar desfases de hora
  multipleStatements: false, // más seguro
});

// 🔍 Log de verificación de conexión
db.query('SELECT 1')
  .then(() => console.log('✅ Conexión establecida con MySQL'))
  .catch(err => console.error('❌ Error conectando a MySQL:', err.message));
