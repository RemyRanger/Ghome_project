var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
const https = require('https');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/script-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/forms', 'https://www.googleapis.com/auth/cloud-platform','https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/servicecontrol', 'https://www.googleapis.com/auth/service.management'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'script-nodejs-quickstart.json';

// FOR THE SERVER
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

app.get('/getQuestions', function(req, response){
  console.log('ok');
  response.send('ok');
});

app.post('/', function(req, response){
  // your JSON
  var query = req.body.result.parameters.msg;
  var body = req.body.result.parameters;
  console.log('From Google home:' + body);
  response.setHeader('Content-Type', 'application/json');
  var startForm = 'remplir formulaire';
  var oui = 'oui';
  var undef = 'undefined';
  var questions = app.get('questions');
  console.log(questions);
  if ( startForm.localeCompare(query)==0) {
	// Load client secrets from a local file.
  	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  		if (err) {
    			console.log('Error loading client secret file: ' + err);
    			return;
  		}
  		// Authorize a client with the loaded credentials, then call the
  		// Google Apps Script Execution API.
  		authorize(JSON.parse(content), callAppsScript, query);
  	});
	response.send(JSON.parse('{ "speech": "Le formulaire a été chargé, souhaitez-vous le remplir ?", "displayText": "Souhaitez-vous remplir le formualire ?"}'));
  } else if (query == oui) {
	var rep = questions[0];
	response.send(JSON.parse('{ "speech": "' + rep + '", "displayText": "' + rep + '"}'));
  } else if (!app.get('response0')) {
	app.set('response0', query);
	console.log(app.get('response0'));
	var rep = questions[1];
        response.send(JSON.parse('{ "speech": "' + rep + '", "displayText": "' + rep + '"}'));
  } else if (!app.get('response1')) {
	app.set('response1', query);
	console.log(app.get('response1'));
	var rep = questions[2];
        response.send(JSON.parse('{ "speech": "' + rep + '", "displayText": "' + rep + '"}'));
  } else if (!app.get('response2')) {
	app.set('response2', query);
	console.log(app.get('response2'));
	var rep = questions[3];
        response.send(JSON.parse('{ "speech": "' + rep + '", "displayText": "' + rep + '"}'));
  } else if (!app.get('response3')) {
	app.set('response3', query);
	console.log(app.get('response3'));

	// Load client secrets from a local file.
  	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  		if (err) {
    			console.log('Error loading client secret file: ' + err);
    			return;
  		}
  		// Authorize a client with the loaded credentials, then call the
  		// Google Apps Script Execution API.
		var myrep = [ app.get('response0'), app.get('response1'), app.get('response2'), query];
  		authorize(JSON.parse(content), postFormulaire, myrep);
  	});
	response.send(JSON.parse('{ "speech": "Formulaire terminé", "displayText": "formualire terminé"}'));
  }
});

var port = 80;
app.listen(port);

/*
const httpsOptions = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
}
const server = https.createServer(httpsOptions, app).listen(port, () => {
  console.log('server running at ' + port)
})

function setResponse(num, response) {
  app.set('reponse'+num, response);
}*/

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
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

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
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

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
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

/**
 * Call an Apps Script function to list the folders in the user's root
 * Drive folder.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
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
      // The API executed, but the script returned an error.

      // Extract the first (and only) set of error details. The values of this
      // object are the script's 'errorMessage' and 'errorType', and an array
      // of stack trace elements.
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
      // The structure of the result will depend upon what the Apps Script
      // function returns. Here, the function returns an Apps Script Object
      // with String keys and values, and so the result is treated as a
      // Node.js object (folderSet).
      var folderSet = resp.response.result.questions;
      console.log(folderSet);
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
      // The API executed, but the script returned an error.

      // Extract the first (and only) set of error details. The values of this
      // object are the script's 'errorMessage' and 'errorType', and an array
      // of stack trace elements.
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
