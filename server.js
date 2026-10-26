const express = require ('express');
const cors = require ('cors');
const {Pool} = require ('pg');
require ('dotenv').config();
const nodemailer = require ('nodemailer');

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
// nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'professionalrishabh10@gmail.com',
        pass: process.env.EMAIL_PASS || 'sfkpcnturpkandtj'
    }
})
// otp store in temp memory 
const otpDatabase = {};

//send otp email
app.post('api/auth/send-otp',async (req, resp) => {
    const { email } = req.body;

    if(!email) {
        return resp.status(400).json({ success: false, message: "Email is require feild!"});

    }
    // 6 digit otp 
    constrandomOtp = Math.floor(100000 + Math.random() * 900000);
    otpDatabase[email] = randomOtp;
    const mailOption = {
        from: process.env.EMAIL_USER || 'professionalrishabh10@gmail.com',
        to: email,
        subject: 'KrishiEquip - Verification OTP',
        text: `this is automatic generated mail your krishiEquip OTP is ${randomOtp}. this is vailed for 5 minuts after 5 minuts this will expire. `
    };
    try {
        await transporter.sendMail(mailOption);
        resp.json({success: true, message: 'OTP sent successfully to your email.'})
    } catch {
        console.error("OTP email sending error", err);
        resp.status(500).json({success: false, message: 'Server error in sending OTP!.'});
    }
})

//verify otp 
app.post('/api/auth/verify-otp', (req, resp) => {
    const { email, otp } = req.body;
    if(otpDatabase[email] && otpDatabase[email] == otp) {
        delete otpDatabase[email];
        resp.json({ success: true, message: 'OTP successfully verified!.'});
    } else {
        resp.status(400).json({ success:false, message: "Incorect OTP, Please try again!."});
    }
})
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
// User Login API
app.post('/api/login', async (req, res) => {
    try {
        const { emailOrMobile, password } = req.body;

        if (!emailOrMobile || !password) {
            return res.status(400).json({ success: false, message: "Please fill in all fields!" });
        }

        // Find user by email or mobile
        const userQuery = await pool.query(
            "SELECT * FROM users WHERE email = $1 OR mobile = $1",
            [emailOrMobile]
        );

        if (userQuery.rows.length === 0) {
            return res.status(400).json({ success: false, message: "User not found!" });
        }

        const user = userQuery.rows[0];

        // Check password
        if (user.password !== password) {
            return res.status(400).json({ success: false, message: "Invalid password!" });
        }

        res.status(200).json({
            success: true,
            message: "Login Successful",
            user: {
                id: user.id,
                full_name: user.full_name,
                role: user.role,
                email: user.email,
                location: user.location
            }
        });
    } catch (err) {
        console.error("Login Route Error Details:", err.message); // Yeh terminal par exact error batayega
        res.status(500).json({ success: false, message: "Server error during login: " + err.message });
    }
});

//add equipment 
app.post ('/api/equipment', async (req, resp) => {
    try {
        const { provider_id, equipment_name, category, price_per_day, location, description } = req.body;
        const newEquipment = await pool.query (
            `INSERT INTO equipments (provider_id, equipment_name, category, price_per_day, location, description, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'Pwnding')RETURNING *`,
            [provider_id, equipment_name, category, price_per_day, location, description]
        );
        resp.status(201).json({
            success: true,
            message: "Equipment added succesfully and sent for the admin approvel!",
            equipment: newEquipment.rows[0]
        });
    } catch (err) {
        console.error ("Add equipment error:", err.message);
        resp.status(500).json({ success: false, message: "Server Error while adding equipment."});

    }
})

// get all approvel equipment API
app.get('/api/equipment', async(req, resp) => {
    try{
        const equipment = await pool.query(
            "SELECT * FROM equipment WHERE status = 'Approved' ORDER BY created_at DESC"

        );
        resp.status(200).json({
            success: true,
            equipment: equipment.rows
        });
    } catch(err) {
        console.error("Fetch Equipment Error", err.message);
        resp.status(500).json({ success: false, message:"Server error while fetching equipment."});
    }
})

//server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});