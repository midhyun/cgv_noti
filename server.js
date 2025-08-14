const express = require('express');
const { makeCgvRequest } = require('./cgv_request');
const { sendMessage } = require('./sendDiscordMessage');
const cron = require('node-cron');

const app = express();
const PORT = 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

const checkImax = async () => {
  try {
    const scnYmd = '20250830';
    console.log(`[${new Date().toLocaleString()}] Checking for IMAX tickets for ${scnYmd}`);
    await makeCgvRequest(scnYmd);
  } catch (error) {
    console.error('Error during scheduled IMAX check:', error);
    sendMessage('Error during scheduled IMAX check');
  }
};

// API endpoint to check CGV showtimes
app.get('/check-cgv', async (req, res) => {
  const scnYmd = req.query.scnYmd || '20250830'; // Default date or pass as query param
  const imaxExists = await makeCgvRequest(scnYmd);
  res.json({ imaxExists });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT}/index.html in your browser`);

  // Schedule task to run every 5 minutes.
  cron.schedule('*/5 * * * *', () => {
    checkImax();
  });

  // Initial check on startup
  checkImax();
});
