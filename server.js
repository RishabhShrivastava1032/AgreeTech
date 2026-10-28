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
app.post('/api/auth/send-otp',async (req, resp) => {
    const { email } = req.body;

    if(!email) {
        return resp.status(400).json({ success: false, message: "Email is require feild!"});

    }
    // 6 digit otp 
    const randomOtp = Math.floor(100000 + Math.random() * 900000);
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
    } catch (err){
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

//add equipments 
app.post ('/api/equipments', async (req, resp) => {
    try {
        const { provider_id, equipment_name, category, price_per_day, location, description } = req.body;
        const newEquipments = await pool.query (
            `INSERT INTO equipments (provider_id, equipment_name, category, price_per_day, location, description, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'Pending')RETURNING *`,
            [provider_id, equipment_name, category, price_per_day, location, description]
        );
        resp.status(201).json({
            success: true,
            message: "Equipments added succesfully and sent for the admin approvel!",
            equipments: newEquipments.rows[0]
        });
    } catch (err) {
        console.error ("Add equipments error:", err.message);
        resp.status(500).json({ success: false, message: "Server Error while adding equipments."});

    }
})

// Get Provider Specific Equipments API
app.get('/api/provider/equipments/:providerId', async (req, resp) => {
    try {
        const { providerId } = req.params;
        const equipments = await pool.query(
            "SELECT * FROM equipments WHERE provider_id = $1 ORDER BY created_at DESC",
            [providerId]
        );
        resp.status(200).json({ success: true, equipments: equipments.rows });
    } catch (err) {
        console.error("Fetch Provider Equipments Error:", err.message);
        resp.status(500).json({ success: false, message: "Server error while fetching provider equipments." });
    }
});

// Get Provider Specific Equipments API
app.get('/api/provider/equipments/:providerId', async (req, resp) => {
    try {
        const { providerId } = req.params;
        const equipments = await pool.query(
            "SELECT * FROM equipments WHERE provider_id = $1 ORDER BY created_at DESC",
            [providerId]
        );
        resp.status(200).json({ success: true, equipments: equipments.rows });
    } catch (err) {
        console.error("Fetch Provider Equipments Error:", err.message);
        resp.status(500).json({ success: false, message: "Server error while fetching provider equipments." });
    }
});

// get all approvel equipment API
app.get('/api/equipments', async(req, resp) => {
    try{
        const equipments = await pool.query(
            "SELECT * FROM equipments WHERE status = 'Approved' ORDER BY created_at DESC"

        );

        // Get All Bookings API
        app.get('/api/bookings', async (req, resp) => {
            try {
                const bookings = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
                resp.json({ success: true, bookings: bookings.rows });
                } catch (err) {
                    console.error("Fetch Bookings Error:", err.message);
                    resp.status(500).json({ success: false, message: "Server error while fetching bookings." });
                }
            });
        resp.status(200).json({
            success: true,
            equipments: equipments.rows
        });
    } catch(err) {
        console.error("Fetch Equipments Error", err.message);
        resp.status(500).json({ success: false, message:"Server error while fetching equipments."});
    }
})

// 1. Get All Pending Equipments for Admin Panel
app.get('/api/admin/pending-equipments', async (req, resp) => {
    try {
        const query = `
            SELECT e.*, u.full_name as owner_name 
            FROM equipments e 
            JOIN users u ON e.provider_id = u.id 
            WHERE e.status = 'Pending' 
            ORDER BY e.created_at DESC
        `;
        const result = await pool.query(query);
        resp.status(200).json({ success: true, equipments: result.rows });
    } catch (err) {
        console.error("Fetch Pending Equipments Error:", err.message);
        resp.status(500).json({ success: false, message: "Server error while fetching pending equipments." });
    }
});

// 2. Update Equipment Status (Approve / Reject)
app.put('/api/admin/equipment-status/:id', async (req, resp) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Approved' ya 'Rejected'

        const updateQuery = `
            UPDATE equipments 
            SET status = $1 
            WHERE id = $2 
            RETURNING *
        `;
        const result = await pool.query(updateQuery, [status, id]);

        if (result.rows.length === 0) {
            return resp.status(404).json({ success: false, message: "Equipment not found." });
        }

        resp.status(200).json({ 
            success: true, 
            message: `Equipment ${status} successfully!`, 
            equipment: result.rows[0] 
        });
    } catch (err) {
        console.error("Update Status Error:", err.message);
        resp.status(500).json({ success: false, message: "Server error while updating status." });
    }
})

// 1. Get Admin Dashboard Stats (Top 4 Cards)
app.get('/api/admin/stats', async (req, resp) => {
    try {
        const usersCount = await pool.query("SELECT COUNT(*) FROM users");
        const equipCount = await pool.query("SELECT COUNT(*) FROM equipments WHERE status = 'Approved'");
        const rentalsCount = await pool.query("SELECT COUNT(*) FROM bookings WHERE status = 'Confirmed'");
        const revenueQuery = await pool.query("SELECT SUM(total_amount) FROM bookings");

        resp.status(200).json({
            success: true,
            totalUsers: usersCount.rows[0].count,
            activeEquipment: equipCount.rows[0].count,
            activeRentals: rentalsCount.rows[0].count,
            totalRevenue: revenueQuery.rows[0].sum || 0
        });
    } catch (err) {
        console.error("Stats Error:", err.message);
        resp.status(500).json({ success: false, message: "Server error while fetching stats." });
    }
});

// 2. Get All Users for Admin Management
app.get('/api/admin/users', async (req, resp) => {
    try {
        const users = await pool.query("SELECT id, full_name, email, mobile, role, location FROM users ORDER BY id DESC");
        resp.status(200).json({ success: true, users: users.rows });
    } catch (err) {
        console.error("Fetch Users Error:", err.message);
        resp.status(500).json({ success: false, message: "Server error while fetching users." });
    }
});

// 3. Delete User API (With Full Foreign Key Handling)
app.delete('/api/admin/users/:id', async (req, resp) => {
    try {
        const { id } = req.params;
        
        // 1. Delete related bookings first (if user is a farmer)
        await pool.query("DELETE FROM bookings WHERE farmer_id = $1", [id]);
        await pool.query("DELETE FROM equipments WHERE provider_id = $1", [id]);
        const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return resp.status(404).json({ success: false, message: "User not found." });
        }
        resp.status(200).json({ success: true, message: "User and all related records deleted successfully!" });
    } catch (err) {
        console.error("Delete User Error:", err.message);
        resp.status(500).json({ success: false, message: "Server error while deleting user: " + err.message });
    }
});

// Save Rental Booking API
app.post('/api/bookings', async (req, resp) => {
    try {
        console.log("RECEIVED REQ BODY:", req.body);
        const farmerId = req.body.farmer_id || 1;
        const eqName = req.body.equipments_name || req.body.equipment_name; 
        const duration = req.body.duration;
        const totalAmount = req.body.total_amount;

        const newBooking = await pool.query(
            `INSERT INTO bookings (farmer_id, equipment_name, duration, total_amount, status)
             VALUES ($1, $2, $3, $4, 'Confirmed') RETURNING *`,
            [farmerId, eqName, duration, totalAmount]
        );

        resp.status(201).json({
            success: true,
            message: "Booking saved successfully!",
            booking: newBooking.rows[0]
        });
    } catch (err) {
        console.error("Booking Error:", err.message);
        resp.status(500).json({ success: false, message: "Server error while saving booking." });

        // Get All Bookings API
        app.get('/api/bookings', async (req, resp) => {
            try {
                const bookings = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
                resp.json({ success: true, bookings: bookings.rows });
                } catch (err) {
                    console.error("Fetch Bookings Error:", err.message);
                    resp.status(500).json({ success: false, message: "Server error while fetching bookings." });
                }
            });
        }
    });

//server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});