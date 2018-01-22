const WebSocket = require('ws');

const diaSock = 'wss://appartement:appartement@diasuitebox-jvm2.bordeaux.inria.fr:443/userbox/ws?keepalive=client';
const clientName = 'googlehome';
const pingInterval = 45000;
const pingValue = 'PING:';

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
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

function socklisten() {
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
        // console.log('sockcom open')
        ws2.send("CLIENT:" + clientName, () => {
            ping = setInterval(() => { ws2.send(pingValue) }, pingInterval);
            ws2.send(JSON.stringify(diaData));
        });
    });

    ws2.on('message', (data) => {
        if (IsJsonString(data)) {
            data = JSON.parse(data);
            if (data.type.toString().trim() === clientName && data.data.action.toString().trim() === 'send_form') {
                console.log('sockListen new form: ' + data);

                reference = data.data.args.form_url;
                console.log("reference");
                console.log(reference);

                //LOAD QUEST FROM GFORMS
                fs.readFile('client_secret.json', function processClientSecrets(err, content) {
                    var query = 'nothing';
                    if (err) {
                        console.log('Error loading client secret file: ' + err);
                        return;
                    }
                    // Authorize a client with the loaded credentials, then call the
                    // Google Apps Script Execution API.
                    authorize(JSON.parse(content), callAppsScript, reference);
                });

            }
        } else {
            console.log('sockListen messsage : ' + data);
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

module.exports.sockcom = sockcom;
module.exports.socklisten = socklisten;

