const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3001; // Pastikan frontend Anda juga menggunakan port 3001

// Middleware
app.use(cors());
app.use(express.json());

// Setup Database SQLite
const db = new sqlite3.Database('./lostfound.db', (err) => {
  if (err) {
    console.error('❌ Gagal koneksi ke SQLite:', err.message);
  } else {
    console.log('✅ Terhubung ke database SQLite');
    createTables();
  }
});

// Fungsi untuk membuat tabel otomatis
function createTables() {
  // 1. Buat tabel users (phone di-set UNIQUE agar data valid)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    phone TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error('❌ Gagal buat tabel users:', err.message);
    else console.log('✅ Tabel "users" siap digunakan');
  });

  // 2. Buat tabel reports
  db.run(`CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1,
    type TEXT CHECK(type IN ('lost', 'found')),
    name TEXT,
    location TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`, (err) => {
    if (err) console.error('❌ Gagal buat tabel reports:', err.message);
    else console.log('✅ Tabel "reports" siap digunakan');
  });
}

// ==================== REST API ENDPOINTS ====================

// 1. GET: Ambil semua laporan
app.get('/api/reports', (req, res) => {
  db.all('SELECT * FROM reports ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 2. GET: Ambil detail laporan by ID
app.get('/api/reports/:id', (req, res) => {
  db.get('SELECT * FROM reports WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    res.json(row);
  });
});

// 3. GET: Laporan milik user tertentu
app.get('/api/reports/user/:userId', (req, res) => {
  db.all('SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 4. POST: Tambah laporan baru
app.post('/api/reports', (req, res) => {
  const { user_id, type, name, location, description } = req.body;
  const sql = `INSERT INTO reports (user_id, type, name, location, description) VALUES (?, ?, ?, ?, ?)`;
  
  db.run(sql, [user_id || 1, type, name, location, description], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ 
      id: this.lastID, 
      user_id: user_id || 1,
      type, name, location, description, 
      status: 'pending' 
    });
  });
});

// 5. PUT: Update laporan
app.put('/api/reports/:id', (req, res) => {
  const { name, location, description, status, type } = req.body;
  const sql = `UPDATE reports SET 
    name = COALESCE(?, name),
    location = COALESCE(?, location), 
    description = COALESCE(?, description),
    status = COALESCE(?, status),
    type = COALESCE(?, type)
    WHERE id = ?`;
  
  db.run(sql, [name, location, description, status, type, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Laporan berhasil diupdate', id: req.params.id });
  });
});

// 6. DELETE: Hapus laporan
app.delete('/api/reports/:id', (req, res) => {
  db.run('DELETE FROM reports WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Laporan berhasil dihapus' });
  });
});

// 7. FITUR AI: Cari kecocokan berdasarkan kesamaan kata
app.get('/api/matches/find/:id', (req, res) => {
  const reportId = req.params.id;
  
  db.get('SELECT * FROM reports WHERE id = ?', [reportId], (err, currentReport) => {
    if (err || !currentReport) return res.status(404).json({ error: 'Laporan tidak ditemukan' });
    
    const oppositeType = currentReport.type === 'lost' ? 'found' : 'lost';
    
    // JOIN dengan tabel users untuk mengambil username, phone, dan email
    const sql = `
      SELECT r.*, u.username, u.phone, u.email 
      FROM reports r 
      LEFT JOIN users u ON r.user_id = u.id 
      WHERE r.type = ? AND r.status = 'pending'
    `;
    
    db.all(sql, [oppositeType], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const matches = rows.map(row => {
        const score = calculateSimilarity(currentReport.description, row.description);
        return { 
          ...row, 
          match_score: score,
          contact_name: row.username || 'Anonim',
          contact_phone: row.phone || '-',
          contact_email: row.email || '-'
        };
      })
      .filter(match => match.match_score >= 0.3)
      .sort((a, b) => b.match_score - a.match_score);
      
      res.json(matches);
    });
  });
});

// Fungsi bantu untuk menghitung kesamaan teks (AI Sederhana)
function calculateSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  const words1 = text1.toLowerCase().split(' ');
  const words2 = text2.toLowerCase().split(' ');
  const commonWords = words1.filter(word => words2.includes(word));
  return commonWords.length / Math.max(words1.length, words2.length);
}

// ==================== AUTH ENDPOINTS ====================

// LOGIN user
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi' });
  }
  
  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ message: 'Email atau password salah' });
    
    res.json({ 
      user: { id: row.id, username: row.username, email: row.email, phone: row.phone },
      token: 'token-' + row.id 
    });
  });
});

// REGISTER user baru (Dengan Validasi Ketat)
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, phone } = req.body;
  
  // Validasi: Semua field WAJIB diisi, termasuk phone
  if (!username || !email || !password || !phone) {
    return res.status(400).json({ message: 'Semua field, termasuk Nomor HP, wajib diisi!' });
  }
  
  const sql = `INSERT INTO users (username, email, password, phone) VALUES (?, ?, ?, ?)`;
  
  db.run(sql, [username, email, password, phone], function(err) {
    if (err) {
      // Tangani error spesifik jika email atau phone sudah dipakai
      if (err.message.includes('users.email')) {
        return res.status(400).json({ error: 'Email sudah terdaftar' });
      }
      if (err.message.includes('users.phone')) {
        return res.status(400).json({ error: 'Nomor HP ini sudah digunakan untuk mendaftar' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, username, email, phone });
  });
});

// GET: Profil user
app.get('/api/auth/profile/:userId', (req, res) => {
  db.get('SELECT id, username, email, phone, created_at FROM users WHERE id = ?', [req.params.userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json(row);
  });
});

// Jalankan Server
app.listen(PORT, () => {
  console.log(`\n🚀 Server REST API berjalan di: http://localhost:${PORT}`);
  console.log(`💾 Database SQLite tersimpan di file: lostfound.db\n`);
});