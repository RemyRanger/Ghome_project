const fs = require('fs');
const WebSocket = require('ws');

const diaSock = 'wss://appartement:appartement@diasuitebox-jvm2.bordeaux.inria.fr:443/userbox/ws?keepalive=client';
const clientName = 'googlehome';
const pingInterval = 45000;
const pingValue = 'PING:';

var diaData = {
    type: clientName,
    data: {
        action: "send_request",
        args: {
            request: "Inactivity level"
        }
    }
};

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function socklisten(){
    var ping;

    var ws2 = new WebSocket(diaSock, {
        rejectUnauthorized: false
    });

    ws2.on('open', () => {
        // console.log('sockcom open')
        ws2.send("CLIENT:" + clientName, () => {
            ping = setInterval(() => { ws2.send(pingValue) }, pingInterval);
        });
    });

    ws2.on('message', (data) => {
        if (IsJsonString(data)) {
            data = JSON.parse(data);
            if (data.type.toString().trim() === clientName && data.data.action.toString().trim() === 'send_form') {
                console.log('sockListen new form: '+data);
            }
        }else{
            console.log('sockListen messsage : '+data);
        }
    });

    ws2.on('close', () => {
    try {
        ws2.close()
        ws2 = new WebSocket(diaSock, {
            rejectUnauthorized: false
        });
    } catch (error) {
        console.log('Connection to diaSuite lost')
    }
    });
}

function sockcom(req) {
    return new Promise((resolve, reject) => {
        var ping;
        var res;

        var ws2 = new WebSocket(diaSock, {
            rejectUnauthorized: false
        });

        ws2.on('open', () => {
            // console.log('sockcom open')
            ws2.send("CLIENT:" + clientName, () => {
                ping = setInterval(() => { ws2.send(pingValue) }, pingInterval);
            });
            ws2.send(JSON.stringify(req));
        });

        ws2.on('message', (data) => {
            if (IsJsonString(data)) {
                data = JSON.parse(data);
                if (data.type.toString().trim() === clientName) {
                    res = data;
                    setTimeout(() => {
                        clearInterval(ping);
                        ws2.close();
                    }, 1000)
                }
            }
        });

        ws2.on('close', () => {
            // console.log('sockcom close')
            if (res) {
                resolve(res);
            } else {
                reject('No data')
            }
        });

    })
}

socklisten()
sockcom(diaData).then((res) => {
    console.log('sockcom : '+JSON.stringify(res));
}, (err) => {
    console.log('sockcom : '+err);
})
