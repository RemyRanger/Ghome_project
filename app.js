var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// WEBSOCKET
const {sockcom, socklisten} = require('./sockets.js');
const clientName = 'googlehome';

// GOOGLE
const  {processForm, sendResponse, checkOuiNon, getNewToken, storeToken, callAppsScript, prostFormulaire} = require('./google.js')

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/script-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/forms', 'https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/servicecontrol', 'https://www.googleapis.com/auth/service.management'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/';
var TOKEN_PATH = TOKEN_DIR + 'script-nodejs-quickstart.json';

// ID FORMULAIRE
var reference;

// FOR THE SERVER
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

// RUNNING SERVER
var port = 80;
app.listen(port);
//listen form ref
socklisten();
//USE JSON FORMAT
app.use(bodyParser.json());

//SET DISCUSSION FLAG AT 0
app.set('formulaire', '0');

//START DISCUSSION
app.post('/api', function (req, response) {
    //GET MSG FROM GHOME
    var query = req.body.result.parameters.msg;
    console.log('From Google home:' + query);
    //SET JSON FORMAT AS ANSWER
    response.setHeader('Content-Type', 'application/json');
    //SET VAR
    var oui = 'oui';
    var questions = app.get('questions');
    //IF PROCESSING FORM
    if (app.get('formulaire') == '1') {
        if (~query.indexOf("quit") || ~query.indexOf("termin")) { //CASE OF DISCUSSION
            response.send(JSON.parse('{ "speech": "Vous avez abandonné le formulaire. Retour au menu principal.", "displayText": "Vous avez abandonné le formulaire. Retour au menu principal."}'));
            app.set('formulaire', '0');
        } else {
            processForm(query, response)
        }
    } else if (~query.indexOf("remplir") && ~query.indexOf("formulaire")) { //CASE OF DISCUSSION
        app.set('formulaire', '1');
        for (var j = 0; j < questions.length; j++) {
            app.set('response' + j, '0');
        }
        var rep = questions[0];

        response.send(JSON.parse('{ "speech": "Très bien ! J\'ai récupéré le formulaire de test, nous allons commencer. ' + rep + '" , "displayText": "Très bien ! J\'ai récupéré le formulaire de test, nous allons commencer. ' + rep + '"}'));
    } else if (~query.indexOf("inactivité") && ~query.indexOf("niveau")) { //CASE OF DISCUSSION

        var diaData = {
            type: clientName,
            data: {
                action: "send_request",
                args: {
                    request: "Inactivity level"
                }
            }
        };
        sockcom(diaData).then((res) => {
            console.log(res);
            response.send(JSON.parse('{ "speech": "' + res.data.args.response + ' Comment puis-je vous aider maintenant ?", "displayText": "' + res.data.args.response + '"}'));
        }, (err) => {
            console.log(err);
        });
    } else if (~query.indexOf("chambre") && ~query.indexOf("mouvement")) { //CASE OF DISCUSSION

        var diaData = {
            type: clientName,
            data: {
                action: "send_request",
                args: {
                    request: "Bedroom motion detector state"
                }
            }
        };
        sockcom(diaData).then((res) => {
            console.log(res);
            response.send(JSON.parse('{ "speech": "' + res.data.args.response + ' Comment puis-je vous aider maintenant ?", "displayText": "' + res.data.args.response + '"}'));
        }, (err) => {
            console.log(err);
        });
    } else if (~query.indexOf("frig") && ~query.indexOf("porte")) { //CASE OF DISCUSSION

        var diaData = {
            type: clientName,
            data: {
                action: "send_request",
                args: {
                    request: "Fridge door contact sensor state"
                }
            }
        };
        sockcom(diaData).then((res) => {
            console.log(res);
            response.send(JSON.parse('{ "speech": "' + res.data.args.response + ' Comment puis-je vous aider maintenant ?", "displayText": "' + res.data.args.response + '"}'));
        }, (err) => {
            console.log(err);
        });
    } else if (~query.indexOf("entrée") && ~query.indexOf("porte")) { //CASE OF DISCUSSION

        var diaData = {
            type: clientName,
            data: {
                action: "send_request",
                args: {
                    request: "Entrance door contact sensor state "
                }
            }
        };
        sockcom(diaData).then((res) => {
            console.log(res);
            response.send(JSON.parse('{ "speech": "' + res.data.args.response + ' Comment puis-je vous aider maintenant ?", "displayText": "' + res.data.args.response + '"}'));
        }, (err) => {
            console.log(err);
        });
    } else if (~query.indexOf("salon") && ~query.indexOf("lumière")) { //CASE OF DISCUSSION

        var diaData = {
            type: clientName,
            data: {
                action: "send_request",
                args: {
                    request: "Living light state"
                }
            }
        };
        sockcom(diaData).then((res) => {
            console.log(res);
            response.send(JSON.parse('{ "speech": "' + res.data.args.response + ' Comment puis-je vous aider maintenant ?", "displayText": "' + res.data.args.response + '"}'));
        }, (err) => {
            console.log(err);
        });
    } else if (~query.indexOf("dernière") && ~query.indexOf("activité")) { //CASE OF DISCUSSION

        var diaData = {
            type: clientName,
            data: {
                action: "send_request",
                args: {
                    request: "Last monitored action"
                }
            }
        };
        sockcom(diaData).then((res) => {
            console.log(res);
            response.send(JSON.parse('{ "speech": "' + res.data.args.response + ' Comment puis-je vous aider maintenant ?", "displayText": "' + res.data.args.response + '"}'));
        }, (err) => {
            console.log(err);
        });
    } else if (~query.indexOf("merci")) { //CASE OF DISCUSSION
      response.send(JSON.parse('{ "speech": "Je suis ravi de vous avoir aidé. Avez vous d\'autres questions ?", "displayText": "Je suis ravi de vous avoir aidé. Avez vous d\'autres questions ?"}'));
    } else if (~query.indexOf("quit") || ~query.indexOf("termin")) { //CASE OF DISCUSSION
      response.send(JSON.parse('{ "speech": "Je vous souhaite une agréable journé !", "displayText": "Je vous souhaite une agréable journé !", "data": { "google": {"expect_user_response": false}}}'));
    } else {
      response.send(JSON.parse('{ "speech": "Je n\'ai pas compris. Pouvez vous reformuler votre demande ?", "displayText": "Je n\'ai pas compris. Pouvez vous reformuler votre demande ?"}'));
}
});

// response.send(JSON.parse('{ "speech": "Formulaire terminé", "displayText": "formualire terminé", "data": { "google": {"expect_user_response": false}}}'));
