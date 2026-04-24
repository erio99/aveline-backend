const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const initDB = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    const queries = schema
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    for (const query of queries) {
      try {
        await connection.query(query);
      } catch (err) {
        console.log('⚠️', err.message);
      }
    }

    console.log('✅ DB initialized');
    await connection.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

initDB();