const express = require('express');
const path = require('path');
const { makeCgvRequest } = require('./cgv_request');
const { sendMessage } = require('./sendDiscordMessage');

const app = express();
const PORT = 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// API endpoint to check CGV showtimes
app.get('/check-cgv', async (req, res) => {
  const scnYmd = req.query.scnYmd || '20250830'; // Default date or pass as query param
  const imaxExists = await makeCgvRequest(scnYmd);
  res.json({ imaxExists });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT}/index.html in your browser`);
  sendMessage('실시간 용산아이파크몰 IMAX 예매오픈 감지가 시작되었습니다.')
});
