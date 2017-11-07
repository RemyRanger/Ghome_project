var express = require('express')
  , bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

app.post('/', function(request, response){
  console.log(JSON.stringify(request.body.query));      // your JSON
   response.send(JSON.stringify(request.body));    // echo the result back
});


app.listen(3000);
