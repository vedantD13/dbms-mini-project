const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'cinesync_db'
});

db.connect((err) => {
    if (err) { console.error('❌ Database connection failed:', err.message); return; }
    console.log('✅ Connected to MySQL Database successfully!');

    // ── Auto-create all tables if they don't exist (from docs.txt schema) ──
    const tables = [
        // Users
        `CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('User','Admin') DEFAULT 'User',
            status ENUM('Active','Banned','Blacklisted') DEFAULT 'Active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        // Movies
        `CREATE TABLE IF NOT EXISTS movies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            poster_url TEXT,
            trailer_url TEXT,
            category VARCHAR(100),
            genre VARCHAR(100),
            format VARCHAR(50)
        )`,
        // Cinemas
        `CREATE TABLE IF NOT EXISTS cinemas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            location VARCHAR(255),
            address TEXT,
            lat DECIMAL(10,8),
            lng DECIMAL(11,8),
            premium_format VARCHAR(50),
            seat_layout JSON
        )`,
        // Bookings — the join table that stores purchased tickets
        `CREATE TABLE IF NOT EXISTS bookings (
            id VARCHAR(50) PRIMARY KEY,
            user_id INT,
            movie_id INT,
            cinema_id INT,
            show_date DATE,
            show_time VARCHAR(50),
            seats_booked JSON,
            total_amount DECIMAL(10,2),
            booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
            FOREIGN KEY (cinema_id) REFERENCES cinemas(id) ON DELETE CASCADE
        )`
    ];

    tables.forEach(sql => {
        db.query(sql, err => {
            if (err) console.error('❌ Table creation error:', err.message);
        });
    });

    // ── Migrations: add new columns to existing tables if they don't exist ──
    // MySQL 8.0+ supports ADD COLUMN IF NOT EXISTS
    const migrations = [
        // Add booked_at column if missing (old tables)
        `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
        // Fix existing rows where show_date was NULL due to bookingData.showDate typo
        `UPDATE bookings SET show_date = CURDATE() WHERE show_date IS NULL`
    ];
    migrations.forEach(sql => {
        db.query(sql, (err, result) => {
            if (err) console.warn('Migration note:', err.message);
            else if (result && result.affectedRows > 0) console.log(`🔧 Migration fixed ${result.affectedRows} row(s): ${sql.substring(0, 40)}...`);
        });
    });

    console.log('📋 Tables verified / created.');
});


// ==========================================
// 🎬 MOVIES API
// ==========================================
app.get('/api/movies', (req, res) => {
    db.query('SELECT * FROM movies', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/movies', (req, res) => {
    const { title, poster_url, trailer_url, category, genre, format } = req.body;
    const sql = 'INSERT INTO movies (title, poster_url, trailer_url, category, genre, format) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [title, poster_url, trailer_url, category, genre, format], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, ...req.body });
    });
});

app.put('/api/movies/:id', (req, res) => {
    const { title, poster_url, trailer_url, category, genre, format } = req.body;
    const sql = 'UPDATE movies SET title=?, poster_url=?, trailer_url=?, category=?, genre=?, format=? WHERE id=?';
    db.query(sql, [title, poster_url, trailer_url, category, genre, format, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Movie updated successfully' });
    });
});

app.delete('/api/movies/:id', (req, res) => {
    db.query('DELETE FROM movies WHERE id=?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Movie deleted' });
    });
});

// ==========================================
// 🏢 CINEMAS API
// ==========================================
app.get('/api/cinemas', (req, res) => {
    db.query('SELECT * FROM cinemas', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const formattedResults = results.map(c => ({ ...c, seatLayout: JSON.parse(c.seat_layout) }));
        res.json(formattedResults);
    });
});

app.post('/api/cinemas', (req, res) => {
    const { name, location, address, lat, lng, premium, seatLayout } = req.body;
    const sql = 'INSERT INTO cinemas (name, location, address, lat, lng, premium_format, seat_layout) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, location, address, lat, lng, premium, JSON.stringify(seatLayout)], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, ...req.body });
    });
});

app.delete('/api/cinemas/:id', (req, res) => {
    db.query('DELETE FROM cinemas WHERE id=?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Cinema deleted' });
    });
});

// ==========================================
// 👥 USERS & AUTH API
// ==========================================
app.get('/api/users', (req, res) => {
    db.query('SELECT id, name, email, role, status, created_at FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.put('/api/users/:id/status', (req, res) => {
    db.query('UPDATE users SET status=? WHERE id=?', [req.body.status, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User status updated' });
    });
});

// Update profile name
app.put('/api/users/:id/profile', (req, res) => {
    const { name } = req.body;
    db.query('UPDATE users SET name=? WHERE id=?', [name, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Profile updated', name });
    });
});

app.delete('/api/users/:id', (req, res) => {
    db.query('DELETE FROM users WHERE id=?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User deleted' });
    });
});

app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    const sql = "INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, 'User', 'Active')";
    db.query(sql, [name, email, password], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already in use' });
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: result.insertId, name, email, role: 'User', status: 'Active' });
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ? AND password_hash = ?', [email, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
        const user = results[0];
        if (user.status === 'Banned') return res.status(403).json({ error: 'This account has been banned.' });
        delete user.password_hash;
        res.json(user);
    });
});

// ==========================================
// 🎟️ BOOKINGS API with Concurrency Control
// ==========================================

// GET: All bookings for a specific user (joined with movie & cinema data)
app.get('/api/bookings/user/:userId', (req, res) => {
    // Use COALESCE for booked_at in case the column exists on newer tables
    const sql = `
        SELECT b.id, b.user_id, b.movie_id, b.cinema_id,
               DATE_FORMAT(b.show_date, '%Y-%m-%d') AS show_date,
               b.show_time, b.seats_booked, b.total_amount,
               m.title AS movie, m.poster_url AS backdrop, m.genre, m.format,
               c.name AS cinema, c.location
        FROM bookings b
        LEFT JOIN movies  m ON b.movie_id  = m.id
        LEFT JOIN cinemas c ON b.cinema_id = c.id
        WHERE b.user_id = ?
        ORDER BY b.show_date DESC, b.id DESC`;

    db.query(sql, [req.params.userId], (err, results) => {
        if (err) {
            console.error('fetchUserBookings SQL error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        const formatted = results.map(b => ({
            ...b,
            seats_booked: (() => {
                try { return typeof b.seats_booked === 'string' ? JSON.parse(b.seats_booked) : (b.seats_booked || []); }
                catch { return []; }
            })()
        }));
        res.json(formatted);
    });
});

// GET: Booked seats for a specific cinema+date+time (for the seat map display)
app.get('/api/bookings/seats', (req, res) => {
    const { cinema_id, show_date, show_time } = req.query;
    if (!cinema_id || !show_date || !show_time) {
        return res.json({ bookedSeats: [] }); // return empty if params missing
    }
    const sql = 'SELECT seats_booked FROM bookings WHERE cinema_id=? AND show_date=? AND show_time=?';
    db.query(sql, [cinema_id, show_date, show_time], (err, results) => {
        if (err) {
            console.error('fetchBookedSeats SQL error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        const allBookedSeats = results.flatMap(row => {
            try { return typeof row.seats_booked === 'string' ? JSON.parse(row.seats_booked) : (row.seats_booked || []); }
            catch { return []; }
        });
        res.json({ bookedSeats: allBookedSeats });
    });
});

// POST: Create a booking WITH seat conflict check using DB transaction (Concurrency Control)
// Uses SELECT ... FOR UPDATE to lock rows and prevent double-booking race conditions
app.post('/api/bookings', (req, res) => {
    const { id, user_id, movie_id, cinema_id, show_date, show_time, seats_booked, total_amount } = req.body;

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ error: 'Transaction start failed' });

        // LOCK: SELECT FOR UPDATE prevents any other transaction from reading/modifying
        // these rows simultaneously — this is the concurrency control mechanism
        const checkSql = 'SELECT seats_booked FROM bookings WHERE cinema_id=? AND show_date=? AND show_time=? FOR UPDATE';
        db.query(checkSql, [cinema_id, show_date, show_time], (err, results) => {
            if (err) return db.rollback(() => res.status(500).json({ error: err.message }));

            // Flatten all currently booked seats for this show
            const alreadyBooked = results.flatMap(row =>
                typeof row.seats_booked === 'string' ? JSON.parse(row.seats_booked) : (row.seats_booked || [])
            );

            // Check for conflicts
            const conflictingSeats = seats_booked.filter(seat => alreadyBooked.includes(seat));
            if (conflictingSeats.length > 0) {
                return db.rollback(() => res.status(409).json({
                    error: `Seats ${conflictingSeats.join(', ')} were just booked by someone else. Please select different seats.`,
                    conflictingSeats
                }));
            }

            // No conflicts — insert the booking
            const bookingId = id || `BK${Date.now()}`;
            const insertSql = 'INSERT INTO bookings (id, user_id, movie_id, cinema_id, show_date, show_time, seats_booked, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            db.query(insertSql, [bookingId, user_id, movie_id, cinema_id, show_date, show_time, JSON.stringify(seats_booked), total_amount], (err) => {
                if (err) return db.rollback(() => res.status(500).json({ error: err.message }));

                // COMMIT: Seats are now officially locked in the database!
                db.commit((err) => {
                    if (err) return db.rollback(() => res.status(500).json({ error: 'Commit failed' }));
                    res.json({ bookingId, message: 'Booking confirmed! Your seats are locked.' });
                });
            });
        });
    });
});

// POST: Demo payment/checkout endpoint (simulates Stripe payment processing)
app.post('/api/checkout', (req, res) => {
    // Simulate processing delay
    setTimeout(() => {
        const bookingId = `BK${Math.floor(Math.random() * 90000) + 10000}X`;
        res.json({ success: true, bookingId, message: 'Payment processed (demo mode)' });
    }, 800);
});

// --- START SERVER ---
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server is running live on http://localhost:${PORT}`));