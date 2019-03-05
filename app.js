require('dotenv').config()
const apiRoutes = require('./routes/api');
const userRoutes = require('./routes/users');
const pageRoutes = require('./routes/pages');
const auth = require('./routes/auth');

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
app.use(flash());

MongoClient.connect(url, {useNewUrlParser: true}, (err, client) => {

  const db = client.db('fccprojects');

  auth(app, db);

  userRoutes(app, db);

  apiRoutes(app, db);

  pageRoutes(app, pageMessage);

  const listener = app.listen(process.env.PORT || 3000, function() {
    console.log('Your app is listening on port ' + listener.address().port);
  });

});
