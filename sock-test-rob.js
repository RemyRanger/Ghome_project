const fs = require('fs');
const WebSocket = require('ws');

const diaSock = 'wss://appartement:appartement@diasuitebox-jvm2.bordeaux.inria.fr:443/userbox/ws?keepalive=client';
const clientName = 'googlehome';
const pingInterval = 45000;
const pingValue = 'PING:';
var ping;

var diaData = {
    type: clientName,
    data: {
        action: "send_request",
        args: {
            request: "Inactivity level"
        }
    }
};

var ws2 = new WebSocket(diaSock, {
    rejectUnauthorized: false
});

ws2.on('open', () => {
    ws2.send("CLIENT:" + clientName, () => {
        ping = setInterval(()=>{ws2.send(pingValue)},pingInterval);
        ws2.send(JSON.stringify(diaData))
    });
});

ws2.on('message', (data) => {
    filter(data)
});

ws2.on('close', function close() {
    console.log('ws2 disconnected');
});

function closeSocket(ws2){
    ws2.close();
    console.log(ping)
    clearInterval(ping);
    console.log(ping)
};

function filter(data){
    if((data.type).equals(clientName)){
        console.log("ws2 : " + data);
        setTimeout(()=>{closeSocket(ws2)},2500);
    }
}