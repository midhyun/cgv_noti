const fetch = require('node-fetch');

const webhookUrl = 'https://discord.com/api/webhooks/1405548422039081041/lq0ZZh1AFKZLbpt6w-dJCTzDN77jqHAA1bvXBWeeLPZJcPd_eR7xGkE2iwBq9CeQsGJN';

async function sendMessage(messageContent) {
  if (!messageContent) {
    console.error('Message content cannot be empty.');
    return;
  }

  const message = {
    content: messageContent
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error(`Error sending message: ${response.statusText}`);
      const errorBody = await response.text();
      console.error('Discord API Response:', errorBody);
      return;
    }
    console.log('Message sent successfully!');
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

module.exports = { sendMessage };

