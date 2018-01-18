const fs = require('fs');
const WebSocket = require('ws');

const diaSock = 'wss://appartement:appartement@diasuitebox-jvm2.bordeaux.inria.fr:443/userbox/ws?keepalive=client';
const clientName = 'googlehome';
const pingInterval = 45000;
const pingValue = 'PING:';
let diaData = {
    type: clientName,
    data: {
        action: "send_request",
        args: {
            request: "Inactivity level"
        }
    }
};


const ws2 = new WebSocket(diaSock, {
    rejectUnauthorized: false
});

ws2.on('open', ()=> {
    ws2.send("CLIENT:" + clientName, () => {
        setInterval(()=>{ws2.send(pingValue)},pingInterval);
    });
});

ws2.on('message', (data) => {
    console.log("ws2 : " + data);
});

ws2.on('close', function close() {
    console.log('ws2 : disconnected');
    try {
        console.log('ws2 : trying reconnect')
        ws2 = new WebSocket(diaSock, {
            rejectUnauthorized: false
        });
    } catch (error) {
        console.log('ws2 : socket is dead')
    }
});

