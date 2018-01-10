var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
const https = require('https');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/script-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/forms', 'https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/servicecontrol', 'https://www.googleapis.com/auth/service.management'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/';
var TOKEN_PATH = TOKEN_DIR + 'script-nodejs-quickstart.json';

// FOR THE SERVER
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

//USE JSON FORMAT
app.use(bodyParser.json());

//SET DISCUSSION FLAG AT 0
app.set('formulaire', '0');

//LOAD QUEST FROM GFORMS
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    var query = 'nothing';
    if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Google Apps Script Execution API.
    authorize(JSON.parse(content), callAppsScript, query);
});

//START DISCUSSION
app.post('/api', function(req, response) {
    //GET MSG FROM GHOME
    var query = req.body.result.parameters.msg;
    console.log('From Google home:' + query);
    //SET JSON FORMAT AS ANSWER
    response.setHeader('Content-Type', 'application/json');
    //SET VAR
    var oui = 'oui';
    var questions = app.get('questions');
    //IF PROCESSING FORM
    if (app.get('formulaire')=='1') {
      processForm(query, response)
    } else if (~query.indexOf("remplir") && ~query.indexOf("formulaire")) { //CASE OF DISCUSSION
      app.set('formulaire', '1');
      var rep = questions[0];
      response.send(JSON.parse('{ "speech": "Très bien ! J\'ai récupéré le formulaire de test, nous allons commencer. '+ rep +'" , "displayText": "Très bien ! J\'ai récupéré le formulaire de test, nous allons commencer. '+ rep +'"}'));
    } else if (~query.indexOf("nombre") && ~query.indexOf("pas")) { //CASE OF DISCUSSION
      response.send(JSON.parse('{ "speech": "D\'après les informations récupérées. Aujourd\'hui, vous avez fait 5768 pas. Comment puis-je vous aider maintenant ?", "displayText": "Aujourd\'hui, vous avez fait 5768 pas."}'));
    } else if (~query.indexOf("emploi") && ~query.indexOf("temps")) { //CASE OF DISCUSSION
      response.send(JSON.parse('{ "speech": "D\'après les informations récupérées. Aujourd\'hui, vous avez un cours à 14 heure avec Monsieur Consel. Que souhaitez-vous maintenant ?", "displayText": "Aujourd\'hui, vous avez un cours à 14 heure avec Monsieur Consel."}'));
    } else if (~query.indexOf("merci")) { //CASE OF DISCUSSION
      response.send(JSON.parse('{ "speech": "Je suis ravi de vous avoir aidé. Avez vous d\'autres questions ?", "displayText": "Je suis ravi de vous avoir aidé. Avez vous d\'autres questions ?"}'));
    } else if (~query.indexOf("quit") || ~query.indexOf("termin")) { //CASE OF DISCUSSION
      response.send(JSON.parse('{ "speech": "Je vous souhaite une agréable journé !", "displayText": "Je vous souhaite une agréable journé !", "data": { "google": {"expect_user_response": false}}}'));
    } else {
      response.send(JSON.parse('{ "speech": "Je n\'ai pas compris. Pouvez vous reformuler votre demande ?", "displayText": "Je n\'ai pas compris. Pouvez vous reformuler votre demande ?"}'));
    }
});

// response.send(JSON.parse('{ "speech": "Formulaire terminé", "displayText": "formualire terminé", "data": { "google": {"expect_user_response": false}}}'));

// RUNNING SERVER
var port = 80;
app.listen(port);

//USEFULL FUNCTIONS
function processForm(query, response) {
  //SET VAR
  var questions = app.get('questions');

  //START DISCUSSION
  for (var k = 0; k < questions.length; k++) {
    console.log('val de k:'+k);
    if (k==questions.length-1) {
      app.set('response'+k, query);
      console.log(app.get('response'+k));

      // Load client secrets from a local file.
      fs.readFile('client_secret.json', function processClientSecrets(err, content) {
          if (err) {
              console.log('Error loading client secret file: ' + err);
              return;
          }
          // Authorize a client with the loaded credentials, then call the
          // Google Apps Script Execution API.
          var myrep = [app.get('response0'), app.get('response1'), app.get('response2'), query];
          authorize(JSON.parse(content), postFormulaire, myrep);
      });
      app.set('formulaire', '0');
      for (var j = 0; j < questions.length; j++) {
        app.set('response'+j, '0');
      }
      response.send(JSON.parse('{ "speech": "Formulaire terminé. Que souhaitez vous faire maintenant ?", "displayText": "formualire terminé" }'));
    } else if (app.get('response'+k)=='0') {
      console.log('val (2em boucle) de k:'+k);
      if (~query.indexOf("question") && ~query.indexOf("précédente")) {
        console.log('précédent détecté:'+k);
        app.set('response'+(k-1), '0');
        var rep = questions[k-1];
        sendResponse(response, rep);
        break;
      }
      if (checkOuiNon(questions[k], query) == false) {
        response.send(JSON.parse('{ "speech": "Votre réponse doit contenire un oui ou un non, veuillez reformuler.", "displayText": "Votre réponse doit contenire un oui ou un non, veuillez reformuler."}'));
      } else {
        app.set('response'+k, query);
        console.log(app.get('response'+k));
        var rep = questions[k+1];
        sendResponse(response, rep);
      }
      break;
    }
  }
}

function sendResponse(response, question) {
    //REMOVE [F] FLAG
    if (~question.indexOf("[F]")) {
      question = question.substring(3);
      response.send(JSON.parse('{ "speech": "' + question + '", "displayText": "' + question + '"}'));
    } else {
      response.send(JSON.parse('{ "speech": "' + question + '", "displayText": "' + question + '"}'));
    }
}

function checkOuiNon(question, reponse) {
    if (~question.indexOf("[F]")) {
      if (~reponse.indexOf("oui") || ~reponse.indexOf("non")) {
        return true;
      }
      return false;
    }
    return true;
}


//GOOGLE FUNCTIONS FOR APP SCRIPT
function authorize(credentials, callback, query) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            getNewToken(oauth2Client, callback, query);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client, query);
        }
    });
}

function getNewToken(oauth2Client, callback, query) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client, query);
        });
    });
}

function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

function callAppsScript(auth, query) {
    var scriptId = 'MlqP88mVwRc4mfM1tPjxQbrd8qV20u4Vz';
    var script = google.script('v1');
    var input = query;

    // Make the API request. The request object is included here as 'resource'.
    script.scripts.run({
        auth: auth,
        resource: {
            function: 'getQuestions',
            parameters: [input],
        },
        scriptId: scriptId
    }, function(err, resp) {
        if (err) {
            // The API encountered a problem before the script started executing.
            console.log('The API returned an error: ' + err);
            return;
        }
        if (resp.error) {
            var error = resp.error.details[0];
            console.log('Script error message: ' + error.errorMessage);
            console.log('Script error stacktrace:');

            if (error.scriptStackTraceElements) {
                // There may not be a stacktrace if the script didn't start executing.
                for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
                    var trace = error.scriptStackTraceElements[i];
                    console.log('\t%s: %s', trace.function, trace.lineNumber);
                }
            }
        } else {
            console.log('Questions handled:'+resp.response.result.questions);
            console.log('Questions Size:'+resp.response.result.questions.length);
            for (var j = 0; j < resp.response.result.questions.length; j++) {
              app.set('response'+j, '0');
            }
            app.set('questions', resp.response.result.questions);
        }

    });
}

function postFormulaire(auth, query) {
    var scriptId = 'MlqP88mVwRc4mfM1tPjxQbrd8qV20u4Vz';
    var script = google.script('v1');
    var input = query;

    // Make the API request. The request object is included here as 'resource'.
    script.scripts.run({
        auth: auth,
        resource: {
            function: 'postForm',
            parameters: [input],
        },
        scriptId: scriptId
    }, function(err, resp) {
        if (err) {
            // The API encountered a problem before the script started executing.
            console.log('The API returned an error: ' + err);
            return;
        }
        if (resp.error) {
            var error = resp.error.details[0];
            console.log('Script error message: ' + error.errorMessage);
            console.log('Script error stacktrace:');

            if (error.scriptStackTraceElements) {
                // There may not be a stacktrace if the script didn't start executing.
                for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
                    var trace = error.scriptStackTraceElements[i];
                    console.log('\t%s: %s', trace.function, trace.lineNumber);
                }
            }
        }

    });
}
