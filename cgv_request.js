const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { generateCgvSignature } = require('./cgv_signature.js');
const { sendMessage } = require('./sendDiscordMessage.js');

// --- Cooldown Logic Start ---
const cooldownFilePath = path.join(__dirname, 'cooldown_state.json');
const COOLDOWN_PERIOD_MS = 60 * 60 * 1000; // 1 hour in milliseconds

function getLastNotificationTime() {
  try {
    if (fs.existsSync(cooldownFilePath)) {
      const data = fs.readFileSync(cooldownFilePath, 'utf8');
      const state = JSON.parse(data);
      return state.lastNotificationTime || 0;
    }
  } catch (error) {
    console.error('Error reading cooldown state:', error);
  }
  return 0; // Allow notification if file doesn't exist or is corrupted
}

function setNotificationTime() {
  try {
    const state = { lastNotificationTime: Date.now() };
    fs.writeFileSync(cooldownFilePath, JSON.stringify(state, null, 2));
    console.log('Notification timestamp updated.');
  } catch (error) {
    console.error('Error writing cooldown state:', error);
  }
}
// --- Cooldown Logic End ---

async function makeCgvRequest(scnYmd) {
  const url = `https://api-mobile.cgv.co.kr/cnm/atkt/searchSchByMov?coCd=A420&siteNo=0013&scnYmd=${scnYmd}&movNo=89833&rtctlScopCd=08`;
  const pathname = new URL(url).pathname;
  const requestBody = ''; // GET request, so body is empty
  const xTimestamp = Math.floor(Date.now() / 1000).toString();
  const xSignature = generateCgvSignature(pathname, requestBody, xTimestamp);

  const headers = {
    'accept': 'application/json',
    'accept-language': 'ko-KR',
    'origin': 'https://cgv.co.kr',
    'priority': 'u=1, i',
    'referer': 'https://cgv.co.kr/',
    'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
    'x-signature': xSignature, // Use the dynamically generated signature
    'x-timestamp': xTimestamp, // Use the dynamically generated timestamp
  };

  const cookies = '_ga=GA1.1.578951204.1755136465; _ga_HV92ZRC3WF=GS2.1.s1755136465$o1$g1$t1755136497$j28$l0$h0';
  headers['Cookie'] = cookies;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${JSON.stringify(response)}`);
    }

    const data = await response.json();
    if (data.data.length > 0) {
      const imaxData = data.data.filter(item => item.scnsNm === 'IMAX관');

      if (imaxData.length > 0) {
        // --- Cooldown Check ---
        const lastNotificationTime = getLastNotificationTime();
        const currentTime = Date.now();

        if (currentTime - lastNotificationTime < COOLDOWN_PERIOD_MS) {
          console.log('Cooldown active. Skipping notification.');
          return false; // Cooldown is active
        }
        // --- End Cooldown Check ---

        let output = '귀멸의 칼날 IMAX 예매가 오픈되었습니다!!!!\n';

        imaxData.forEach((val) => {
          output += `${val.prodNm} 시작시간: ${val.scnsrtTm} 잔여석: ${val.frSeatCnt}\n`;
        });

        if (imaxData.length > 0) {
          sendMessage(output);
          setNotificationTime(); // Update timestamp after sending
          return true; // IMAX data found and notification sent
        }
      }
    }
    return false; // No IMAX data or no data at all
  } catch (error) {
    console.error('Error making CGV request:', error);
    return false; // Error occurred
  }
}

// Export the function for use in server.js
module.exports = { makeCgvRequest };
