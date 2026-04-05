const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost', user: 'root', password: '', database: 'cinesync_db'
});

const movies = [
  // TRENDING
  { title: 'Oppenheimer', poster_url: 'https://image.tmdb.org/t/p/w500/fm6KqXpkh8m7S4DmUVJoaOC8xM1.jpg', trailer_url: 'https://www.youtube.com/embed/uYPbbksJxIg', category: 'Trending', genre: 'Biography Drama', format: 'IMAX' },
  { title: 'Barbie', poster_url: 'https://image.tmdb.org/t/p/w500/iuFNMS8Nf2J0s8scBiMIBGMzuAT.jpg', trailer_url: 'https://www.youtube.com/embed/pBk4NYhWNMM', category: 'Trending', genre: 'Comedy', format: '2D' },
  { title: 'Guardians of the Galaxy Vol. 3', poster_url: 'https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Ydgd9Zdv2.jpg', trailer_url: 'https://www.youtube.com/embed/u3V5KDHRQvk', category: 'Trending', genre: 'Action', format: 'IMAX 3D' },
  { title: 'Top Gun: Maverick', poster_url: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg', trailer_url: 'https://www.youtube.com/embed/giXco2jaZ_4', category: 'Trending', genre: 'Action', format: 'IMAX' },
  { title: 'Avatar: The Way of Water', poster_url: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9vu9Z.jpg', trailer_url: 'https://www.youtube.com/embed/d9MyW72ELq0', category: 'Trending', genre: 'Sci-Fi', format: 'IMAX 3D' },
  { title: 'Avengers: Endgame', poster_url: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tükzllrBs8KDw9ab.jpg', trailer_url: 'https://www.youtube.com/embed/TcMBFSGVi1c', category: 'Trending', genre: 'Action', format: 'IMAX 3D' },
  // NOW SHOWING
  { title: 'Mission: Impossible - Dead Reckoning', poster_url: 'https://image.tmdb.org/t/p/w500/NNxYkU70HPurnNCSiCjYAmacwm.jpg', trailer_url: 'https://www.youtube.com/embed/avz06PDqDbM', category: 'Now Showing', genre: 'Action Thriller', format: 'IMAX' },
  { title: 'Fast X', poster_url: 'https://image.tmdb.org/t/p/w500/fiVW06jE7z9F3FVy9PSd3z97pc.jpg', trailer_url: 'https://www.youtube.com/embed/32RAq6JzY-w', category: 'Now Showing', genre: 'Action', format: '4DX' },
  { title: 'Indiana Jones and the Dial of Destiny', poster_url: 'https://image.tmdb.org/t/p/w500/Af4bXE63pVsb2FtbW8uYQnqoelf.jpg', trailer_url: 'https://www.youtube.com/embed/eQfMbSe7F2g', category: 'Now Showing', genre: 'Adventure', format: 'IMAX' },
  { title: 'Black Panther: Wakanda Forever', poster_url: 'https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg', trailer_url: 'https://www.youtube.com/embed/D3jZh-NW_70', category: 'Now Showing', genre: 'Action', format: 'IMAX 3D' },
  { title: 'Doctor Strange in the Multiverse of Madness', poster_url: 'https://image.tmdb.org/t/p/w500/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg', trailer_url: 'https://www.youtube.com/embed/aWzlQ2N6qqg', category: 'Now Showing', genre: 'Action Sci-Fi', format: 'IMAX 3D' },
  { title: 'Thor: Love and Thunder', poster_url: 'https://image.tmdb.org/t/p/w500/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg', trailer_url: 'https://www.youtube.com/embed/tgB1wUcmbbw', category: 'Now Showing', genre: 'Action', format: 'IMAX 3D' },
  { title: 'The Batman', poster_url: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg', trailer_url: 'https://www.youtube.com/embed/mqqft2x_Aa4', category: 'Now Showing', genre: 'Action Crime', format: 'IMAX' },
  { title: 'Ant-Man and the Wasp: Quantumania', poster_url: 'https://image.tmdb.org/t/p/w500/ngl2FKBlU4fhbdsrtdom9LVLBXw.jpg', trailer_url: 'https://www.youtube.com/embed/ZlNFpri-Y40', category: 'Now Showing', genre: 'Action', format: '3D' },
  { title: 'Shang-Chi and the Legend of the Ten Rings', poster_url: 'https://image.tmdb.org/t/p/w500/1BIoJGKbXjdFDAqUEiA2VHqkK1Z.jpg', trailer_url: 'https://www.youtube.com/embed/8YjFbMbfXaQ', category: 'Now Showing', genre: 'Action', format: 'IMAX 3D' },
  // COMING SOON
  { title: 'Deadpool & Wolverine', poster_url: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', trailer_url: 'https://www.youtube.com/embed/73_1biulkYk', category: 'Coming Soon', genre: 'Action Comedy', format: 'IMAX' },
  { title: 'Inside Out 2', poster_url: 'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg', trailer_url: 'https://www.youtube.com/embed/LEjhY15eCx0', category: 'Coming Soon', genre: 'Animation', format: '3D' },
  { title: 'Alien: Romulus', poster_url: 'https://image.tmdb.org/t/p/w500/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg', trailer_url: 'https://www.youtube.com/embed/QMXiATf9mI0', category: 'Coming Soon', genre: 'Horror Sci-Fi', format: 'IMAX' },
  { title: 'Twisters', poster_url: 'https://image.tmdb.org/t/p/w500/1FjKh2wQBSynBiIq5LS8gBMxRlR.jpg', trailer_url: 'https://www.youtube.com/embed/zGPuazETKkI', category: 'Coming Soon', genre: 'Action Thriller', format: '4DX' },
  { title: 'Kingdom of the Planet of the Apes', poster_url: 'https://image.tmdb.org/t/p/w500/gKkl37BQuKTanygYQG1pyYgLVgf.jpg', trailer_url: 'https://www.youtube.com/embed/XhHzuGqQRoc', category: 'Coming Soon', genre: 'Sci-Fi Action', format: 'IMAX' },
  { title: 'Furiosa: A Mad Max Saga', poster_url: 'https://image.tmdb.org/t/p/w500/iADOJ8Zymht2JPMoy3R7xceZprc.jpg', trailer_url: 'https://www.youtube.com/embed/XJMuhwVlca4', category: 'Coming Soon', genre: 'Action', format: '4DX' },
  // CLASSICS
  { title: 'The Dark Knight', poster_url: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', trailer_url: 'https://www.youtube.com/embed/EXeTwQWrcwY', category: 'Classics', genre: 'Action Crime', format: 'IMAX' },
  { title: 'Inception', poster_url: 'https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg', trailer_url: 'https://www.youtube.com/embed/YoHD9XEInc0', category: 'Classics', genre: 'Sci-Fi Thriller', format: 'IMAX' },
  { title: 'Interstellar', poster_url: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', trailer_url: 'https://www.youtube.com/embed/zSWdZVtXT7E', category: 'Classics', genre: 'Sci-Fi Drama', format: 'IMAX' },
  { title: 'The Shawshank Redemption', poster_url: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', trailer_url: 'https://www.youtube.com/embed/6hB3S9bIaco', category: 'Classics', genre: 'Drama', format: '2D' },
  { title: 'Pulp Fiction', poster_url: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', trailer_url: 'https://www.youtube.com/embed/s7EdQ4FqbhY', category: 'Classics', genre: 'Crime Thriller', format: '2D' },
  { title: 'The Godfather', poster_url: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsLeFHOgjW4NB.jpg', trailer_url: 'https://www.youtube.com/embed/sY1S34973zA', category: 'Classics', genre: 'Crime Drama', format: '2D' },
  { title: 'Goodfellas', poster_url: 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg', trailer_url: 'https://www.youtube.com/embed/qo5jJpHtI1Y', category: 'Classics', genre: 'Crime', format: '2D' },
];

db.connect(err => {
  if (err) { console.error('DB connection failed:', err.message); process.exit(1); }
  console.log('Connected. Seeding movies...\n');

  let done = 0;
  movies.forEach(m => {
    const sql = `INSERT INTO movies (title, poster_url, trailer_url, category, genre, format)
      SELECT ?,?,?,?,?,? FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM movies WHERE title = ?)`;
    db.query(sql, [m.title, m.poster_url, m.trailer_url, m.category, m.genre, m.format, m.title], (err, result) => {
      done++;
      if (err) console.error(`❌ ${m.title}:`, err.message);
      else if (result.affectedRows > 0) console.log(`✅ Inserted: ${m.title}`);
      else console.log(`⏭️  Skipped (exists): ${m.title}`);
      if (done === movies.length) { console.log('\nDone!'); db.end(); }
    });
  });
});
