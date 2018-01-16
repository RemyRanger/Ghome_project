
function askQuestions(req, res){
  //GET MSG FROM GHOME
  var query = req.body.result.parameters.msg;
  var body = req.body.result.parameters;
  console.log('From Google home:' + body);
  //SET JSON FORMAT AS ANSWER
  res.setHeader('Content-Type', 'application/json');
  //SET VAR
  var oui = 'oui';
  var undef = 'undefined';
  var questions = app.get('questions');
  //START DISCUSSION
  if (query == oui && !app.get('response0')) {
      var rep = questions[0];
      console.log('passage');
      sendResponse(res, rep)
  } else if (!app.get('response0')) {
      if (checkOuiNon(questions[0], query) == false) {
        res.send(JSON.parse('{ "speech": "Votre réponse doit contenire un oui ou un non, veuillez reformuler.", "displayText": "Votre réponse doit contenire un oui ou un non, veuillez reformuler."}'));
      } else {
        app.set('response0', query);
        console.log(app.get('response0'));
        var rep = questions[1];
        sendResponse(res, rep)
      }
  } else if (!app.get('response1')) {
    if (checkOuiNon(questions[1], query) == false) {
      res.send(JSON.parse('{ "speech": "Votre réponse doit contenire un oui ou un non, veuillez reformuler.", "displayText": "Votre réponse doit contenire un oui ou un non, veuillez reformuler."}'));
    } else {
      app.set('response1', query);
      console.log(app.get('response1'));
      var rep = questions[2];
      sendResponse(res, rep)
    }
  } else if (!app.get('response2')) {
    if (checkOuiNon(questions[2], query) == false) {
      res.send(JSON.parse('{ "speech": "Votre réponse doit contenire un oui ou un non, veuillez reformuler.", "displayText": "Votre réponse doit contenire un oui ou un non, veuillez reformuler."}'));
    } else {
      app.set('response2', query);
      console.log(app.get('response2'));
      var rep = questions[3];
      sendResponse(res, rep)
    }
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
          var myrep = [app.get('response0'), app.get('response1'), app.get('response2'), query];
          authorize(JSON.parse(content), postFormulaire, myrep);
      });
      res.send(JSON.parse('{ "speech": "Formulaire terminé", "displayText": "formualire terminé", "data": { "google": {"expect_user_response": false}}}'));
  }
}

export{
  askQuestions
};
