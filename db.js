const {Pool } = require('pg');
require ('dotenv').config();

//database connection setup
const pool =new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'krishiequip_db',
    password: process.env.DB_PASSWORD || Root,
    port: process.env.DB_PORT || 5432,
});

pool.connect()
.then(() => console.log('Connected to PostgreSQL Database via pgAdmin!'))
.catch(err => console.error('Database connection error:', err.stack));

export default pool;