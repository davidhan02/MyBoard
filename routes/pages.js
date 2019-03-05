const request = require('request');
const passport = require('passport');

// Define function ensureAuthenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  // Redirect if not authenticated
  res.redirect('/');
};

let pageMessage = '';

module.exports = function(app, pageMessage) {

  app.route('/')
  .get( (req, res) => {
    const board = 'general';
    let username = 'Log in first';
    if (req.isAuthenticated()) {
        username = req.user.username;
    }
    const options = {
      baseUrl: 'https://nameless-refuge-84035.herokuapp.com',
      url: '/api/threads/' + board,
      method: 'GET'
    };
    request(options, (err, response, body) => {
      if (err) res.send(err);
      // Make sure you change the string to JSON object
      res.render('index', {
        posts: JSON.parse(body),
        board: board,
        message: pageMessage,
        username: username
      });
    });
  });

  app.route('/b/:board/')
  .get(ensureAuthenticated, (req, res) => {
    const board = req.params.board;
    const options = {
      baseUrl: 'https://nameless-refuge-84035.herokuapp.com',
      url: '/api/threads/' + board,
      method: 'GET'
    };
    request(options, (err, response, body) => {
      if (err) res.send(err);
      // Make sure you change the string to JSON Object
      res.render('board', {
        posts: JSON.parse(body),
        board: board,
        message: pageMessage,
        username: req.user.username
      });
    })
  });

  app.route('/b/:board/:threadId')
  .get(ensureAuthenticated, (req, res) => {
    const board = req.params.board;
    const threadId = req.params.threadId;
    const options = {
      baseUrl: 'https://nameless-refuge-84035.herokuapp.com',
      url: '/api/replies/' + board,
      qs: {
        thread_id: threadId
      },
      method: 'GET'
    }
    request(options, (err, response, body) => {
      if (err) res.send(err);
      res.render('thread', {
        // For some reason heroku returns this inside a pair of []
        post: JSON.parse(body)[0],
        board: board,
        threadId: threadId,
        username: req.user.username
      });
    });
  });

  //404 Not Found Middleware
  app.use( (req, res, next) => {
    res.status(404)
      .type('text')
      .send('Not Found');
  });
}
