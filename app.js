require('dotenv').config()
const apiRoutes = require('./routes/api.js');
const pageRoutes = require('./routes/pages.js');
const auth = require('./routes/auth.js');

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const MongoClient = require('mongodb').MongoClient;

// Database url variable
const url = process.env.DB;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

MongoClient.connect(url, {useNewUrlParser: true}, (err, client) => {

  const db = client.db('fccprojects');

  auth(app, db);

  apiRoutes(app, db);

  pageRoutes(app);

  const listener = app.listen(process.env.PORT || 3000, function() {
    console.log('Your app is listening on port ' + listener.address().port);
  });

});
