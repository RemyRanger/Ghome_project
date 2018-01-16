const diaSock = 'wss://appartement:appartement@diasuitebox-jvm2.bordeaux.inria.fr/userbox/ws?keepalive=client';	
const diaSockDev = 'wss://appartement:appartement@domassist-dev.bordeaux.inria.fr/userbox/ws?keepalive=client';

const WebSocket = require('ws');
var fs = require('fs');
var rootCas = require('ssl-root-cas/latest').create();

rootCas.addFile(__dirname + '/ca.crt');

require('https').globalAgent.options.ca = rootCas;

const ws = new WebSocket(diaSock,{
    ca:rootCas
});

ws.on('open', function open() {
    ws.send('something');
  });
  
  ws.on('message', function incoming(data) {
    console.log(data);
  });


