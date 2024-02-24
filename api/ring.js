const https = require('https');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(`Method not allowed: ${req.method}`);
    return;
  }

  const notification = `${req.query.name || 'Alguien'} tocó el timbre.`;
  const accessCode = process.env.ALEXA_ACCESS_CODE;

  if (!accessCode) {
    throw new Error('Did you forget to assign ALEXA_ACCESS_CODE?');
  }

  console.log(notification);
  const url = new URL('https://api.notifymyecho.com/v1/NotifyMe');
  url.searchParams.append('notification', notification);
  url.searchParams.append('accessCode', accessCode);

  // Realiza la solicitud POST a la API de Notify My Echo
  const request = https.request(url, ({ statusCode }) => {
    // Si la solicitud es exitosa, emitir el sonido de timbre y el mensaje de voz
    if ([200, 201, 202].includes(statusCode)) {
      const speakMessage = '¡Hay alguien en la puerta!';
      const soundUrl = new URL('https://api.notifymyecho.com/v1/NotifyMe');
      soundUrl.searchParams.append('notification', speakMessage);
      soundUrl.searchParams.append('accessCode', accessCode);

      // Realizar una solicitud POST para emitir el mensaje de voz
      https.request(soundUrl, (response) => {
        console.log(`Mensaje de voz emitido: ${speakMessage}`);
      }).end();
    }
    
    const location = [200, 201, 202].includes(statusCode)
      ? '/success.html'
      : '/failure.html';
    res.statusCode = 303;
    res.setHeader('Location', location);
    res.setHeader('Content-Type', 'text/html');
    res.end(`Redirecting to <a href="${location}">${location}</a>...`);
  });

  request.on('error', (error) => {
    console.error(`Error al realizar la solicitud a Notify My Echo: ${error}`);
  });

  request.end();
}
