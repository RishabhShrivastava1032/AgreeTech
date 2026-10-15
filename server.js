const express = require ('express');
const cors = require ('cors');
const {Pool} = require ('pg');
require ('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

//db connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.connect()
.then(() => console.log('Connection to postgreSQL database successfully!'))
.catch(err => console.error('Database connection error:',err.stack));

//user registration API
app.post('/api/register', async (req, resp) => {
    try{
        const { role, full_name, location, email, mobile, password} = req.body;

        // checking if email or phone number is alredy exists 
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1 OR mobile =$2",
            [email, mobile]
        );

        //fixed longth typo to length
        if (existingUser.rows.length > 0) {
            return resp.status(400).json({ success: false, message: "Email or Mobile alredy registered!"});

        }

        //Inserting new user
        const newPasswordHash = password;
        const newUser = await pool.query(
            'INSERT INTO users (role, full_name, location, email, mobile, password ) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, role, full_name, email',
            [role, full_name, location, email, mobile, newPasswordHash]

        );

        resp.status(201).json({
            success: true,
            message: "Registration Successful",
            user: newUser.rows[0]
        });
    } catch (err) {
        console.error("Registeration Error:", err.message);
        resp.status(500).json({ success: false, message: "Server error during registration."});

    }
});

//server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});