const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');
const options = {
  cert: fs.readFileSync('./https/server.crt'),
  key: fs.readFileSync('./https/server.key')
};
const port = 8000;
const server = https.createServer(options);

const diaSock = 'wss://appartement:appartement@diasuitebox-jvm2.bordeaux.inria.fr/userbox/ws?keepalive=client';
const diaSockDev = 'wss://appartement:appartement@domassist-dev.bordeaux.inria.fr/userbox/ws?keepalive=client';

const wss = new WebSocket.Server({ server });

wss.on('connection', function connection (ws) {
  console.log('new connection')
  ws.on('message', function message (msg) {
    console.log(msg);
  });
});


server.listen(port, function listening () {
  //
  // If the `rejectUnauthorized` option is not `false`, the server certificate
  // is verified against a list of well-known CAs. An 'error' event is emitted
  // if verification fails.
  //
  // The certificate used in this example is self-signed so `rejectUnauthorized`
  // is set to `false`.
  //
  const ws2 = new WebSocket(`${diaSock}:443`, {
    rejectUnauthorized: false
  });

  ws2.on('open', function open () {
    var json = {
      type: "googlehome",
      data:{
        action: "send_request",
        args: {
            request: "Inactivity level"
        }
      }
    };
    ws2.send(JSON.stringify(json));
  });
  ws2.on('message', (data) => {
    console.log("ws2 : " + data);
  });

});
