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
    if (err) console.error('❌ Database connection failed:', err.message);
    else console.log('✅ Connected to MySQL Database successfully!');
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
        // Parse the JSON string back into an object for React
        const formattedResults = results.map(c => ({ ...c, seatLayout: JSON.parse(c.seat_layout) }));
        res.json(formattedResults);
    });
});

app.post('/api/cinemas', (req, res) => {
    const { name, location, address, lat, lng, premium, seatLayout } = req.body;
    const sql = 'INSERT INTO cinemas (name, location, address, lat, lng, premium_format, seat_layout) VALUES (?, ?, ?, ?, ?, ?, ?)';
    // Stringify the layout to save in SQL JSON column
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
        
        // Don't send the password back to the frontend!
        delete user.password_hash; 
        res.json(user);
    });
});

// --- START SERVER ---
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server is running live on http://localhost:${PORT}`));