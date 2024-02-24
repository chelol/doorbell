const https = require('https');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(`Method not allowed: ${req.method}`);
    return;
  }

  const notificationText = "tocaron el timbre";
  const accessToken = process.env.ALEXA_ACCESS_TOKEN; // Replace with your access token

  if (!accessToken) {
    throw new Error('Did you forget to assign ALEXA_ACCESS_TOKEN?');
  }

  const postData = JSON.stringify({
    "spokenInfo": {
      "content": [{
        "locale": "es-ES",
        "text": notificationText
      }]
    }
  });

  const options = {
    hostname: 'api.eu.amazonalexa.com',
    port: 443,
    path: '/v1/notifications',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    }
  };

  const reqAPI = https.request(options, (response) => {
    console.log(`statusCode: ${response.statusCode}`);

    let responseData = '';

    response.on('data', (chunk) => {
      responseData += chunk;
    });

    response.on('end', () => {
      console.log(JSON.parse(responseData));
      const location = response.statusCode === 200 ? '/success.html' : '/failure.html';
      res.statusCode = 303;
      res.setHeader('Location', location);
      res.setHeader('Content-Type', 'text/html');
      res.end(`Redirecting to <a href="${location}">${location}</a>...`);
    });
  });

  reqAPI.on('error', (error) => {
    console.error(error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  });

  reqAPI.write(postData);
  reqAPI.end();
};
