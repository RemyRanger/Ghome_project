const diaSock = 'wss://appartement:appartement@diasuitebox-jvm2.bordeaux.inria.fr/userbox/ws?keepalive=client';	
const diaSockDev = 'wss://appartement:appartement@domassist-dev.bordeaux.inria.fr/userbox/ws?keepalive=client';

const WebSocket = require('ws');
var fs = require('fs');

const ws = new WebSocket(diaSock,{
    ca:[fs.readFileSync('ca.crt')]
});

ws.on('open', function open() {
    ws.send('something');
  });
  
  ws.on('message', function incoming(data) {
    console.log(data);
  });


